# Laku — Demand-Driven Restock Engine

<div align="center">

**"Tau apa yang bakal laku, sebelum stokmu habis."**
*Restock Engine untuk Seller Multi-Marketplace (Shopee, TikTok Shop, Tokopedia)*

[![CI](https://img.shields.io/badge/CI-Passing-059669?style=flat&logo=githubactions)](https://github.com/MuaraAI/laku/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Location](https://img.shields.io/badge/Location-Pontianak%2C_Indonesia-072033)](https://laku.muaraai.com)

[![Buka Aplikasi](https://img.shields.io/badge/Buka_Aplikasi-laku.muaraai.com-0369A1?style=for-the-badge&logo=vercel)](https://laku.muaraai.com)
[![Coba Demo](https://img.shields.io/badge/Coba_Demo-Dashboard-7C3AED?style=for-the-badge&logo=googlechrome)](https://laku.muaraai.com/dashboard)
[![Telemetri](https://img.shields.io/badge/Telemetri-API_Real_Time-059669?style=for-the-badge&logo=fastapi)](https://api.muaraai.com/v1/laku/v1/stats)

</div>

---

## Tim Pengembang

<div align="center">

| | |
|:---:|:---:|
| [<img src="https://github.com/Curzyori.png" width="90" alt="Yuken Velino"/>](https://github.com/Curzyori) | [<img src="https://github.com/MyKineID.png" width="90" alt="Jioo"/>](https://github.com/MyKineID) |
| **[Yuken Velino](https://github.com/Curzyori)** — Kapten Tim | **[Jioo](https://github.com/MyKineID)** — Lead Frontend & UI/UX |
| Arsitektur sistem, core engine, code review | Desain antarmuka, landing page, aksesibilitas web |
| 82 commit | 16 commit |
| [<img src="https://github.com/Seeyaa77.png" width="90" alt="Muhammad Raffli Aldiansyah"/>](https://github.com/Seeyaa77) | [<img src="https://github.com/kabayy-sys.png" width="90" alt="Raken"/>](https://github.com/kabayy-sys) |
| **[Muhammad Raffli Aldiansyah (Bob)](https://github.com/Seeyaa77)** — Backend & Security | **[Raken](https://github.com/kabayy-sys)** — Product & Business |
| Audit keamanan, parser marketplace, infrastruktur VPS | Inisiator ide, riset bisnis UMKM, video demo & proposal |
| 7 commit | 3 commit |

*Universitas Bina Sarana Informatika (UBSI) Kampus Kota Pontianak — total 108 commit sejak rilis 5 Oktober 2026.*

</div>

---

## Tentang Laku

Laku adalah restock engine untuk seller UMKM yang jualan di lebih dari satu marketplace sekaligus (pilot: Pontianak, Kalimantan Barat). Cukup unggah file export CSV atau XLSX dari Seller Center, sistem langsung merapikan semua transaksi ke satu database, menghitung laju penjualan, lalu memberi rekomendasi restock yang bisa dipercaya.

Karya ini diajukan untuk **Digital Innovation Challenge SIFEST 2026** — Track Digital Economy, oleh tim **MuaraAI**.

### Masalah yang Diselesaikan

1. **Buta stok lintas channel.** Stok gudang bisa habis di satu channel saat channel lain tiba-tiba ramai, karena seller tidak punya data gabungan.
2. **Modal kerja macet di stok mati.** Restock tanpa hitungan membuat uang tertimbun di barang yang lambat laku.
3. **Rekap manual makan waktu.** Seller menghabiskan 3–5 jam per minggu mencocokkan export spreadsheet yang formatnya berbeda-beda.

### Cara Kerja Singkat

1. Seller mengunggah file export penjualan (CSV/XLSX) dari masing-masing marketplace.
2. Parser merapikan semua transaksi ke satu database. Data duplikat otomatis dikenali dan tidak dihitung dua kali.
3. Engine menghitung laju penjualan riil (*velocity*), titik pemesanan ulang (ROP), dan stok pengaman (safety stock) memakai rumus inventori standar Silver-Peterson.
4. Dashboard menampilkan rekomendasi jelas: apa yang harus dipesan, berapa banyak, dan apa yang sebaiknya berhenti dibeli.

---

## Arsitektur Sistem

```mermaid
flowchart LR
    subgraph MKT["Marketplace"]
        SH["Shopee"]
        TK["TikTok Shop"]
        TP["Tokopedia"]
    end
    subgraph LAKU["Laku"]
        UP["Upload CSV/XLSX"] --> PS["Parser & Normalisasi"]
        PS --> DB[("Supabase PostgreSQL")]
        DB --> EN["Engine Perhitungan<br/>velocity / ROP / safety stock"]
        EN --> DW["Dashboard Next.js"]
    end
    MKT --> UP
    DW --> SL["Seller UMKM"]
```

### Pilar Utama

1. **Perhitungan matematis, bukan tebakan AI.** Semua rekomendasi dihitung dengan rumus inventori standar Silver-Peterson (EOQ/ROP) dan rekap alokasi voucher proporsional. Bukan wrapper ChatGPT, jadi tidak ada angka karangan.
2. **Privasi pembeli terjaga (UU PDP No. 27/2022).** Nama, nomor telepon, dan alamat mentah dibuang saat parsing dan tidak pernah disimpan di database, log, maupun laporan error. Hanya agregasi wilayah yang disimpan.
3. **Dedup idempoten lintas marketplace.** Kunci unik 6 kolom: `seller_id + source_system + sales_channel + shop_id + order_id + line_key`. File yang diunggah ulang tidak akan menduplikasi transaksi.
4. **Dashboard dua mode.** Mode Demo bisa langsung dieksplorasi tanpa login (10 SKU contoh). Mode Toko Saya terhubung ke database asli via JWT Supabase dengan wizard onboarding.
5. **Autentikasi fleksibel.** Google OAuth 2.0 atau email magic link (OTP 6 digit). Akun baru otomatis mendapat workspace toko lewat trigger database.

### Struktur Repositori

```
laku/
├── app/                        # Next.js 15 App Router (Web & Dashboard)
│   ├── (marketing)/            # Landing page, Syarat & Ketentuan, Kebijakan Privasi
│   ├── (auth)/                 # Halaman Login (Google OAuth & Magic Link)
│   ├── (dashboard)/            # Dashboard terintegrasi (/dashboard)
│   └── auth/callback/          # Handler OAuth & OTP
├── components/                 # Komponen UI (Landing, Dashboard, Auth)
├── constants/id.ts             # Sumber teks UI Bahasa Indonesia terpusat
├── backend/                    # Core Engine Service (FastAPI)
│   ├── app/routers/            # Endpoint: /imports, /recommendations, /stock, /recap, /me, /stats
│   ├── app/services/           # Engine perhitungan, recap, ledger, parser marketplace
│   ├── app/middleware/         # Rate limiting token bucket
│   ├── configs/channels/       # Pemetaan kolom marketplace (YAML)
│   ├── supabase/migrations/    # Skema SQL + RLS policies + RPC
│   └── tests/                  # Test suite pytest (188 tests)
├── DESIGN.md                   # Spesifikasi Design System (Ledger Rail)
└── docs/                       # Materi proposal & submission SIFEST 2026
```

### Stack Teknologi

| Komponen | Teknologi | Deployment |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind v4 | Vercel |
| Backend API | Python 3.12, FastAPI, Pydantic v2 | VPS + PM2 + Caddy |
| Database | PostgreSQL 17 + Row Level Security | Supabase (Singapore) |
| Auth | Google OAuth + Magic Link SMTP | Supabase Auth |
| Cache | Redis (database terisolasi) | VPS Linux |
| Testing | Pytest, AnyIO, Vitest | GitHub Actions CI |

---

## Panduan Instalasi Lokal

Prasyarat: Node.js >= 20, Python >= 3.12, Git.

```bash
git clone https://github.com/MuaraAI/laku.git
cd laku
```

Frontend (Next.js):

```bash
npm install
cp .env.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Buka `http://localhost:3000`.

Backend (FastAPI):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8400
```

API aktif di `http://127.0.0.1:8400`, cek kesehatan di `/health`.

---

## Pengujian

Test berfokus pada perilaku eksternal: parser fixtures, dedup idempoten, engine golden test, RLS isolation, dan role guard.

```bash
# Seluruh test suite backend (188 tests)
cd backend && pytest tests/ -v

# Build & lint frontend
npm run lint
npm run build
```

Semua commit di branch `main` wajib lulus pemeriksaan otomatis GitHub Actions CI.

---

## Kontak & Dukungan

- **Email Resmi:** [support@laku.muaraai.com](mailto:support@laku.muaraai.com)
- **Alamat / Domisili:** Pontianak, Kalimantan Barat, Indonesia
- **Komunitas:** [MuaraAI GitHub](https://github.com/MuaraAI)

---

## Lisensi

Proyek ini dilisensikan di bawah lisensi **Apache-2.0** — lihat berkas [LICENSE](LICENSE).
Nama *"Laku"* dan logo *MuaraAI* adalah merek dagang milik MuaraAI (lihat [NOTICE](NOTICE)).
