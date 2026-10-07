// Komponen bersama: badge status (warna tint + teks + ikon + label),
// angka bisnis (mono tabular, rata kanan), chip overlay, dan panel "Mengapa".

import { useEffect, useRef, useState } from 'react';
import { apiErrors } from '@/constants/id';
import { dashboard } from '@/constants/id';
import { STATUS, type Product, overlaysOf, fmtNum, fmtNum1, fmtIDR } from './data';
import { StatusIcon, IconClose, IconSync, IconScale } from './icons';

/** Angka bisnis — WAJIB mono tabular + rata kanan (aturan tipografi Laku). */
export function Num({ children, align = 'right', strong }: { children: React.ReactNode; align?: 'right' | 'left'; strong?: boolean }) {
  return <span className={`num${align === 'left' ? ' num-left' : ''}${strong ? ' num-strong' : ''}`}>{children}</span>;
}

/** Badge status: tint background + warna teks + ikon + label (ramah buta warna). */
export function StatusBadge({ status, size = 'md' }: { status: keyof typeof STATUS; size?: 'sm' | 'md' }) {
  const s = STATUS[status];
  return (
    <span className={`status-badge st-${s.key}${size === 'sm' ? ' badge-sm' : ''}`}>
      <StatusIcon name={s.icon} size={size === 'sm' ? 13 : 15} />
      <span>{s.label}</span>
    </span>
  );
}

/** Badge "asumsi" — wajib dipasang untuk default bawaan aplikasi. */
export function AssumsiBadge() {
  return <span className="chip chip-asumsi" title="Nilai bawaan aplikasi, belum dikonfirmasi seller">asumsi</span>;
}

/** Chip "sementara" untuk transaksi 7 hari terakhir. */
export function SementaraChip() {
  return <span className="chip chip-sementara">sementara</span>;
}

/** Overlay badges: STALE & NEGATIVE. */
export function OverlayBadges({ p }: { p: Product }) {
  const o = overlaysOf(p);
  return (
    <span className="overlay-badges">
      {o.stale && (
        <span className="chip chip-stale"><IconSync size={12} /> Perlu data terbaru</span>
      )}
      {o.negative && (
        <span className="chip chip-negative"><IconScale size={12} /> Cocokkan stok</span>
      )}
    </span>
  );
}

/** Panel breakdown "Mengapa" — menjelaskan asal angka ROP / saran restock. */
export function WhyPanel({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  // tutup dengan animasi slide-out dulu (class .closing), baru unmount
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };
  useEffect(() => {
    if (!product) return;
    setClosing(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, onClose]);

  if (!product) return null;
  const p = product;
  const o = overlaysOf(p);
  const demandLead = Math.max(0, Math.round(p.rop - p.safetyStock)) || Math.round(p.avgDaily * p.leadTimeDays);

  return (
    <div className={`panel-backdrop${closing ? ' closing' : ''}`} onClick={close} role="presentation">
      <div className="why-panel" role="dialog" aria-modal="true" aria-label={dashboard.whyPanel.ariaLabel(p.name)}
        ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div>
            <p className="panel-kicker">{dashboard.whyPanel.kicker}</p>
            <h3 className="panel-title">{p.name}</h3>
            <p className="panel-sub num num-left">{p.sku} · {p.channel}</p>
          </div>
          <button className="icon-btn" onClick={close} aria-label={dashboard.whyPanel.closeAria}><IconClose size={18} /></button>
        </div>

        {o.negative ? (
          <div className="panel-note negative-note">
            <strong>{dashboard.whyPanel.negativeWarning.lead(p.onHand)}</strong>
            {' '}{dashboard.whyPanel.negativeWarning.body}
          </div>
        ) : (
          <ol className="why-steps">
            <li>
              <span className="why-label">{dashboard.whyPanel.avgDaily.label}</span>
              <Num strong>{fmtNum1(p.avgDaily)} unit/hari</Num>
              <span className="why-desc">{dashboard.whyPanel.avgDaily.desc}</span>
            </li>
            <li>
              <span className="why-label">{dashboard.whyPanel.leadTime.label} {p.leadTimeAssumed && <AssumsiBadge />}</span>
              <Num strong>{fmtNum(p.leadTimeDays)} hari</Num>
              <span className="why-desc">
                {p.leadTimeAssumed
                  ? dashboard.whyPanel.leadTime.assumedDesc
                  : dashboard.whyPanel.leadTime.confirmedDesc}
              </span>
            </li>
            <li>
              <span className="why-label">{dashboard.whyPanel.demandLead.label}</span>
              <Num strong>{fmtNum1(p.avgDaily)} × {fmtNum(p.leadTimeDays)} ≈ {fmtNum(demandLead)} unit</Num>
              <span className="why-desc">{dashboard.whyPanel.demandLead.desc}</span>
            </li>
            <li>
              <span className="why-label">{dashboard.whyPanel.safetyStock.label}</span>
              <Num strong>+{fmtNum(p.safetyStock)} unit</Num>
              <span className="why-desc">{dashboard.whyPanel.safetyStock.desc}</span>
            </li>
            <li className="why-total">
              <span className="why-label">{dashboard.whyPanel.rop.label}</span>
              <Num strong>{fmtNum(demandLead)} + {fmtNum(p.safetyStock)} = {fmtNum(p.rop)} unit</Num>
              <span className="why-desc">
                {p.onHand <= p.rop
                  ? dashboard.whyPanel.rop.statusBelow(p.onHand)
                  : dashboard.whyPanel.rop.statusAbove(p.onHand)}
              </span>
            </li>
            {p.suggestedQty > 0 && (
              <li className="why-total accent">
                <span className="why-label">{dashboard.whyPanel.suggested.label}</span>
                <Num strong>{fmtNum(p.suggestedQty)} unit · ≈ {fmtIDR(p.suggestedQty * p.price)}</Num>
                <span className="why-desc">{dashboard.whyPanel.suggested.desc}</span>
              </li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}

/**
 * Kotak error API dengan aksi yang masuk akal: sesi habis (401) → "Masuk lagi" (coba ulang tidak
 * akan berhasil); selain itu → "Coba lagi".
 */
export function ApiErrorNote({ text, message, onRetry, retryLabel, style }: {
  text: string; message: string; onRetry: () => void; retryLabel: string; style?: React.CSSProperties;
}) {
  const needsLogin = message === apiErrors.unauthorized;
  return (
    <div className="stock-empty api-error" role="alert" style={style}>
      <p className="api-error-text">{text}</p>
      {needsLogin ? (
        <a className="btn btn-primary" href={`/login?next=${encodeURIComponent('/dashboard?mode=live')}`}>{apiErrors.loginAgain}</a>
      ) : (
        <button className="btn btn-primary" onClick={onRetry} type="button">{retryLabel}</button>
      )}
    </div>
  );
}
