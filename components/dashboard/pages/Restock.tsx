// Halaman Restock (utama): list stok dengan CRITICAL/REORDER di atas,
// area "Berhenti beli" untuk OVERSTOCK & DEAD, panel "mengapa" per baris.

import { useMemo, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  PRODUCTS, sortedActionable, stopBuying, overlaysOf, daysOfStock,
  fmtNum, fmtIDR, fmtDays, type Product, type StatusKey, type Channel, STATUS,
} from '../data';
import { StatusBadge, OverlayBadges, WhyPanel, Num } from '../components';
import { IconWhy, IconSearch, IconClose } from '../icons';

interface ApiRecommendationItem {
  product_id: string;
  name?: string;
  sku?: string;
  channel?: Channel;
  state: string;
  overlays?: string[];
  reorder_point?: number;
  safety_stock?: number;
  suggested_qty?: number;
  price?: number;
  why?: {
    on_hand?: number;
    mu?: number;
    lead_time_days?: number;
    lead_time_assumed?: boolean;
  };
}

interface ApiRecommendationsResponse {
  items?: ApiRecommendationItem[];
}

function mapApiToProduct(item: ApiRecommendationItem): Product {
  const why = item.why || {};
  return {
    sku: item.sku || item.product_id,
    name: item.name || 'Produk',
    channel: item.channel || 'Shopee',
    onHand: why.on_hand ?? 0,
    avgDaily: why.mu ?? 0,
    leadTimeDays: why.lead_time_days ?? 5,
    leadTimeAssumed: Boolean(why.lead_time_assumed ?? true),
    safetyStock: item.safety_stock ?? 0,
    rop: item.reorder_point ?? 0,
    suggestedQty: item.suggested_qty ?? 0,
    lastSyncDaysAgo: item.overlays?.includes('STALE') ? 8 : 0,
    status: (item.state as StatusKey) || 'INSUFFICIENT_DATA',
    price: item.price ?? 25000,
  };
}

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

