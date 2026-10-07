# Laku API — Daftar Endpoint

> Base URL: `http://localhost:8400` (dev) · `https://api.muaraai.com/v1/laku` (production, planned)
> Auth: semua endpoint (kecuali `/health`) pakai header `Authorization: Bearer <supabase-jwt>`.
> Role: semua endpoint **owner-only** di MVP (operator = P1, di-notasi). Error standar: `401` belum login · `403` role/plan tidak cukup · `422` payload salah.

Legend fase: **[MVP]** = wajib demo 8 Okt · **[P1]** = kalau sempat · **[B]** = Grand Final 11 Okt · **[C]** = SaaS.

---

## Health & Public Telemetry

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/health` | [MVP] | Status service. Response: `{status, service, version}` — tanpa auth. |
| GET | `/stats` / `/v1/stats` | [MVP] | Public platform metrics & engine spec (counter landing page, anti-wrapper guarantee, PII-safe) — tanpa auth. |

---

## Imports — upload & normalisasi data penjualan

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| POST | `/v1/imports` | [MVP] | Upload file export (multipart: `file`, `channel`, `source_system?`). Validasi ≤10MB / ≤20k baris / mime. Parse in-memory → staging. Response: `import_batch_id` + status `preview`. |
| GET | `/v1/imports/{id}/preview` | [MVP] | Ringkasan preview: `rows_read, new, updated, unchanged, problem_rows[], new_products[], sku_fill_rate per channel, completeness{}` (FR-7). |
| POST | `/v1/imports/{id}/confirm` | [MVP] | Commit staging → `order_lines` (upsert idempoten), purge staging, invalidate cache, recompute recommendations. Response: counts final. |
| DELETE | `/v1/imports/{id}` | [MVP] | Batal/buang batch (staging purge). |
| GET | `/v1/imports` | [MVP] | Riwayat import seller: batch list + `data_from/data_through` + status. |
| GET | `/v1/imports/{id}/problems` | [MVP] | Download problem rows: `row_number, column, reason` — tanpa isi sel (PII rule). |

**Error khas import:** `422 MISSING_COLUMNS {column: reason}` per kolom wajib · `413 FILE_TOO_LARGE` · `422 ROW_CAP_EXCEEDED {cap: 20000, hint: "split by date range"}` · `200 (0 new, 0 updated)` kalau file identik re-import.

---

## Analytics — demand & ranking

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/analytics/ranking` | [MVP] | Ranking produk gabungan semua kanal. Query: `days=30`, `by=units\|revenue`. Response per produk: rank, units, revenue, trend (`rising/declining/stable`), state, channel split. |
| GET | `/v1/analytics/summary` | [MVP] | KPI Ringkasan: omzet 30 hari, SKU aktif, jumlah urgent, jumlah stop-buying, coverage per kanal. |

---

## Products — katalog & matching

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/products` | [MVP] | Daftar produk canonical + match_state + SKU fill info. Filter: `match_state`, `q` (search nama). |
| GET | `/v1/products/{id}` | [MVP] | Detail produk: links per kanal (sku_raw/title_raw), state, riwayat ringkas. |
| PATCH | `/v1/products/{id}/merge` | [P1, jadi P0 jika SKU fill <70%] | Gabung 2 produk jadi 1 canonical (`match_state=manual`). Body: `{merge_into: productId}`. Undo via split. |
| POST | `/v1/products/{id}/split` | [P1] | Pisahkan kembali hasil merge. |

---

## Recommendations — jantung produk (engine §9A)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/recommendations` | [MVP] | Daftar rekomendasi restock, sorted urgensi. Response per item: `product_id, name, state, overlays[], reorder_point, safety_stock, suggested_qty, days_of_cover, stockout_eta, why{mu, sigma, LT, R, SS, ROP, on_hand, on_order, defaults_flagged[]}`. Query: `state=`, `overlays=`. |
| GET | `/v1/recommendations/{product_id}` | [MVP] | Detail 1 produk + inputs engine lengkap (untuk panel "mengapa"). |

**State (enum):** `CRITICAL` · `REORDER` · `OK` · `OVERSTOCK` · `DEAD` · `INSUFFICIENT_DATA`
**Overlays:** `STALE` (kanal 7+ hari gak impor) · `NEGATIVE` (on_hand < 0 → gak ada qty sampai stok dikonfirmasi)

---

