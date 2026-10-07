# Laku Backend — Task Plan untuk Yuken & Rafli

> Sprint: Senin 5 Okt (malam) → Rabu 7 Okt 18:00 freeze · Submit Kamis 8 Okt.
> Aturan main: baca `../AGENTS.md` dulu. Branch baru per task (`feat/<topik>`), test PASS → PR → merge oleh Yuken.
> Referensi: `docs/laku/prd-laku-v3.1.md` (spec) · `docs/api.md` (kontrak endpoint) · `docs/seed-narrative.md` (data demo) · `backend/configs/channels/shopee.yaml` (skeleton parser).

---

## Pembagian Peran (garis besar)

| | **Yuken** (lead backend) | **Rafli** (backend) |
|---|---|---|
| Fokus | Fondasi: auth, DB access, parser Shopee, engine, recap | Parser TikTok, import pipeline, stock ledger, deploy |
| Gaya kerja | Bikin fondasi + bagian yang butuh presisi (golden tests) | Bagian yang self-contained + infra/deploy |

Kerjakan **bergantian per task**, bukan bareng satu file — biar gak konflik. Urutan task di bawah ini adalah urutan eksekusi.

---

## RONDE 1 — Senin 5 Okt malam (harus beres sebelum tidur)

### Task Y1 — JWT auth + repository layer *(Yuken, ±1.5 jam)*
Fondasi semua endpoint. Kalau ini gak jadi, semuanya gak jalan.

- [x] `backend/app/deps/auth.py`: verify Supabase JWT (JWKS dari `SUPABASE_URL/.well-known/jwks.json`, cache 10 menit) → resolve `seller_id` + role via `seller_members` → inject ke request.state.
- [x] `backend/app/deps/roles.py`: `require_owner()` dependency (403 kalau bukan owner).
- [x] `backend/app/repositories/base.py`: semua fungsi query **wajib** terima `seller_id` parameter — gak ada query tanpa scoping (ADR-1).
- [x] `.env` loader (`pydantic-settings`), CORS sesuai `ALLOWED_ORIGINS`.
- [x] Test: `tests/test_auth.py` — token invalid → 401; token valid → `request.state.seller_id` terisi; mock JWT tanpa membership → 403.
- [x] Commit: `feat: jwt auth + repository base (Y1)` → PR → merge.

### Task R1 — Router imports skeleton + validasi file *(Rafli, ±1.5 jam)*
Bisa jalan paralel dengan Y1 (beda file, beda router).

- [x] `backend/app/routers/imports.py`: `POST /v1/imports` (multipart) — validasi 3 lapis: ukuran ≤10MB, ekstensi `.csv/.xlsx`, jumlah baris ≤20.000 (hitung saat parse; lebih → 422 + pesan split date-range).
- [x] Simpan file hash (SHA-256) + buat `import_batches` row (status `pending`).
- [x] Error responses sesuai `docs/api.md` (`413 FILE_TOO_LARGE`, `422 ROW_CAP_EXCEEDED`, `422 MISSING_COLUMNS`).
- [x] Test: `tests/test_imports_validation.py` — file >10MB ditolak, ext salah ditolak, batch row terbentuk.
- [x] Commit: `feat: imports router + file validation (R1)` → PR.

### Task Y2 — Mock server + seed data *(Yuken, ±1 jam, SETELAH Y1)*
Ini yang bikin Jio & Raken bisa mulai frontend.

- [x] Isi `backend/mock/fixtures/` dari `docs/seed-narrative.md`: 10 produk, semua state engine, 3 seller.
- [x] `backend/mock/main.py`: serve semua endpoint sesuai `docs/api.md` (ranking, recommendations, stock, recap, imports) dengan data seed — tanpa DB, JSON statis.
- [x] Verification: `curl localhost:8400/v1/recommendations` → JSON valid berisi 6 state + 2 overlay.
- [x] Commit: `feat: mock server + seed narrative (Y2)` → PR → merge.
- [x] **Kabarin grup WA:** "mock jalan di :8400, frontend gas."

### Task R2 — Setup repo di GitHub + VPS prep *(Rafli, ±30 menit, paralel)*
- [x] Buat branch `main` proteksi di GitHub: Settings → Branches → require PR + block force push.
- [x] VPS: buat folder `~/laku`, venv python, clone repo, setup `.env` (isi SUPABASE_URL/KEYS dari Yuken, REDIS_URL kosong dulu).
- [x] Commit: tidak ada (infra).

---

## RONDE 2 — Selasa 6 Okt (hari kerja inti)

### Task B1 — Parser Shopee lengkap *(Yuken, ±3 jam)*
- [x] Lengkapi `configs/channels/shopee.yaml` (regex header ID, status map, skip_empty_columns, price_basis) — verifikasi pakai sample asli dari Raken kalau udah dateng; kalau belum, fixture dari `docs/formats/research-notes.md` (tandai UNVERIFIED).
- [x] `backend/app/services/parsers/shopee.py`: detect encoding + delimiter → parse → PII allowlist (derive kabupaten/provinsi dari alamat → buang teks alamat) → normalisasi uang (`Rp 18.000`→18000, `18rb`→18000) & tanggal WIB → output rows canonical.
- [x] Guard Excel: ID notasi ilmiah `1.23E+15` + SKU leading-zero hilang → problem-row.
- [x] Fixture + test (`tests/test_parser_shopee.py`): multi-item order = N baris; kolom kosong ter-skip; ID ilmiah = problem; hasil scan 0 PII.
- [x] Commit: `feat: shopee parser (B1)` → PR.

