// ─────────────────────────────────────────────────────────────────────────────
// Laku · MuaraAI — data model, status engine, dan data mock MVP (frontend only).
// Semua angka bisnis diformat via helper di bawah dan WAJIB dirender dengan
// font JetBrains Mono + tabular-nums + rata kanan (class .num di styles.css).
// ─────────────────────────────────────────────────────────────────────────────

export type StatusKey =
  | 'CRITICAL'
  | 'REORDER'
  | 'OK'
  | 'OVERSTOCK'
  | 'DEAD'
  | 'INSUFFICIENT_DATA';

export interface StatusSpec {
  key: StatusKey;
  /** Label teks Bahasa Indonesia — status tidak boleh hanya warna. */
  label: string;
  /** Nama ikon inline-SVG (lihat icons.tsx). */
  icon: 'alert' | 'bell' | 'check' | 'boxes' | 'moon' | 'hourglass';
}

export const STATUS: Record<StatusKey, StatusSpec> = {
  CRITICAL:          { key: 'CRITICAL',          label: 'Segera pesan',    icon: 'alert' },
  REORDER:           { key: 'REORDER',           label: 'Waktunya pesan',  icon: 'bell' },
  OK:                { key: 'OK',                label: 'Aman',            icon: 'check' },
  OVERSTOCK:         { key: 'OVERSTOCK',         label: 'Stok berlebih',   icon: 'boxes' },
  DEAD:              { key: 'DEAD',              label: 'Tidak laku',      icon: 'moon' },
  INSUFFICIENT_DATA: { key: 'INSUFFICIENT_DATA', label: 'Data belum cukup',icon: 'hourglass' },
};

export type Channel = 'Shopee' | 'TikTok Shop' | 'Tokopedia';
export const CHANNELS: Channel[] = ['Shopee', 'TikTok Shop', 'Tokopedia'];

export interface Product {
  sku: string;
  name: string;
  channel: Channel;
  /** Stok aktual di tangan seller. Bisa minus → overlay NEGATIVE. */
  onHand: number;
  /** Rata-rata penjualan per hari (unit). */
  avgDaily: number;
  /** Lead time supplier (hari). Default 5 = asumsi bawaan aplikasi. */
  leadTimeDays: number;
  /** Apakah lead time masih asumsi bawaan (belum dikonfirmasi seller). */
  leadTimeAssumed: boolean;
  /** Stok pengaman (unit). */
  safetyStock: number;
  /** Reorder point (unit). */
  rop: number;
  /** Saran jumlah restock (unit). Disembunyikan saat overlay NEGATIVE. */
  suggestedQty: number;
  /** Umur data terakhir disinkron (hari). >7 → overlay STALE. */
  lastSyncDaysAgo: number;
  status: StatusKey;
  /** Harga jual rata-rata (Rp). */
  price: number;
}

export interface OverlayInfo {
  stale: boolean;
  negative: boolean;
}

export function overlaysOf(p: Product): OverlayInfo {
  return { stale: p.lastSyncDaysAgo > 7, negative: p.onHand < 0 };
}

export function daysOfStock(p: Product): number {
  if (p.avgDaily <= 0) return Infinity;
  return Math.max(0, p.onHand) / p.avgDaily;
}

// ── Mock data MVP ────────────────────────────────────────────────────────────
// Catatan privasi: nama/HP/alamat pembeli TIDAK pernah disimpan atau ditampilkan.