export function RestockPage({ mode = 'demo', onGoUpload }: { mode?: 'demo' | 'live'; onGoUpload?: () => void }) {
  const [why, setWhy] = useState<Product | null>(null);
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'reorder' | 'stop'>('all');

  useEffect(() => {
    if (mode === 'live') {
      setLoading(true);
      apiFetch<ApiRecommendationsResponse>('/v1/recommendations')
        .then((res) => {
          if (res?.items) {
            setLiveProducts(res.items.map(mapApiToProduct));
          } else {
            setLiveProducts([]);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLiveProducts(null);
    }
  }, [mode]);

  const activeProducts = useMemo(() => {
    return mode === 'live' ? (liveProducts ?? []) : PRODUCTS;
  }, [mode, liveProducts]);

  const actionable = useMemo(() => sortedActionable(activeProducts), [activeProducts]);
  const stop = useMemo(() => stopBuying(activeProducts), [activeProducts]);

  const filteredActionable = useMemo(() => {
    return actionable.filter((p) => {
      if (filter === 'critical' && p.status !== 'CRITICAL') return false;
      if (filter === 'reorder' && p.status !== 'REORDER') return false;
      if (filter === 'stop') return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [actionable, search, filter]);

  const filteredStop = useMemo(() => {
    if (filter === 'critical' || filter === 'reorder') return [];
    return stop.filter((p) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [stop, search, filter]);

  const todayStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return 'Prioritas Pemesanan';
    }
  }, []);

  const criticalCount = activeProducts.filter((p) => p.status === 'CRITICAL').length;
  const reorderCount = activeProducts.filter((p) => p.status === 'REORDER').length;
  const restockValue = activeProducts.reduce((s, p) => s + (overlaysOf(p).negative ? 0 : p.suggestedQty * p.price), 0);
  const staleCount = activeProducts.filter((p) => overlaysOf(p).stale).length;

  const totalFiltered = filteredActionable.length + filteredStop.length;

  return (
    <div className="page">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>Dashboard</b> · {todayStr}</p>
        <h1 className="page-title">Restock</h1>
        <p className="page-sub">Barang yang perlu dipesan dulu ada di atas. Angka dihitung dari laju laku tiap SKU.</p>
      </header>

      <section className="kpi-strip" data-reveal="kids" aria-label="Ringkasan restock">
        <div className="kpi kpi-critical" onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')} style={{ cursor: 'pointer' }}>
          <span className="kpi-label">{STATUS.CRITICAL.label}</span>
          <Num strong>{fmtNum(criticalCount)}</Num>
          <span className="kpi-sub">SKU habis sebelum pesanan tiba</span>
        </div>
        <div className="kpi kpi-reorder" onClick={() => setFilter(filter === 'reorder' ? 'all' : 'reorder')} style={{ cursor: 'pointer' }}>
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

      <div className="filter-controls" data-reveal>
        <div className="search-box">
          <IconSearch size={16} />
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama produk atau SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian">
              <IconClose size={14} />
            </button>
          )}
        </div>
        <div className="filter-pills" role="radiogroup" aria-label="Filter status">
          <button
            role="radio"
            aria-checked={filter === 'all'}
            className={`filter-pill${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Semua
          </button>
          <button
            role="radio"
            aria-checked={filter === 'critical'}
            className={`filter-pill pill-critical${filter === 'critical' ? ' active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Segera pesan ({criticalCount})
          </button>
          <button
            role="radio"
            aria-checked={filter === 'reorder'}
            className={`filter-pill pill-reorder${filter === 'reorder' ? ' active' : ''}`}
            onClick={() => setFilter('reorder')}
          >
            Waktunya pesan ({reorderCount})
          </button>
          <button
            role="radio"
            aria-checked={filter === 'stop'}
            className={`filter-pill${filter === 'stop' ? ' active' : ''}`}
            onClick={() => setFilter('stop')}
          >
            Berhenti beli ({stop.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Memuat data rekomendasi restock dari server…
        </div>
      ) : mode === 'live' && activeProducts.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center', background: 'var(--surface)',
          border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)',
          display: 'grid', gap: '14px', justifyItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Toko Anda Belum Memiliki Data Produk</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '48ch', margin: 0 }}>
            Unggah file export pesanan (Shopee atau TikTok Shop) lewat menu <strong>Upload</strong> agar engine Laku dapat menghitung laju penjualan dan titik pesan ulang (ROP) produk Anda.
          </p>
          {onGoUpload && (
            <button className="btn btn-primary" onClick={onGoUpload} type="button">
              Buka Menu Upload Sekarang →
            </button>
          )}
        </div>
      ) : totalFiltered === 0 ? (
        <div className="stock-empty" data-reveal>
          <p>Tidak ada produk yang cocok dengan pencarian <strong>&ldquo;{search}&rdquo;</strong>.</p>
          <button className="btn btn-outline" onClick={() => { setSearch(''); setFilter('all'); }} style={{ minHeight: '36px', fontSize: '13px' }}>
            Reset pencarian
          </button>
        </div>
      ) : (
        <>
          {filteredActionable.length > 0 && (
            <section aria-labelledby="perlu-dipesan">
              <h2 id="perlu-dipesan" className="section-title">Perlu dipesan ({filteredActionable.length})</h2>
              <ul className="stock-list">
                {filteredActionable.map((p) => <StockRow key={p.sku} p={p} onWhy={setWhy} />)}
              </ul>
            </section>
          )}

          {filteredStop.length > 0 && (
            <section className="stop-zone" data-reveal aria-labelledby="berhenti-beli">
              <div className="stop-head">
                <h2 id="berhenti-beli" className="section-title">Berhenti beli ({filteredStop.length})</h2>
                <p className="stop-sub">Stok berlebih atau tidak laku — tahan dulu uangnya, jangan pesan ulang.</p>
              </div>
              <ul className="stock-list stock-list-muted">
                {filteredStop.map((p) => <StockRow key={p.sku} p={p} onWhy={setWhy} />)}
              </ul>
            </section>
          )}
        </>
      )}

      <WhyPanel product={why} onClose={() => setWhy(null)} />
    </div>
  );
}
