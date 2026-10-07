# Laku API — Core Engine Service

Laku API adalah backend microservice berbasis **FastAPI (Python 3.12)** yang menggerakkan engine deterministik untuk rekomendasi restock multi-marketplace, normalisasi data in-memory, dan rekapitulasi penjualan pro-rata.

Deploy produksi aktif di Linux VPS (`curzy-vps-tencent`) berjalan via PM2 (port 8400) di balik reverse proxy Caddy di `https://api.muaraai.com/v1/laku/*`.

---

## 🏛️ Arsitektur Direktori

```
backend/
├── app/
│   ├── main.py                 # FastAPI application, exception handlers, rate limiter, CORS
│   ├── config.py               # Pydantic Settings & environment variables loader
│   ├── deps/
│   │   ├── auth.py             # RS256 & ES256 (ECC) JWT decoding via JWKS Supabase, RBAC
│   │   └── settings.py         # Dependency injection settings
│   ├── middleware/
│   │   └── rate_limit.py       # In-memory sliding window rate limiter (120 read/min, 10 write/min)
│   ├── routers/
│   │   ├── imports.py          # Upload multi-channel, staging, preview, dan konfirmasi batch
│   │   ├── recommendations.py  # Output kalkulasi engine restock §9A
│   │   ├── stock.py            # Pencatatan kartu stok, saldo awal, dan mutasi barang
│   │   ├── recap.py            # Rekapitulasi penjualan konsolidasi §9D (Owner only)
│   │   ├── me.py               # Wizard status onboarding, settings lead time, toggle channel
│   │   └── stats.py            # Telemetri publik engine dan status platform real-time
│   └── services/
│       ├── engine.py           # Core kalkulasi deterministik Silver-Peterson ROP & Safety Stock §9A
│       ├── recap.py            # Kalkulasi rekap omzet, retur, alokasi voucher pro-rata §9D
│       ├── stock_ledger.py     # Logika kalkulasi on_hand stok fisik & audit trail
│       ├── import_pipeline.py  # Orkestrasi alur upload → parsing → deduplikasi → staging
│       ├── imports_store.py    # Abstraksi penyimpanan batch & order_lines (Supabase & In-Memory)
│       └── parsers/
│           ├── shopee.py       # Parser Shopee CSV & XLSX (alignment score ragged-row, PII strip)
│           ├── tiktok.py       # Parser TikTok Shop CSV & XLSX (numeric-cell guard, PII strip)
│           └── tokopedia.py    # Parser Tokopedia CSV & XLSX (PII strip, invoice mapper)
├── configs/channels/           # Konfigurasi deklaratif kolom export marketplace (YAML)
│   ├── shopee.yaml             # Kolom ekspor Shopee Seller Centre
│   ├── tiktok_shop.yaml        # Kolom ekspor TikTok Shop Seller Center
│   └── tokopedia.yaml          # Kolom ekspor Tokopedia Seller Dashboard
├── supabase/migrations/        # Migrasi SQL database Supabase (0001–0015)
├── mock/                       # Mock server independen untuk pengembangan frontend
└── tests/                      # Test suite pytest (188 passing tests)
```

---

## ⚙️ Formula Deterministik (§9A & §9D PRD)

Backend Laku **tidak menggunakan AI generatif / LLM** untuk menghitung angka keuangan maupun persediaan barang:

### 1. Reorder Point (ROP) & Safety Stock (§9A)
$$\text{Demand Selama Lead Time} = \mu \times L$$
$$\text{Safety Stock (SS)} = z \times \sigma \times \sqrt{L}$$
$$\text{Reorder Point (ROP)} = (\mu \times L) + \text{SS}$$

Di mana:
- $\mu$: Laju penjualan harian rata-rata (*daily velocity*) dari pesanan berstatus *eligible* (`completed` / `in_progress`).
- $L$: Lead time pemasok (hari) dari supplier ke gudang lokal.
- $z$: Faktor z-score berdasarkan target *service level* (default $0.95 \rightarrow z = 1.645$).
- $\sigma$: Standar deviasi fluktuasi permintaan harian dengan penyesuaian hari stok habis (*stockout-day adjustment*).

