# Laku

> **MuaraAI Laku** — "Tau apa yang bakal laku, sebelum stokmu habis."
> Demand-driven restock engine untuk seller multi-marketplace (Shopee, TikTok Shop, Tokopedia) di kota regional — pilot: Pontianak, Kalimantan Barat.

Seller upload export penjualan (CSV/XLSX) dari masing-masing Seller Center → Laku menormalisasi semuanya jadi satu database → deterministic engine menghitung demand ranking, reorder point, safety stock, dan sinyal overstock/dead-stock → dashboard menjawab: **restock apa, berapa, prioritas apa, dan mana yang harus berhenti dibeli.**

Submission **Digital Innovation Challenge SIFEST 2026** — track Digital Economy. Oleh komunitas [MuaraAI](https://github.com/MuaraAI), Universitas Bina Sarana Informatika Pontianak.

## Arsitektur

```
laku/                        repo root = aplikasi web (Vercel)
├── app/                     Next.js 15 App Router (landing + dashboard)
├── backend/                 FastAPI (VPS :8400 via PM2 + Caddy)
│   ├── app/routers/         endpoint /v1/*
│   ├── app/services/        parsers, engine, recap, advisor tools
│   ├── backend/supabase/    SQL migrations + RLS policies
│   ├── mock/                mock server (frontend tidak blocked)
│   ├── configs/channels/    mapping kolom export per marketplace (YAML)
│   └── tests/               pytest (golden tests, dedup, PII, RLS)
├── docs/                    PRD, implementation plan, riset format, seed narrative
└── DESIGN.md                design tokens (light-first, dark-ready)
```

| Bagian | Teknologi | Deploy |
|---|---|---|
| Web | Next.js 15, TypeScript, Tailwind v4 | Vercel |
| API | Python 3.12, FastAPI | VPS (PM2 + Caddy) |
| Database | Supabase Postgres + RLS + Google OAuth | Cloud (Singapore) |
| Cache | Redis | VPS |

## Status

🚧 Sprint hackathon — target submit 8 Oktober 2026. Lihat [implementation plan](docs/laku/plan-prd-laku-v3.1.md).

## License

Apache-2.0 — lihat [LICENSE](LICENSE). Nama "Laku" dan logo MuaraAI adalah trademark MuaraAI (lihat [NOTICE](NOTICE)).