export const PRODUCTS: Product[] = [
  { sku: 'KOP-GUL-250', name: 'Kopi Gula Aren 250ml', channel: 'Shopee', onHand: 12, avgDaily: 9.4, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 24, rop: 71, suggestedQty: 140, lastSyncDaysAgo: 0, status: 'CRITICAL', price: 18000 },
  { sku: 'TEH-MEL-1L', name: 'Teh Melati Botol 1L', channel: 'TikTok Shop', onHand: 8, avgDaily: 6.1, leadTimeDays: 3, leadTimeAssumed: false, safetyStock: 10, rop: 28, suggestedQty: 90, lastSyncDaysAgo: 1, status: 'CRITICAL', price: 12000 },
  { sku: 'SBL-KRG-100', name: 'Sambal Koreng 100g', channel: 'Shopee', onHand: -4, avgDaily: 4.8, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 12, rop: 36, suggestedQty: 0, lastSyncDaysAgo: 0, status: 'REORDER', price: 15000 },
  { sku: 'MKI-AYM-85', name: 'Mie Keriting Ayam 85g (karton)', channel: 'Tokopedia', onHand: 30, avgDaily: 3.2, leadTimeDays: 7, leadTimeAssumed: false, safetyStock: 11, rop: 34, suggestedQty: 60, lastSyncDaysAgo: 9, status: 'REORDER', price: 96000 },
  { sku: 'KER-TAH-40', name: 'Keripik Tahu Pedas 40g', channel: 'Shopee', onHand: 210, avgDaily: 3.0, leadTimeDays: 4, leadTimeAssumed: true, safetyStock: 6, rop: 18, suggestedQty: 0, lastSyncDaysAgo: 0, status: 'OK', price: 9000 },
  { sku: 'MAD-HTN-500', name: 'Madu Hutan 500g', channel: 'Tokopedia', onHand: 46, avgDaily: 1.1, leadTimeDays: 6, leadTimeAssumed: false, safetyStock: 4, rop: 11, suggestedQty: 0, lastSyncDaysAgo: 2, status: 'OK', price: 85000 },
  { sku: 'BRN-SKG-01', name: 'Beras Singkong 1kg', channel: 'Shopee', onHand: 0, avgDaily: 0, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 0, rop: 0, suggestedQty: 0, lastSyncDaysAgo: 1, status: 'INSUFFICIENT_DATA', price: 21000 },
  { sku: 'SNK-RJM-05', name: 'Snack Rumput Laut (pak 5)', channel: 'TikTok Shop', onHand: 340, avgDaily: 0.6, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 2, rop: 5, suggestedQty: 0, lastSyncDaysAgo: 3, status: 'OVERSTOCK', price: 27500 },
  { sku: 'KAL-DGT-10', name: 'Kaldu Bubuk Daging 10s', channel: 'Shopee', onHand: 260, avgDaily: 0.9, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 3, rop: 8, suggestedQty: 0, lastSyncDaysAgo: 12, status: 'OVERSTOCK', price: 13500 },
  { sku: 'TEH-KNG-20', name: 'Teh Kuning Celup 20s', channel: 'Tokopedia', onHand: 120, avgDaily: 0.0, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 0, rop: 0, suggestedQty: 0, lastSyncDaysAgo: 30, status: 'DEAD', price: 16500 },
  { sku: 'KCP-MNS-300', name: 'Kecap Manis 300ml', channel: 'Shopee', onHand: 64, avgDaily: 0.1, leadTimeDays: 5, leadTimeAssumed: true, safetyStock: 1, rop: 2, suggestedQty: 0, lastSyncDaysAgo: 45, status: 'DEAD', price: 14000 },
];

/** Urutan prioritas list: CRITICAL & REORDER di atas, sisanya menyusul. */
export const STATUS_RANK: Record<StatusKey, number> = {
  CRITICAL: 0, REORDER: 1, INSUFFICIENT_DATA: 2, OK: 3, OVERSTOCK: 4, DEAD: 5,
};

export function sortedActionable(products: Product[]): Product[] {
  return products
    .filter((p) => STATUS_RANK[p.status] <= 3)
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.onHand / Math.max(a.avgDaily, 0.01) - b.onHand / Math.max(b.avgDaily, 0.01));
}

export function stopBuying(products: Product[]): Product[] {
  return products.filter((p) => p.status === 'OVERSTOCK' || p.status === 'DEAD');
}

// ── Format angka bisnis (dirender dengan .num = JetBrains Mono tabular) ──────

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

export const fmtIDR = (n: number) => idr.format(n);
export const fmtNum = (n: number) => num.format(n);
export const fmtNum1 = (n: number) => num1.format(n);
export function fmtDays(d: number): string {
  return d === Infinity ? '∞' : `${num1.format(d)} hr`;
}

// ── Data penjualan (recap) ───────────────────────────────────────────────────

export interface SalesPoint { day: string; omzet: number; transaksi: number; sementara: boolean }