## Stock — ledger gudang

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/stock` | [MVP] | Stok semua produk: `on_hand`, `opening_qty/date`, `on_order` (P1), indikator mismatch. |
| GET | `/v1/stock/{product_id}` | [MVP] | Riwayat mutasi 1 produk (receipts/adjustments/writeoffs). |
| POST | `/v1/stock/movements` | [MVP] | Catat mutasi. Body: `{product_id, type: receipt\|adjustment\|writeoff, qty, note?}`. On_hand recompute + invalidate cache. |
| POST | `/v1/stock/opening` | [MVP] | Set saldo awal: single produk atau import stock template CSV/XLSX (nama, SKU, qty, cost_price?, lead_time?). Produk yang gak pernah laku pun ikut kebentuk (A10). |
| POST | `/v1/stock/count` | [P1] | Stok opname 1-tap: set on_hand aktual → clear overlay NEGATIVE. |

---

## Recap — penjualan gabungan (§9D)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/recap` | [MVP] | Recap penjualan gabungan. Query: `days=7\|30\|90`, `month=YYYY-MM`, `granularity=daily\|weekly\|monthly`. Response: `gross, returns, discounts, net, orders, aov, cancelled_info` + `per_channel[]` (value, share, coverage) + `trend[]` + banner per kanal (`data_from/through`, `stale`, `partial`, `sementara`). Owner-only — operator 403. |
| GET | `/v1/recap/metrics-help` | [MVP] | Definisi tiap metrik (buat bottom-sheet "?"). Statis, bisa di-cache. |
| GET | `/v1/recap/settlements` | [P1] | Pendapatan bersih setelah biaya platform (butuh import settlement report). |
| GET | `/v1/recap/profit` | [P1] | Laba kotor sebelum biaya platform (butuh cost_price; tampil cakupan %). |

---

## Onboarding & Settings

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/me/onboarding-status` | [MVP] | Cek step onboarding yang sudah selesai (channels dipilih, file diimpor, lead time dikonfirmasi, stok diset). |
| POST | `/v1/me/settings` | [MVP] | Update settings seller: `lead_time_days, service_level, cycle_days, review_days, overstock_days, timezone`. Rekomendasi recompute. |
| POST | `/v1/me/channels` | [MVP] | Daftarkan kanal yang dipakai (untuk onboarding wizard + guide). |
| POST | `/v1/me/consent` | [B] | Catat/revoking consent (insights opt-in, versi + timestamp). |
| POST | `/v1/team/invite` | [P1] | Invite operator (email) → masuk `seller_members` role=operator. |

---

## Advisor — AI second brain (Phase B, Grand Final)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| POST | `/v1/advisor/chat` | [B1] | Chat Q&A. Body: `{session_id, messages[]}`. Tool-use only: jawaban angka dari tool calls (`get_ranking, get_recommendations, get_stock, get_sales_summary`), UI render kartu dari tool JSON. Quota: Free 20/5 jam · Pro 250/5 jam — atomic via Redis Lua, 429 + `reset_at`. |
| GET | `/v1/advisor/memory` | [B2] | Lihat ringkasan yang AI ingat. |
| DELETE | `/v1/advisor/memory` | [B2] | Hapus semua ringkasan + riwayat chat user. |

---

## Insights — permintaan wilayah (Phase B)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/insights/regional` | [B1] | Ranking kategori di wilayah. Query: `province=`, `kabupaten?`, `kecamatan?`, `level=province\|kabupaten\|kecamatan`. Cell tampil hanya jika ≥3 seller kontributor + ≥30 order lines + dominasi ≤60%; gagal → roll-up ke parent. Window tetap 28 hari. |
| GET | `/v1/insights/trends` | [B1] | Kategori naik/turun per wilayah. |
| GET | `/v1/insights/heatmap` | [B1] | Data sebaran demand per wilayah (buat peta). |
| GET | `/v1/insights/status` | [B1] | Cek `shared_to_insights` seller ini (opt-in default OFF). |
| POST | `/v1/insights/opt-in` | [B1] | Set partisipasi (body: `{shared: true/false}`) — catat ke `consents`. |

---

## Promo & Billing (Phase C — SaaS)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| POST | `/v1/promo/redeem` | [C] | Redeem kode promo 1 bulan free. Body: `{code}`. Single-use, max_redemptions=1. |
| GET | `/v1/billing/plans` | [C] | Daftar plan (Free/Pro + harga + fitur). |
| POST | `/v1/billing/checkout` | [C] | Init payment (Midtrans/Xendit QRIS) → redirect URL. |
| POST | `/v1/billing/webhook` | [C] | Callback payment gateway (verify signature → update plan). |
| GET | `/v1/api-keys` | [C] | List API keys seller (Pro). |
| POST | `/v1/api-keys` | [C] | Generate key `laku_live_<32hex>` (tampil sekali, simpan hash). |
| DELETE | `/v1/api-keys/{id}` | [C] | Revoke key. |

---

## Admin (internal, audit-logged)

| Method | Path | Fase | Deskripsi |
|---|---|---|---|
| GET | `/v1/admin/users` | [P1] | Daftar seller + status. |
| POST | `/v1/admin/promo-codes` | [C] | Generate batch kode promo (single-use). |
| GET | `/v1/admin/metrics` | [P1] | Import/hari, seller aktif, AI usage, error rate. |
| GET | `/v1/admin/audit-log` | [P1] | Semua aksi admin. |

---

## Catatan Implementasi

1. **Semua query DB lewat repository layer** — `seller_id` wajib dari JWT, bukan dari request body (ADR-1).
2. **Response envelope:** sukses → data langsung; error → `{error: {code, message, details?}}`.
3. **Rate limit:** upload 10/jam/seller · AI per kuota plan · API key Pro 60 req/menit (Phase C).
4. **Idempotensi import:** dedup key `(seller_id, source_system, sales_channel, shop_id, order_id, line_key)`.
5. **Cache:** ranking & recap di-Redis ~60s, invalidated saat import commit / stok berubah.