### Task B2 — Import pipeline + dedup/upsert *(Rafli, ±3 jam, setelah B1 merge — consume parser-nya Yuken)*
- [x] `backend/app/services/import_pipeline.py`: parse → staging → preview payload (`rows_read/new/updated/unchanged/problem/sku_fill_rate`) → confirm → upsert `order_lines` (ON CONFLICT 6-kolom key, DO UPDATE status/qty/price + log `change_log`) → purge staging (expire 24 jam).
- [x] `GET /v1/imports/{id}/preview` + `POST /v1/imports/{id}/confirm` + `GET /v1/imports` (riwayat) + `GET /v1/imports/{id}/problems`.
- [x] Test: file sama 2× → `0 new, 0 updated`; order 3-item = 3 rows; status berubah via re-import = "1 updated".
- [x] Commit: `feat: import pipeline idempotent (B2)` → PR.

### Task B3 — Engine restock + golden test *(Yuken, ±3 jam)*
Bagian paling presisi — golden test HARUS exact sesuai PRD §9A.

- [x] `backend/app/services/engine.py`: μ, σ, stockout-day adjustment, P=LT+R, SS=ceil(z√(Pσ²+μ²σ_LT²)), ROP=μP+SS, qty, cover, state machine (DEAD→OVERSTOCK→INSUFFICIENT→CRITICAL→REORDER→OK) + overlay STALE/NEGATIVE + input "why" per row.
- [x] `backend/app/routers/recommendations.py`: `GET /v1/recommendations` + `/{product_id}`.
- [x] Golden tests (`tests/test_engine_golden.py`):
  - Worked Example 1: μ10 σ4 LT5 R7 → SS 23, ROP 143, qty 173, CRITICAL.
  - Worked Example 2: μ_obs 0.1 → OVERSTOCK (cover 1200 hari), tanpa qty.
  - Property: μ↑⇒qty↑ · LT↑⇒ROP↑ · on_hand<0⇒no qty · R=0 ⇒ v2.2 behavior.
- [x] Commit: `feat: restock engine golden-tested (B3)` → PR.

### Task B4 — Stock ledger *(Rafli, ±2 jam, paralel dengan B3 — beda router)*
- [x] `backend/app/routers/stock.py`: `GET /v1/stock`, `GET /v1/stock/{product_id}`, `POST /v1/stock/movements`, `POST /v1/stock/opening` (single + template CSV/XLSX — buat produk yang belum pernah laku).
- [x] On_hand = opening + receipts + adjustments − eligible sales (setelah opening_date); retur restore; negatif → flag, jangan clamp.
- [x] Test: receipt menambah, sales setelah opening_date mengurangi, retur restore, negatif muncul sebagai mismatch.
- [x] Commit: `feat: stock ledger (B4)` → PR.

---

## RONDE 3 — Rabu 7 Okt (sampai freeze 18:00)

### Task B5 — Recap penjualan + golden test *(Yuken, pagi, ±2.5 jam)*
- [x] `backend/app/services/recap.py` + `routers/recap.py`: gross/returns/discounts/net/orders/AOV + cancelled info-only + per-channel split (sum == combined) + trend + coverage banner (`data_from/through`, stale >7 hari by import date, partial gap, chip "sementara" 7 hari terakhir) + `price_basis` handling + operator 403.
- [x] Golden test §9D exact: gross 130.000, returns 30.000, discounts 5.000, net 95.000, AOV 95.000, cancelled 20.000; fixture paid_price_after_discount → gross Order1 tetap 100.000.
- [x] Commit: `feat: sales recap golden-tested (B5)` → PR.

### Task B6 — Onboarding + demo mode + deploy *(Rafli, pagi-siang, ±3 jam)*
- [x] `GET /v1/me/onboarding-status` + `POST /v1/me/settings` (recompute rekomendasi) + `POST /v1/me/channels`.
- [x] `DEMO_MODE=true`: serve seed data penuh tanpa DB import dependency.
- [x] Deploy VPS: PM2 (`laku-api`, port 8400), Caddy block `api.muaraai.com` (reverse proxy + security headers), health check uptime.
- [x] Verification: `curl https://api.muaraai.com/v1/laku/health` → 200.
- [x] Commit: `feat: onboarding settings demo-mode deploy (B6)` → PR.

### Task B7 — Integration & freeze *(Yuken + Rafli bareng, siang, ±2 jam)*
- [ ] Integrasi end-to-end: upload fixture → confirm → ranking → recap (pakai data beneran, bukan mock).
- [ ] Jalankan SEMUA test: `pytest tests/ -v` hijau.
- [ ] PII audit: scan DB + log + problem-file — 0 nama/HP/alamat.
- [ ] Seed data final masuk (seed narrative) → semua state ke-demonya.
- [ ] Fix blocking bug terakhir.
- [ ] **18:00: `git tag submission-v1` + push tag. FREEZE.**

### Task M4-support — bantu frontend submit *(kedua, sore)*
- [ ] Jawab pertanyaan Jio/Raken soal API untuk video & proposal.
- [ ] Cek proposal: bagian arsitektur & anti-wrapper guarantee sesuai implementasi.

---

## Aturan Main (biar gak tabrakan)

1. **Satu task = satu branch = satu PR** (`feat/b1-shopee-parser`). Jangan campur.
2. **Y1 + R1 jalan paralel** (beda file). **B1 sebelum B2** (B2 consumes parser). **B3 paralel B4** (beda router).
3. **Kalau mentok >45 menit:** kabarin grup WA, jangan diem mesh sama bug.
4. **Sample CSV Raken** = prioritas barang masuk. Kalau belum dateng sampai Selasa siang → pake fixture UNVERIFIED, lanjut.
5. Setiap PR: `pytest tests/ -v` hijau dulu baru minta review.
6. Freeze 7 Okt 18:00 — setelah itu yang bisa nyentuh kode cuma Yuken, dan cuma blocking bug.