function seededSeries(days: number, base: number, variance: number): SalesPoint[] {
  const out: SalesPoint[] = [];
  const today = new Date('2026-10-06');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const wave = Math.sin(i / 4.2) * 0.5 + Math.sin(i / 9.7 + 2) * 0.5;
    const omzet = Math.round(base * (1 + wave * variance) / 1000) * 1000;
    out.push({
      day: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      omzet,
      transaksi: Math.max(4, Math.round(omzet / 42000)),
      sementara: i < 7, // transaksi 7 hari terakhir berstatus "sementara"
    });
  }
  return out;
}

export const SALES: Record<7 | 30 | 90, SalesPoint[]> = {
  7: seededSeries(7, 2_150_000, 0.35),
  30: seededSeries(30, 1_980_000, 0.42),
  90: seededSeries(90, 1_720_000, 0.5),
};

export interface ChannelSplit { channel: Channel; omzet: number; share: number }
export const CHANNEL_SPLIT: Record<7 | 30 | 90, ChannelSplit[]> = {
  7: [
    { channel: 'Shopee', omzet: 8_940_000, share: 59 },
    { channel: 'TikTok Shop', omzet: 4_120_000, share: 27 },
    { channel: 'Tokopedia', omzet: 2_110_000, share: 14 },
  ],
  30: [
    { channel: 'Shopee', omzet: 34_700_000, share: 58 },
    { channel: 'TikTok Shop', omzet: 16_540_000, share: 28 },
    { channel: 'Tokopedia', omzet: 8_220_000, share: 14 },
  ],
  90: [
    { channel: 'Shopee', omzet: 88_900_000, share: 57 },
    { channel: 'TikTok Shop', omzet: 43_300_000, share: 28 },
    { channel: 'Tokopedia', omzet: 23_500_000, share: 15 },
  ],
};

/** Umur data terlama per channel (hari) untuk Coverage Banner. */
export const DATA_FRESHNESS: { channel: Channel; daysAgo: number }[] = [
  { channel: 'Shopee', daysAgo: 0 },
  { channel: 'TikTok Shop', daysAgo: 3 },
  { channel: 'Tokopedia', daysAgo: 9 }, // >7 → peringatan data usang
];

// ── Upload mock ──────────────────────────────────────────────────────────────

export interface UploadPreview {
  fileName: string;
  channel: Channel;
  rowsRead: number;
  rowsNew: number;
  skuFillRate: number; // persen
  problems: { row: number; issue: string; action: string }[];
}

export function mockPreview(channel: Channel, fileName: string): UploadPreview {
  const base = channel === 'Shopee' ? 1284 : channel === 'TikTok Shop' ? 862 : 540;
  return {
    fileName,
    channel,
    rowsRead: base,
    rowsNew: Math.round(base * 0.18),
    skuFillRate: channel === 'Tokopedia' ? 91.2 : 96.4,
    problems: [
      { row: 214, issue: 'SKU kosong', action: 'Baris dilewati. Lengkapi SKU di file lalu unggah ulang bila baris ini penting.' },
      { row: 577, issue: 'Format tanggal tidak dikenal', action: 'Baris dilewati. Pakai format DD/MM/YYYY sesuai template channel.' },
      { row: 903, issue: 'Jumlah terjual bukan angka', action: 'Baris dilewati. Pastikan kolom kuantitas berisi angka saja.' },
    ],
  };
}

// ── Onboarding copy ──────────────────────────────────────────────────────────

export const UPLOAD_GUIDE: Record<Channel, string[]> = {
  Shopee: [
    'Buka Seller Centre → Penjualan Saya → Unduh laporan pesanan.',
    'Pilih rentang tanggal maksimal 90 hari terakhir.',
    'Ekspor sebagai CSV atau XLSX, lalu unggah di sini.',
  ],
  'TikTok Shop': [
    'Buka Seller Center → Pesanan → Ekspor riwayat pesanan.',
    'Pilih status "Selesai" agar hitungan laku akurat.',
    'Unduh file XLSX, lalu unggah di sini.',
  ],
  Tokopedia: [
    'Buka Seller Dashboard → Statistik → Unduh laporan penjualan.',
    'Pilih periode maksimal 90 hari terakhir.',
    'Simpan sebagai CSV, lalu unggah di sini.',
  ],
};

export const DEFAULT_LEAD_TIME_DAYS = 5; // asumsi bawaan — wajib badge "asumsi"
