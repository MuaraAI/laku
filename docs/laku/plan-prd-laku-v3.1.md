# Laku MVP Implementation Plan (M0–M4, submit 8 Okt)

> **For agentic workers:** REQUIRED SUB-SKILL: gunakan superpowers:subagent-driven-development (jika task dieksekusi subagent per-task) atau superpowers:executing-plans (jika native inline). Steps pakai checkbox (`- [ ]`).
> **Catatan granularitas:** Plan ini hybrid — skeleton sesuai skill, tapi granularitas per-task milestone (bukan per-keystroke) karena sprint 4-hari 4-orang dan parser bergantung sample CSV asli yang belum masuk. Setiap task tetap punya deliverable + verification runnable + commit point.

**Goal:** Prototype 50% Laku (deterministic core end-to-end: import → engine → dashboard) siap demo video, plus proposal, submit 8 Okt 2026.

**Architecture:** Monorepo — Next.js App Router di ROOT repo (Vercel zero-config: `/` landing, `/dashboard` app) + FastAPI di `backend/` (VPS:8400, PM2, Caddy) + Supabase (Postgres+RLS, Google Auth, Storage non-raw) + Redis (cache/quota/hot-log). Import tier-1 config-map deterministik; AI advisor hanya Phase B (pasca-submit).

**Tech Stack:** Python 3.12/FastAPI/openpyxl/pandas · Next.js 15/TypeScript/Tailwind v4 di ROOT repo (theme.css) · Supabase JS · Redis · pytest · Playwright optional.

**Spec:** `docs/prd/2026-10-04-laku-restock-engine-v3_1.md` (APPROVED) + `DESIGN.md` + `docs/seed-narrative.md` + `docs/formats/research-notes.md`.

## Global Constraints

- PII: nama/HP/alamat pembeli TIDAK PERNAH persist — parse in-memory, allowlist kolom, staging purge ≤24h (FR-29, ADR-2, A7, A13).
- Row cap 20.000/file, size ≤10MB; lebih → pesan split date-range (A14).
- Engine default: LT=5d, SL=95%, C=14d, O=60d, R=7d (A2, A11) — semua seller-editable, default bertanda "asumsi".
- Status canonical: `completed|in_progress` masuk demand/stok; `cancelled|returned|unpaid` tidak (A9, FR-27). Dedup key `(seller_id, source_system, sales_channel, shop_id, order_id, line_key)`.
- UI Bahasa Indonesia dari `constants/id.ts` tunggal; angka JetBrains Mono tabular rata kanan; badge = warna+ikon+label (DESIGN.md).
- Komponen frontend WAJIB semantic token (`var(--surface)` dll), bukan hex — dark-ready (DESIGN.md, Opsi A).
- Freeze 7 Okt 18:00 WIB, tag `submission-v1`; pasca-freeze hanya blocking-bug fix approval Yuken (§9C).
- Semua test = external behavior (parser fixtures, dedup, engine golden, RLS isolation, role guard, quota, recap golden) — no per-function unit suites.

## Review Focus (input yang paling sering nyandung, masing-masing punya test di task-nya)

1. **Excel korupsi ID** (`1.23E+15`, leading-zero SKU ilang) → seller kehilangan order → Task B2 test.
2. **Kolom kosong Shopee di tengah file** → parser shift kolom, data salah senyap → Task B1 skip-empty-columns test.
3. **Multi-item order** → dedup salah bikin data hilang/ganda → Task B2 line-key test.
4. **Negative on_hand** → engine ngasih qty palsu → Task B3 NEGATIVE overlay test.
5. **Voucher order-level dobel hitung** → net sales ngawur → Task B4 recap golden test.

---

### Task M0-1: Monorepo scaffold + LICENSE (Yuken) — malam ini

