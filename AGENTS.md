# AGENTS.md — Laku (laku.muaraai.com)

> Instruksi ini berlaku untuk SEMUA agent (Claude, Hermes, Cursor, dll) dan kontributor manusia yang bekerja di repo ini. Baca sebelum menulis kode. PRD = sumber kebenaran produk.

## Konteks Proyek

Laku = restock engine untuk seller multi-marketplace (Shopee/TikTok Shop/Tokopedia). Seller upload export CSV/XLSX penjualannya → sistem normalisasi ke 1 database → deterministic engine hitung demand ranking, reorder point, safety stock → dashboard rekomendasi restock gudang lokal.

- **Kompetisi:** SIFEST 2026 Digital Innovation Challenge, prototype ~50%, submit **8 Okt 2026** (stretch: 7 Okt).
- **Tim:** Yuken + Rafli/Bob = backend · Jio + Raken = frontend (Raken = landing-page, Jio = dashboard post-login).
- **Dokumen:** PRD `docs/laku/prd-laku-v3.1.md` (APPROVED, A1–A16 locked) · plan `docs/laku/plan-prd-laku-v3.1.md` · design `DESIGN.md` · seed `docs/seed-narrative.md` · riset format `docs/formats/`.

## Stack & Layout

```
repo root   Next.js 15 (app router) — deploy Vercel, zero-config
backend/    FastAPI, port 8400, PM2 di VPS, Caddy reverse proxy
```

- Supabase (cloud, Singapore): Postgres + RLS, Google OAuth, Storage (JANGAN simpan raw upload).
- Redis: instance VPS yang sudah ada, **db nomor baru** (BUKAN db2 milik UBSI-API).
- AI: Muara V1 Flash via gateway MuaraAI — hanya Phase B, tool-use, bukan wrapper.

## Perintah

```bash
# API
cd backend
uvicorn app.main:app --reload --port 8400
pytest tests/ -v

# Web (root repo)
npm install
npm run dev        # dev server
npm run build      # HARUS lulus sebelum commit frontend
```

## Aturan Mengikat (melanggar = PR ditolak)

1. **PII:** nama/telepon/alamat pembeli TIDAK PERNAH persist — tidak di tabel, staging, log, error report. Parse in-memory; derive `buyer_kabupaten/province` lalu buang teks mentahnya (FR-29, ADR-2).
2. **Raw upload tidak disimpan** — parse in-memory, staging purge ≤24 jam (ADR-2).
3. **Batas:** ≤10MB dan ≤20.000 baris per file; lebih → tolak dengan pesan split date-range (A14).
4. **Engine deterministik:** angka bisnis hanya dari DB/formula §9A PRD. AI TIDAK PERNAH menulis nilai transaksi.
5. **Dedup key:** `(seller_id, source_system, sales_channel, shop_id, order_id, line_key)` — import ulang = "0 new, 0 updated".
6. **Frontend:** komponen WAJIB semantic token dari `theme.css` (`var(--surface)`), BUKAN hex. Copy UI Bahasa Indonesia terpusat di `constants/id.ts`. Angka bisnis = JetBrains Mono `tabular-nums`, rata kanan. Badge status = warna + ikon + label (tiga-tiganya). Wajib light mode; dark belum ada (jangan ad-hoc).
7. **Status order canonical:** `completed|in_progress` masuk demand/stok; `cancelled|returned|unpaid` tidak.
8. **Test = external behavior:** parser fixtures, dedup idempoten, engine golden (§9A exact), recap golden (§9D exact), RLS isolation, role guard. Tidak perlu unit test per-fungsi.
9. **Commit:** conventional commits (`feat:`, `fix:`, `test:`, `docs:`), commit kecil per deliverable. Jangan commit `.env`, fixture berisi PII, atau file mentah marketplace.
10. **Freeze:** 7 Okt 18:00 WIB tag `submission-v1`. Setelah itu hanya blocking-bug dengan approval Yuken.

## Workflow Tim

- **Contract-first:** backend expose OpenAPI + mock server (M0-3) SEBELUM frontend ngoding integrasi; frontend boleh mulai dari mock kapan saja.
- Frontend split: Raken = landing-page + onboarding content; Jio = dashboard (post-login) + import preview.
- Backend split: Yuken = schema/auth/ADR-1/contract/Shopee parser/engine/recap; Rafli = TikTok parser, dedup/upsert, stock ledger, XLSX guards, deploy.
- Sinkronisasi: Discord tiap malam ±19:00 WIB. Perubahan kontrak API = kabarin grup + update changelog PRD.
- Kalau ragu keputusan produk: baca PRD dulu; masih ragu → tanya Yuken, jangan nebak sendiri.