### 2. Status Urgensi Produk (Mutually Exclusive)
1. **CRITICAL**: Stok di tangan $\le \mu \times L$ (stok diproyeksikan habis sebelum pesanan tiba).
2. **REORDER**: Stok di tangan $\le \text{ROP}$ (waktunya memesan ulang).
3. **OK**: Stok di tangan $> \text{ROP}$ dan memiliki penjualan aktif.
4. **OVERSTOCK**: Sisa hari persediaan $> 60$ hari.
5. **DEAD**: Nol penjualan selama $> 60$ hari riwayat transaksi.
6. **INSUFFICIENT_DATA**: Riwayat pesanan $< 30$ hari atau total unit terjual $< 5$.

### 3. Rekapitulasi Penjualan & Alokasi Voucher Pro-Rata (§9D)
Voucher tingkat pesanan dialokasikan secara proporsional (*pro-rata*) ke setiap baris barang berdasarkan kontribusi nilai kotornya:
$$\text{Alokasi Diskon Baris} = \text{Voucher Pesanan} \times \left( \frac{\text{Nilai Kotor Baris}}{\text{Total Nilai Kotor Pesanan}} \right)$$

---

## 📡 Daftar Endpoint API

### Endpoint Publik (Tanpa Autentikasi)
- `GET /health`: Pemeriksaan kesehatan service (200 OK).
- `GET /stats` & `GET /v1/stats`: Telemetri real-time agregat platform via Supabase RPC `get_platform_stats()`.

### Endpoint Terproteksi (Wajib Header `Authorization: Bearer <JWT>`)
| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `POST` | `/v1/imports` | Owner, Operator | Unggah file ekspor penjualan (CSV/XLSX, multipart). |
| `GET` | `/v1/imports/{batch_id}/preview` | Owner, Operator | Pratinjau kalkulasi dedup (baris baru, update, tidak berubah, masalah). |
| `POST` | `/v1/imports/{batch_id}/confirm` | Owner | Komit transaksi staging ke database produksi via RPC `upsert_order_lines`. |
| `POST` | `/v1/imports/{batch_id}/cancel` | Owner, Operator | Batalkan batch impor dan bersihkan baris staging. |
| `GET` | `/v1/recommendations` | Owner, Operator | Daftar saran restock terurut urgensi berdasarkan engine §9A. |
| `GET` | `/v1/recommendations/{product_id}` | Owner, Operator | Rincian parameter kalkulasi matematika produk (ROP, SS, mu, sigma). |
| `GET` | `/v1/stock` | Owner, Operator | Status stok seluruh SKU produk, on-hand, dan indikator selisih. |
| `POST` | `/v1/stock/movements` | Owner, Operator | Catat mutasi penerimaan barang masuk, penyesuaian, atau write-off. |
| `POST` | `/v1/stock/opening` | Owner | Set saldo awal stok fisik gudang (JSON atau template XLSX). |
| `GET` | `/v1/recap` | **Owner Only** | Rekap omzet kotor, retur, diskon, dan tren harian konsolidasi §9D (Operator $\rightarrow$ 403). |
| `GET` | `/v1/me/onboarding-status` | Owner, Operator | Status kelengkapan wizard onboarding toko pengguna. |
| `POST` | `/v1/me/settings` | Owner | Perbarui lead time supplier, review days, dan target service level. |

---

## 🛠️ Menjalankan Backend Lokal

```bash
# 1. Navigasi ke direktori backend
cd backend

# 2. Buat & aktifkan virtual environment
python -m venv .venv
source .venv/bin/activate  # Di Windows: .venv\Scripts\activate

# 3. Instal dependensi
pip install -r requirements.txt

# 4. Konfigurasi Environment
cp ../.env.example .env
# Edit variabel: SUPABASE_URL, SUPABASE_SERVICE_KEY, ENV=dev

# 5. Jalankan Uvicorn Dev Server
uvicorn app.main:app --reload --port 8400
```

Dokumentasi interaktif OpenAPI/Swagger aktif di `http://127.0.0.1:8400/docs` (hanya aktif jika `ENV=dev`).

---

## 🧪 Eksekusi Test Suite (139 Tests)

Backend Laku memiliki cakupan pengujian komprehensif tanpa ketergantungan mock jaringan eksternal:

```bash
# Jalankan seluruh unit & integration test
pytest tests/ -v

# Jalankan golden test formula engine §9A
pytest tests/test_engine_golden.py -v

# Jalankan golden test rekap penjualan §9D
pytest tests/test_recap_golden.py -v

# Jalankan pengujian parser Shopee & TikTok Shop
pytest tests/test_parser_shopee.py tests/test_parser_tiktok.py -v
```

Hasil uji per 6 Oktober 2026: **139 passed, 0 failures** dalam 2.4 detik.