**Files:** Create `README.md`, `LICENSE` (Apache-2.0), `NOTICE` (trademark MuaraAI/Laku), `backend/` (FastAPI), Next.js di ROOT repo, `.gitignore`, `.env.example` (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, REDIS_URL, MUARAAI_GATEWAY_KEY, DEMO_MODE, SENTRY_DSN, NEXT_PUBLIC_API_BASE_URL).
- [x] Scaffold Next.js di ROOT (create-next-app TS+Tailwind v4, paste `theme.css` ke `app/globals.css`) + FastAPI di `backend/` (port 8400).
- [x] LICENSE Apache-2.0 + NOTICE ("Laku" & logo = trademark MuaraAI; NOTICE wajib ikut fork).
- [x] `/health` endpoint + `DEMO_MODE` flag read (graceful default false).
- [x] Commit: `feat: monorepo scaffold api+web, license, env template`.

### Task M0-2: Supabase project + schema + RLS + Google Auth (Yuken) — malam ini

**Files:** `backend/supabase/migrations/0001_init.sql`, `backend/supabase/policies_test.sql`.
- [x] Buat project Supabase (region Singapore), enable Google OAuth provider.
- [x] Tabel per PRD §9: `sellers, seller_members, platform_admins, consents, channels, import_batches, import_staging, order_lines (unique key 5-kolom), products, product_links, stock_items, stock_movements, recommendations, ai_chat_messages, ai_memories, promo_codes, audit_log`.
- [x] RLS: seller lihat/ubah hanya row `seller_id` miliknya (`auth.uid()` via `seller_members`); admin via `platform_admins`.
- [x] Buat DB role `app_backend` NON-BYPASSRLS (untuk ADR-1 `SET LOCAL app.seller_id`).
- [x] Verification: sql (pseudocode) — login seller A → `select` dari `order_lines` seller B = 0 rows; anon insert = denied.
- [x] Commit: `feat: db schema rls google auth (M0-2)`.

### Task M0-3: API contract + mock server (Yuken+Rafli) — SEBELUM frontend mulai

**Files:** `backend/openapi.yaml`, `backend/mock/main.py` (FastAPI serve mock JSON dari `mock/fixtures/*.json`).
- [x] Definisikan kontrak endpoint P0: `POST /v1/imports`, `GET /v1/imports/{id}`, `GET /v1/analytics/ranking`, `GET /v1/analytics/summary`, `GET /v1/products`, `PATCH /v1/products/{id}/match`, `GET /v1/recommendations`, `GET /v1/stock`, `POST /v1/stock/movements`, `GET /v1/recap`, `GET /v1/health`. Skema respons mengikuti PRD §7/§9.
- [x] Mock server jalan di :8400 dengan data seed narrative (10 produk, 6 state).
- [x] Verification: `curl localhost:8400/v1/recommendations` → JSON valid berisi state CRITICAL/REORDER/OK/OVERSTOCK/DEAD/INSUFFICIENT.
- [x] Commit: `feat: openapi contract + mock server (M0-3)`.
- [x] **Handoff:** posting kontrak ke grup WA; Jio+Raken mulai frontend pakai mock.

### Task M0-4: Registrasi SIFEST + berkas admin (Bob) — paralel, deadline 5 Okt

- [ ] Isi form: nama tim MuaraAI, anggota 4, upload KTM (1 PDF), bukti transfer Rp45k, bukti follow IG (1 PDF), bukti story poster (1 PDF), track **Digital Economy**, repo `github.com/MuaraAI/laku` (link mengikuti M0-1).
- [ ] Ambil guidebook: catat **cutoff time exact** + rubrik penilaian → post ke grup WA.
- [ ] Verification: screenshot konfirmasi terkirim + isi rubrik di grup.

### Task B1: Parser Shopee + CSV plumbing (Yuken) — 5 Okt pagi-siang

