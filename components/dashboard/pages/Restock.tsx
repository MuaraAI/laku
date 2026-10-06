// Halaman Restock (utama): list stok dengan CRITICAL/REORDER di atas,
// area "Berhenti beli" untuk OVERSTOCK & DEAD, panel "mengapa" per baris.

import { useMemo, useState } from 'react';
import {
  PRODUCTS, sortedActionable, stopBuying, overlaysOf, daysOfStock,
  fmtNum, fmtIDR, fmtDays, type Product, STATUS,
} from '../data';
import { StatusBadge, OverlayBadges, WhyPanel, Num } from '../components';
import { IconWhy } from '../icons';

function StockRow({ p, onWhy }: { p: Product; onWhy: (p: Product) => void }) {
  const o = overlaysOf(p);
  const dos = daysOfStock(p);
  return (
    <li className="stock-row" data-reveal>
      <div className="stock-main">
        <div className="stock-id">
          <span className="stock-name">{p.name}</span>
          <span className="stock-meta num num-left">{p.sku} · {p.channel}</span>
        </div>
        <div className="stock-flags">
          <StatusBadge status={p.status} />
          <OverlayBadges p={p} />
        </div>
      </div>
      <div className="stock-figures">
        <div className="fig">
          <span className="fig-label">Stok</span>
          <Num strong>{fmtNum(p.onHand)}</Num>
        </div>
        <div className="fig">
          <span className="fig-label">Sisa hari</span>
          <Num>{fmtDays(dos)}</Num>
        </div>
        <div className="fig">
          <span className="fig-label">ROP</span>
          <Num>{fmtNum(p.rop)}</Num>
        </div>
        <div className="fig fig-suggest">
          <span className="fig-label">Saran pesan</span>
          {o.negative
            ? <span className="suggest-hidden" title="Disembunyikan sampai stok dicocokkan">—</span>
            : <Num strong>{p.suggestedQty > 0 ? `${fmtNum(p.suggestedQty)} unit` : '—'}</Num>}
        </div>
        <button className="why-btn" onClick={() => onWhy(p)} aria-label={`Mengapa angka restock ${p.name}`}>
          <IconWhy size={16} /> Mengapa
        </button>
      </div>
    </li>
  );
}

export function RestockPage() {
  const [why, setWhy] = useState<Product | null>(null);
  const actionable = useMemo(() => sortedActionable(PRODUCTS), []);
  const stop = useMemo(() => stopBuying(PRODUCTS), []);

  const criticalCount = PRODUCTS.filter((p) => p.status === 'CRITICAL').length;
  const reorderCount = PRODUCTS.filter((p) => p.status === 'REORDER').length;
  const restockValue = PRODUCTS.reduce((s, p) => s + (overlaysOf(p).negative ? 0 : p.suggestedQty * p.price), 0);
  const staleCount = PRODUCTS.filter((p) => overlaysOf(p).stale).length;

  return (
    <div className="page">
      <header className="page-head" data-reveal>
        <p className="kicker">Dashboard · Selasa, 6 Oktober 2026</p>
        <h1 className="page-title">Restock</h1>
        <p className="page-sub">Barang yang perlu dipesan dulu ada di atas. Angka dihitung dari laju laku tiap SKU.</p>
      </header>

      <section className="kpi-strip" data-reveal="kids" aria-label="Ringkasan restock">
        <div className="kpi kpi-critical">
          <span className="kpi-label">{STATUS.CRITICAL.label}</span>
          <Num strong>{fmtNum(criticalCount)}</Num>
          <span className="kpi-sub">SKU habis sebelum pesanan tiba</span>
        </div>
        <div className="kpi kpi-reorder">
          <span className="kpi-label">{STATUS.REORDER.label}</span>
          <Num strong>{fmtNum(reorderCount)}</Num>
          <span className="kpi-sub">SKU mendekati titik pesan</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Estimasi nilai pesanan</span>
          <Num strong>{fmtIDR(restockValue)}</Num>
          <span className="kpi-sub">Total saran restock periode ini</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Perlu data terbaru</span>
          <Num strong>{fmtNum(staleCount)}</Num>
          <span className="kpi-sub">SKU dengan data usang &gt;7 hari</span>
        </div>
      </section>

      <section aria-labelledby="perlu-dipesan">
        <h2 id="perlu-dipesan" className="section-title">Perlu dipesan</h2>
        <ul className="stock-list">
          {actionable.map((p) => <StockRow key={p.sku} p={p} onWhy={setWhy} />)}
        </ul>
      </section>

      <section className="stop-zone" data-reveal aria-labelledby="berhenti-beli">
        <div className="stop-head">
          <h2 id="berhenti-beli" className="section-title">Berhenti beli</h2>
          <p className="stop-sub">Stok berlebih atau tidak laku — tahan dulu uangnya, jangan pesan ulang.</p>
        </div>
        <ul className="stock-list stock-list-muted">
          {stop.map((p) => <StockRow key={p.sku} p={p} onWhy={setWhy} />)}
        </ul>
      </section>

      <WhyPanel product={why} onClose={() => setWhy(null)} />
    </div>
  );
}
