// Komponen bersama: badge status (warna tint + teks + ikon + label),
// angka bisnis (mono tabular, rata kanan), chip overlay, dan panel "Mengapa".

import { useEffect, useRef, useState } from 'react';
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
  const demandLead = p.avgDaily * p.leadTimeDays;

  return (
    <div className={`panel-backdrop${closing ? ' closing' : ''}`} onClick={close} role="presentation">
      <div className="why-panel" role="dialog" aria-modal="true" aria-label={`Mengapa angka restock ${p.name}`}
        ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Mengapa angka ini?</p>
            <h3 className="panel-title">{p.name}</h3>
            <p className="panel-sub num num-left">{p.sku} · {p.channel}</p>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Tutup panel"><IconClose size={18} /></button>
        </div>

        {o.negative ? (
          <div className="panel-note negative-note">
            <strong>Stok tercatat minus (<Num>{fmtNum(p.onHand)}</Num> unit).</strong>
            {' '}Laku menyembunyikan saran restock dulu. Cocokkan stok aktual lewat halaman Upload atau stok opname,
            lalu perbarui saldo supaya rekomendasi bisa dihitung lagi.
          </div>
        ) : (
          <ol className="why-steps">
            <li>
              <span className="why-label">Penjualan rata-rata per hari</span>
              <Num strong>{fmtNum1(p.avgDaily)} unit/hari</Num>
              <span className="why-desc">Dihitung dari riwayat pesanan yang sudah diunggah.</span>
            </li>
            <li>
              <span className="why-label">Lead time supplier {p.leadTimeAssumed && <AssumsiBadge />}</span>
              <Num strong>{fmtNum(p.leadTimeDays)} hari</Num>
              <span className="why-desc">
                {p.leadTimeAssumed
                  ? 'Nilai bawaan aplikasi. Konfirmasi lead time asli supplier supaya hitungan pas.'
                  : 'Sudah dikonfirmasi saat onboarding.'}
              </span>
            </li>
            <li>
              <span className="why-label">Kebutuhan selama lead time</span>
              <Num strong>{fmtNum1(p.avgDaily)} × {fmtNum(p.leadTimeDays)} = {fmtNum1(demandLead)} unit</Num>
              <span className="why-desc">Perkiraan stok yang habis sebelum pesanan baru tiba.</span>
            </li>
            <li>
              <span className="why-label">Stok pengaman</span>
              <Num strong>+{fmtNum(p.safetyStock)} unit</Num>
              <span className="why-desc">Bantalan kalau penjualan tiba-tiba naik atau supplier telat.</span>
            </li>
            <li className="why-total">
              <span className="why-label">Titik pesan ulang (ROP)</span>
              <Num strong>{fmtNum1(demandLead)} + {fmtNum(p.safetyStock)} = {fmtNum(p.rop)} unit</Num>
              {Math.abs(demandLead + p.safetyStock - Math.round(demandLead + p.safetyStock)) > 1e-9 && (
                <span className="why-desc">Dibulatkan ke atas, karena stok dihitung per unit utuh.</span>
              )}
              <span className="why-desc">
                Stok saat ini <Num>{fmtNum(p.onHand)}</Num> unit, {p.onHand <= p.rop ? 'sudah di bawah titik pesan. Waktunya order.' : 'masih di atas titik pesan.'}
              </span>
            </li>
            {p.suggestedQty > 0 && (
              <li className="why-total accent">
                <span className="why-label">Saran jumlah pesanan</span>
                <Num strong>{fmtNum(p.suggestedQty)} unit · ≈ {fmtIDR(p.suggestedQty * p.price)}</Num>
                <span className="why-desc">Cukup untuk ±30 hari ke depan berdasarkan laju penjualan sekarang.</span>
              </li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}