**Files:** `backend/services/parsers/shopee.py`, `configs/channels/shopee.yaml`, `tests/fixtures/shopee_sample.csv`, `tests/test_parser_shopee.py`.
- [x] Config YAML: regex match header ID (Nomor Pesanan, Nama Produk, SKU/Variasi, Jumlah, Harga Awal, Waktu Pesanan Dibuat, Status Pesanan, kolom wilayah) + `price_basis: list_price_before_discount` + status map ID→canonical + `skip_empty_columns: true` (temuan riset: Shopee punya kolom kosong!).
- [x] Parser: detect encoding (UTF-8/BOM/CP1252) + delimiter (`,` `;` tab) → parse in-memory → allowlist PII (drop Nama/Telepon/Alamat setelah derive `buyer_kabupaten/province`) → normalisasi uang (`Rp 18.000`→18000) & tanggal → output rows canonical.
- [x] Guard Excel: deteksi ID notasi ilmiah (`1.23E+15` pattern) & SKU leading-zero loss → flag problem-row (FR-7).
- [x] **TDD:** fixture CSV (dari sample asli Raken; fallback: fixture format-setia dari research-notes, ditandai unverified) → test: multi-item order = N baris dgn order_id sama; kolom kosong ter-skip; ID ilmiah = problem row; PII scan hasil = 0 nama/HP/alamat.
- [x] Verification: `pytest tests/test_parser_shopee.py -v` PASS; no PII in output rows.
- [x] Commit: `feat: shopee parser config-map + pii allowlist (B1)`.

### Task B2: Import pipeline + dedup/upsert + preview data (Rafli) — 5 Okt sore

**Files:** `backend/routers/imports.py`, `backend/services/import_pipeline.py`, `backend/repositories/order_lines.py`, `tests/test_import_pipeline.py`.
- [x] Endpoint `POST /v1/imports` (multipart ≤10MB ≤20k baris; validasi 3 lapis: Caddy size, FastAPI mime/ext, parser row cap) → parse → staging (sanitized) → preview payload `{rows_read, new, updated, unchanged, problem_rows, new_products, sku_fill_rate}`.
- [x] `POST /v1/imports/{id}/confirm` → upsert `order_lines` (ON CONFLICT 5-kolom key DO UPDATE status/qty/price + log ke `import_batches`), purge staging, invalidate cache Redis.
- [x] **TDD:** test file sama 2× → "0 new, 0 updated"; order 3-item = 3 rows; status SELESAI→DIBATALKAN via re-import = "1 updated"; import 20.001 baris = reject pesan split.
- [x] Verification: `pytest tests/test_import_pipeline.py -v` PASS.
- [x] Commit: `feat: import pipeline idempotent + preview (B2)`.

### Task F1: Next.js scaffold auth-guarded + layout (Jio) — 5 Okt (mulai dari mock)

**Files:** `app/(auth)/login/`, `app/(dashboard)/layout.tsx`, `middleware.ts`, `lib/supabase.ts`, `constants/id.ts`.
- [ ] Login Google via Supabase (`@supabase/ssr`, PKCE, callback `/auth/callback`); middleware guard: tanpa sesi → redirect `/login`; sesi → inject Bearer JWT ke fetch API.
- [ ] Dashboard shell: desktop sidebar (Ringkasan, Upload, Stok, Penjualan, Menu) ↔ mobile bottom tabs ≤5; semua copy dari `constants/id.ts`; komponen pakai semantic token dari `theme.css`; angka `JetBrains Mono tabular-nums` rata kanan.
- [ ] Verification: `npm run build` PASS; manual login Google → dashboard kosong tampil; logout → redirect login.
- [ ] Commit: `feat: auth guard + dashboard shell (F1)`.

### Task F2: Upload + Preview/Confirm UI (Jio) — 6 Okt pagi

