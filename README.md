# Laku — Demand-Driven Restock Engine

<div align="center">

**"Tau apa yang bakal laku, sebelum stokmu habis."**  
*Restock Engine & Inventory Intelligence untuk Seller Multi-Marketplace (Shopee, TikTok Shop, Tokopedia)*

[![Production Web](https://img.shields.io/badge/Production-laku.muaraai.com-0369A1?style=flat&logo=vercel)](https://laku.muaraai.com)
[![API Status](https://img.shields.io/badge/API-Operational-059669?style=flat&logo=fastapi)](https://api.muaraai.com/v1/laku/health)
[![CI Pipeline](https://img.shields.io/badge/CI-Passing-059669?style=flat&logo=githubactions)](https://github.com/MuaraAI/laku/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Location](https://img.shields.io/badge/Location-Pontianak%2C_Indonesia-072033)](https://laku.muaraai.com)

[**🌐 Buka Aplikasi Live**](https://laku.muaraai.com) • [**📊 Coba Dashboard Demo**](https://laku.muaraai.com/dashboard) • [**⚡ Telemetri Real-Time API**](https://api.muaraai.com/v1/laku/v1/stats) • [**📖 Status Kesehatan API**](https://api.muaraai.com/v1/laku/health)

</div>

---

## 📌 Tentang Laku

**Laku** adalah demand-driven restock engine lokal yang dirancang khusus untuk seller UMKM multi-marketplace di kota regional (pilot: Pontianak, Kalimantan Barat).

### Masalah Nyata Seller Multi-Channel:
1. **Buta Stok Lintas Channel**: Seller jualan di Shopee, TikTok Shop, dan Tokopedia secara bersamaan. Stok gudang lokal sering jebol (*stockout*) di satu channel saat channel lain tiba-tiba ramai.
2. **Uang Kas Mati Tertimbun (*Dead Stock / Overstock*)**: Membeli barang tanpa perhitungan laju penjualan harian membuat modal kerja macet di gudang.
3. **Kelelahan Rekap Manual**: Seller menghabiskan 3–5 jam setiap minggu mencocokkan spreadsheet ekspor yang berantakan, format kolom berbeda-beda, dan diskon voucher voucher yang membingungkan.

### Solusi Laku:
Cukup unggah (*drag & drop*) file export CSV atau XLSX dari masing-masing Seller Center. Engine deterministik Laku langsung menormalisasi transaksi ke dalam 1 database lokal, menghitung laju penjualan riil (*velocity*), Reorder Point (ROP), dan Safety Stock (SS), serta menyajikan rekomendasi restock: **apa yang harus dipesan, berapa banyak, dan apa yang harus berhenti dibeli**.

Karya inovasi digital ini diajukan untuk **Digital Innovation Challenge SIFEST 2026** — Track Digital Economy, oleh tim **MuaraAI** (Universitas Bina Sarana Informatika Pontianak).

---

## 🚀 Keunggulan & Pilar Utama

### 1. 🧮 100% Deterministik — Anti-AI-Wrapper
Laku bukan wrapper ChatGPT yang menebak-nebak angka bisnis. Seluruh saran restock dihitung murni menggunakan formula matematika **Silver-Peterson EOQ/ROP (§9A PRD)** dan rekap penjualan gabungan berbasis alokasi voucher pro-rata (**§9D PRD**). Risiko halusinasi AI adalah **0%**.

### 2. 🔒 Privasi Tanpa Kompromi (UU PDP No. 27/2022)
*Privacy by Design*: Laku mengadopsi prinsip **Parse In-Memory & Zero PII At Rest**. Nama pembeli, nomor telepon (`08xx`), dan alamat jalan mentah dibuang di memori saat file diparsing dan **tidak pernah disimpan** di database, staging, log server, maupun laporan error. Hanya agregasi wilayah (kabupaten/provinsi) yang disimpan untuk statistik regional.

### 3. 🔄 Dedup Idempoten 6-Kolom Lintas Marketplace
Menggunakan dedup key komprehensif:  
`seller_id + source_system + sales_channel + shop_id + order_id + line_key`  
File yang diunggah ulang tidak akan menduplikasi transaksi (`0 new, 0 updated, N unchanged`), dan transaksi dari Shopee maupun TikTok Shop dengan ID serupa tidak akan pernah bertabrakan.

### 4. 🎛️ Dual-Mode Dashboard (Zero-Friction Demo & Live Toko Saya)
* **Mode Demo (Default)**: Juri dan pengunjung dapat langsung mengeksplorasi dashboard interaktif 10 SKU Warung Bu Rina tanpa hambatan login (0 detik friksi).
* **Mode Toko Saya (Live)**: Terhubung langsung ke database dan API backend VPS via token JWT Supabase. Dilengkapi wizard onboarding langkah-demi-langkah dan kunci navigasi pintar sebelum setup selesai.

### 5. 🔑 Autentikasi Fleksibel Multi-Channel
Mendukung dua jalur autentikasi: **Google OAuth 2.0** dan **Email Magic Link (OTP 6-digit)** via Resend SMTP (`support@laku.muaraai.com`). Dilengkapi auto-provisioning database trigger PostgreSQL pada tabel `auth.users` sehingga setiap akun baru otomatis memiliki workspace toko bawaan.

---

## 🏛️ Arsitektur Sistem

```
laku/
├── app/                        # Next.js 15 App Router (Frontend Web & Dashboard)
│   ├── (marketing)/            # Landing page, Syarat & Ketentuan, Kebijakan Privasi
│   ├── (auth)/                 # Halaman Login (Google OAuth & Resend Magic Link)
│   ├── (dashboard)/            # Dashboard terintegrasi (/dashboard) & Scoped Styles
│   └── auth/callback/          # SSR OAuth & OTP token_hash route handler
├── components/                 # Komponen modular UI (Landing, Dashboard, Auth)
├── constants/id.ts             # Sumber kebenaran copy UI Bahasa Indonesia terpusat
├── backend/                    # Core Engine Service (FastAPI)
│   ├── app/routers/            # Endpoints: /imports, /recommendations, /stock, /recap, /me, /stats
│   ├── app/services/           # Engine §9A, Recap §9D, Ledger, Parsers (Shopee, TikTok, Tokopedia)
│   ├── app/middleware/         # Rate limiting token bucket in-memory (XFF anti-spoofing)
│   ├── configs/channels/       # Pemetaan kolom marketplace deklaratif (YAML)
│   ├── supabase/migrations/    # Skema SQL 0001–0013 + RLS policies + RPC functions
│   └── tests/                  # Test suite pytest (145 passing tests)
├── DESIGN.md                   # Spesifikasi resmi Design System v1.0.0 (Ledger Rail)
└── docs/                       # Materi Proposal & Submission SIFEST 2026
```

### Stack Teknologi

| Komponen | Teknologi | Deployment & Hosting |
|---|---|---|
| **Frontend Web** | Next.js 15 (App Router), TypeScript, Tailwind v4 | Vercel (`https://laku.muaraai.com`) |
| **Backend API** | Python 3.12, FastAPI, Pydantic v2 | VPS Tencent (`curzy-vps-tencent`), PM2, Caddy Reverse Proxy |
| **Database** | Supabase PostgreSQL 17 (Singapore), Row Level Security (RLS) | Supabase Cloud |
| **Auth** | Supabase Auth (Google OAuth + SMTP Resend Magic Link) | `support@laku.muaraai.com` |
| **Cache & Task** | Redis (Database Terisolasi) | VPS Linux |
| **Testing** | Pytest, AnyIO, Vitest / Next.js Test Runner | GitHub Actions CI |

---

## ⚡ Panduan Instalasi Lokal

### Prasyarat:
- Node.js >= 20.x
- Python >= 3.12
- Git

### 1. Clone Repositori
```bash
git clone https://github.com/MuaraAI/laku.git
cd laku
```

### 2. Jalankan Frontend (Next.js)
```bash
npm install
cp .env.example .env.local
# Sesuaikan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan NEXT_PUBLIC_API_BASE_URL
npm run dev
```
Buka browser di `http://localhost:3000`.

### 3. Jalankan Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8400
```
API akan aktif di `http://127.0.0.1:8400` dengan endpoint kesehatan di `/health`.

---

## 🧪 Pengujian & Verifikasi

Laku menerapkan disiplin **Test-Driven Development (TDD)** dengan pengetesan perilaku eksternal:

```bash
# Menjalankan seluruh test suite backend (145 tests)
cd backend
source .venv/bin/activate
pytest tests/ -v

# Menjalankan build & linting frontend
npm run lint
npm run build
```

Semua commit di branch `main` wajib lulus pemeriksaan otomatis **GitHub Actions CI**.

---

## 👥 Tim Pengembang (MuaraAI)

* **Yuken Velino** ([@Curzyori](https://github.com/Curzyori)) — **Kapten Tim / Founder & Lead Backend**  
  Arsitektur sistem, Core Engine deterministik §9A, Code Reviewer & penyempurna kualitas kode (*system hardening*).
* **Muhammad Raffli Aldiansyah** ([@Seeyaa77](https://github.com/Seeyaa77) / Bob) — **Backend & Security Engineer (Hacker)**  
  Audit keamanan & proteksi sistem, Parser export marketplace, Deduplikasi data & Infrastruktur VPS Linux.
* **Jio** ([@MyKineID](https://github.com/MyKineID)) — **Lead Frontend & UI/UX Engineer**  
  Desain antarmuka, Motion interaction, Landing page, Desain sistem semantic & Aksesibilitas web (WCAG).
* **Raken** ([@kabayy-sys](https://github.com/kabayy-sys)) — **Product & Business Lead (Hustler)**  
  Inisiator ide proyek, Riset model bisnis UMKM, Prototype dashboard, dan Koordinator video demo & proposal.

**Institusi**: Universitas Bina Sarana Informatika (UBSI) Kampus Kota Pontianak.

---

## 📬 Kontak & Dukungan

- **Email Resmi**: [support@laku.muaraai.com](mailto:support@laku.muaraai.com)
- **Alamat / Domisili**: Pontianak, Kalimantan Barat, Indonesia
- **Komunitas**: [MuaraAI GitHub](https://github.com/MuaraAI)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **Apache-2.0** — lihat berkas [LICENSE](LICENSE).  
Nama *"Laku"* dan logo *MuaraAI* adalah merek dagang milik MuaraAI (lihat [NOTICE](NOTICE)).