**Files:** `app/(dashboard)/upload/page.tsx`, `components/ImportPreview.tsx`, `components/SkeletonImport.tsx`.
- [ ] Form pilih channel (Shopee/TikTok) → upload file → POST ke API → tampilkan preview: rows read/new/updated/unchanged/problem rows (downloadable), SKU fill rate, completeness report (FR-7) → tombol Konfirmasi/Batal.
- [ ] Skeleton loader saat processing (bukan spinner bulat); error per-kolom dari API ditampilkan apa adanya; empty state ilustrasi singkat.
- [ ] Verification: upload fixture Shopee via UI → preview muncul → confirm → data baru muncul di ranking; re-upload file sama → "0 baru, 0 diupdate".
- [ ] Commit: `feat: upload + preview confirm ui (F2)`.

### Task B3: Engine + rekomendasi + stok (Yuken+Rafli) — 6 Okt

**Files:** `backend/services/engine.py`, `services/stock.py`, `routers/recommendations.py`, `routers/stock.py`, `tests/test_engine_golden.py`, `tests/test_stock_ledger.py`.
- [x] Engine §9A persis: μ, σ, stockout-day adjust, P=LT+R, SS=ceil(z·√(Pσ²+μ²σ_LT²)), ROP, qty, cover, state machine (DEAD→OVERSTOCK→INSUFFICIENT→CRITICAL→REORDER→OK) + overlay STALE/NEGATIVE + "why" inputs per row.
- [x] Stock ledger: opening balance + receipts/adjustments; sales setelah opening_date mengurangi; retur restore; negative on_hand → no qty (FR-43).
- [x] Stock template import (FR-26/A10): CSV nama,SKU,qty,cost,lead_time → buat produk (termasuk yang gak pernah laku).
- [x] **TDD golden:** Worked Example 1 (μ10,σ4,LT5,R7,P12 → SS 23, ROP 143, qty 173, CRITICAL) & Example 2 (μ_obs 0.1 → OVERSTOCK 1200 hari) HARUS exact; property tests μ↑⇒qty↑, LT↑⇒ROP↑, on_hand<0⇒no qty.
- [x] Verification: `pytest tests/test_engine_golden.py tests/test_stock_ledger.py -v` PASS (semua golden exact).
- [x] Commit: `feat: restock engine + stock ledger golden-tested (B3)`.

### Task B4: Sales recap queries (Yuken) — 6 Okt malam

**Files:** `backend/services/recap.py`, `routers/recap.py`, `tests/test_recap_golden.py`.
- [x] Definisi §9D: gross (completed+in_progress+returned), returns, discounts (seller-funded + allocated pro-rata), net, orders/AOV, cancelled info-only; per-channel split sum == combined; coverage banner (`data_from/through`, stale >7 hari by import date, partial gap, "sementara" chip 7 hari terakhir); `price_basis` handling; owner-only (Operator→403, schema siap).
- [x] **TDD golden §9D:** Order1 (2×50.000, disc 5.000) + Order2 (returned 30.000) + Order3 (cancelled 20.000) → gross 130.000, returns 30.000, discounts 5.000, net 95.000, AOV 95.000, cancelled-info 20.000; fixture `paid_price_after_discount` → gross Order1 tetap 100.000.
- [x] Verification: `pytest tests/test_recap_golden.py -v` PASS.
- [x] Commit: `feat: sales recap golden-tested (B4)`.

### Task F3: Halaman Restock + Produk + Stok + Penjualan (Jio+Raken) — 6–7 Okt

**Files:** `app/(dashboard)/page.tsx` (Restock home), `produk/`, `stok/`, `penjualan/`, `components/{StateBadge,RecommendationCard,CoverageBanner,RecapChart}.tsx`.
- [ ] Restock home: sorted CRITICAL→REORDER, section terpisah "Berhenti beli" (OVERSTOCK/DEAD), tiap row badge (warna+ikon+label) + tombol "mengapa" (panel breakdown inputs μ/σ/LT/R/SS/ROP/on_hand, default bertanda "asumsi").
- [ ] Stok: ledger in/out + stok awal + negatif flag "Cocokkan stok"; Produk: list + match state; Penjualan (M2b): period selector, per-channel split, trend chart, coverage banner, definition help bottom-sheet — cut order A15 kalau mepet.
- [ ] Seed data masuk (FR-9 seed narrative) → **verifikasi visual:** satu layar memuat ≥6 state + overlay STALE/NEGATIVE.
- [ ] Verification: `npm run build` PASS; Playwright smoke: login→upload→confirm→ranking tampil (<1s); manual mobile 375px: no horizontal scroll, tabs ≤5.
- [ ] Commit: `feat: dashboard pages seeded all-states (F3)`.

### Task B5: Onboarding + landing + TOS/Privacy + demo mode (semua) — 7 Okt pagi

**Files:** `app/(marketing)/page.tsx`, `/tos`, `/privacy`, `app/(dashboard)/onboarding/`, `docs/legal/*.md`, `backend/demo_seed.py`.
- [ ] Onboarding wizard (FR-30): pilih channel → panduan export per channel (konten Raken) → upload → konfirmasi LT (badge "asumsi") → set stok (skippable) → dashboard.
- [ ] Landing (FR-15): hero (headline ≤2 baris, subtext ≤20 kata, CTA Masuk/Coba Gratis), Fitur, Cara Kerja, Harga coming-soon, footer TOS/Privacy/GitHub/IG. Non-affiliation disclaimer marketplace.
- [ ] TOS + Privacy (draft Raken): kepemilikan data seller, PII minimization, AI memory, insights opt-in, LLM third-party via gateway, controller/processor.
- [ ] Demo mode: `DEMO_MODE=true` → serve seller seed penuh, `/health` OK, tanpa dependensi import/LLM live (FR-34).
- [ ] Verification: 1 orang non-tim: landing → login → onboarding → dashboard ≤10 menit; `DEMO_MODE=true` full path jalan tanpa network marketplace.
- [ ] Commit: `feat: onboarding landing legal demo-mode (B5)`.

### Task M3-FREEZE: QA + freeze + tag (Yuken gate) — 7 Okt, 16:00–18:00

- [ ] Jalankan SEMUA acceptance criteria §6.1 (P0): golden engine & recap exact, dedup 0/0, PII scan bersih (DB+staging+log+problem-file), RLS isolation A/B, operator 403, quota 21st→429 (jika FR-18 di-build early), timezone bucketing 23:30 WIB, mobile 375px no h-scroll, FR-30 test 3-orang.
- [ ] Fix blocking bugs only (approval Yuken).
- [ ] `git tag submission-v1` pukul 18:00. **STOP CODING.**
- [ ] Verification: `git tag -l` menunjukkan `submission-v1`; CI/pytest full suite hijau pada tag.

### Task M4: Proposal + video + submit (Raken+Jio, review Yuken+Bob) — 8 Okt pagi

**Files:** `docs/proposal/` (PDF final), `docs/demo/` (video ≤3 menit), checklist submit.
- [ ] Video (dari tag `submission-v1`): problem 30s → import→preview→confirm 60s → dashboard ranking+state badge 45s → recap+coverage banner 30s → insights heatmap + advisor (B1 material) 45s → visi 15s. Narasi ikut §2 problem statement.
- [ ] Proposal: problem (Kalbar sourcing), solusi (unified view + restock decision), arsitektur (diagram Fig.1 PRD), demo screenshot, competitor/status-quo (spreadsheet 10 menit/minggu), temuan seller §2.2 (n of N), roadmap (API OAuth, Phase C SaaS + Laku API Pro), anti-wrapper guarantee line.
- [ ] Submit form (track Digital Economy) **sebelum jam 12:00** — jauh di atas cutoff.
- [ ] Verification: screenshot submission sukses + link karya terkirim ke grup WA.

## Pasca-submit (di luar plan ini, ringkas): M5 = FR-16 advisor (tool-use, numeric check) + FR-18 quota Lua 250/5j + FR-19 insights (kategori, k≥3, dominance ≤60%) di seed data; M6 = Grand Final 11 Okt (DEMO_MODE fallback siap); M7 = SaaS + FR-26 Laku API.
