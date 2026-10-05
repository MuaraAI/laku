# Format Research Notes — Export Pesanan Marketplace

> Bibit **format registry** (`docs/formats/` per PRD v3.1 FR-2).
> Status riset: 2026-10-04, dari screen-recording YouTube (file export asli dibuka di layar) + live-check portal resmi.
> **Label kebenaran:** `visual-verified` (kelihatan di screen-record) / `predicted` (indikasi kuat, belum visual) / `unverified` (perlu file asli).
> **Aturan:** fixture parser HANYA boleh dibuat dari file asli seller (Raken). Catatan ini memandu mapping, bukan menggantikan sample.

---

## 1. Shopee — Export Pesanan (Seller Center)

**Cara export (dari video tutorial):** Seller Center → Pesanan → Export → filter tanggal → unduh (XLSX). File terbuka di Excel dengan *Protected View* ("Enable editing").

| Temuan | Status | Implikasi parser |
|---|---|---|
| Format file **XLS/XLSX** | visual-verified (Joyo Alkes: "file-nya menjadi xls atau file Excel", "default-nya xls biar fresh") | FR-1 wajib openpyxl ✓ |
| **Multi-item order = baris berulang** (Nomor Pesanan diulang per item) | visual-verified (YUKIDO: "pembeli yang beli lebih dari satu produk… tambahkan quantity nomor pesanan") | Unique key `(order_id, line_key)` bener ✓ |
| Kolom terlihat di layar: `Nomor Pesanan`, `Nama Produk`, `SKU`, `Variasi`, `Jumlah`, `Harga Awal`, `Waktu Pesanan Dibuat` | visual-verified | Synonym ID masuk dictionary ✓ |
| **Ada kolom kosong** di antara kolom data yang harus di-delete manual | visual-verified (YUKIDO: "kolom kosong ya kita buang") | Parser WAJIB skip/detect empty columns — jebakan utama! |
| File perlu "dibersihkan" manual (copy-paste ke template) sebelum dipakai | visual-verified (YUKIDO video 65rb views intinya ini) | Pain point yang kita otomasi — kutip di proposal |
| `Harga Awal` vs harga setelah diskon (kolom terpisah) | visual-verified (YUKIDO: "harga awal… kita buang", kolom terpisah) | `price_basis = list_price_before_discount` ✓ |
| Kolom diskon/voucher terpisah (Penjual vs Shopee) | predicted (struktur standar Shopee; cek sample) | `allocated_discount`, seller vs platform funded |
| `Status Pesanan` Bahasa Indonesia (SELESAI/DIBATALKAN/…) | predicted (UI Shopee ID konsisten; cek sample) | Status map ID → canonical |
| `Nomor Pesanan` 16 digit — rawan notasi ilmiah Excel | predicted | Guard `1.23E+15` FR-7 ✓ |
| Kolom wilayah (Kota/Kabupaten, Provinsi) | predicted (Joyo: "wilayah mana saja yang paling laris" dari data export) | `buyer_kabupaten/provinsi` untuk insights |

Sumber visual: youtu.be/may16OSC9R8 (YUKIDO, 64rb views, full screen-record Excel) · youtu.be/12VO_HbhDKI (Joyo Alkes) · youtu.be/ha7WsCXn5cg (Mindset Finansial, 2026, export keuangan → PDF per bulan; PDF bukan jalur kita).

## 2. TikTok Shop — Export Pesanan (Seller Center)

**Cara export (dari video):** Seller Center → Kelola Pesanan → tab "Semua" → Filter → `waktu dibuat` (rentang tanggal) → Terapkan → Export → "rentang pesanan yang difilter" → **format unduh: Excel** → unduh dari riwayat.

| Temuan | Status | Implikasi parser |
|---|---|---|
| Export mengikuti **filter yang dipilih** (bukan semua order) | visual-verified (BantuSeller seri Master Tracker #3) | `data_from/data_through` per batch ✓ |
| **Format unduh pilihan: Excel** (wajib dipilih manual) | visual-verified | XLSX ✓ |
| UI/status Bahasa Indonesia ("sedang dikirim", "selesai") | visual-verified | Status map ID + EN (setting bahasa seller) |
| `source_system` = TikTok Seller Center | visual-verified | Kolom source_system ✓ |

Sumber visual: youtu.be (BantuSeller "E-commerce Master Tracker #3", seri multi-channel Shopee+TikTok).

## 3. Tokopedia — via Seller Center gabungan

**Fakta resmi (live-check 2026-10-04):** `seller.tokopedia.com/edu` → redirect otomatis ke **"Tokopedia & TikTok Shop Academy"**. Pusat edukasi Tokopedia resmi sudah menyatu dengan TikTok Shop.

| Temuan | Status | Implikasi |
|---|---|---|
| Edukasi & Seller Center Tokopedia-TikTok terintegrasi | **resmi-confirmed (redirect domain resmi)** | `source_system` split v3.1 hampir pasti benar; satu export bisa berisi order kedua marketplace |
| Format export Tokopedia mandiri masih ada? | unverified | Raken cek dropdown export di sample seller (PRD §2.2 #6, OQ 14) |
| Pitch "3 channel" | — | Siap adaptasi jadi "2 Seller Center + Lazada" sesuai temuan |

## 4. Portal resmi — tidak bisa jadi sumber format

| Portal | Hasil live-check 2026-10-04 |
|---|---|
| help.shopee.co.id (article export) | Anti-bot, navigation timeout (Obscura 30s deadline) |
| seller.tiktok.com / open.tiktokshop.com docs | 404 / blokir network |
| open.shopee.com (Open Platform) | Crawl diblokir (konten behind auth) |
| seller.tokopedia.com/edu | **Redirect resmi → Tokopedia & TikTok Shop Academy** (temuan #3 di atas) |

Kesimpulan: spek kolom export TIDAK PERNAH dipublish publik. **File asli dari seller = satu-satunya sumber fixture valid.**

## 5. Proxy referensi terstruktur (untuk synonym dictionary Tier-2)

Open Platform docs (field API biasanya nyerminoi kolom export):
- Shopee: `open.shopee.com` → `v2.order.get_order_list` / `v2.order.get_order_by_id` (order_status, item_list[].model_sku, item_list[].model_original_price, actual_shipping_fee…)
- TikTok Shop: `open.tiktokshop.com` → `/order/search` (id, status, line_items[].sku_id, line_items[].sku_name…)
- Lazada: `open.lazada.com` → `GetOrders` / `GetOrderItems` (punya pemisahan retail_price vs item_price, voucher penjual vs platform di level item — dari studi API publik)

⚠️ Field API ≠ nama kolom export. Ini buat **sinonym dictionary + peta konsep**, bukan fixture.

## 6. Komunitas / template tersebar

- YouTube: seri "E-commerce Master Tracker" (BantuSeller) — workflow upload export Shopee+TikTok ke satu tracker Excel = **bukti pasar** (seller ngelakuin manual hari ini) + bahannya buat video pembanding demo kita.
- Template rekap stok Excel buatan komunitas (grup FB seller, blog e-commerce tools): berguna untuk memperkaya synonym dictionary, BUKAN fixture.
- Temuan ekstra: template "Alur Bisnis Harian" berbasis hasil export per marketplace beredar luas — pola kolomnya konsisten dengan catatan di atas.

## 7. Action items

- [ ] **Raken:** minta 2–3 seller → export pesanan 30 hari **csv + xlsx** (Shopee, TikTok Shop, cek dropdown Tokopedia), export produk/stok, 1 settlement report per channel → taruh `docs/formats/samples/` (di-sanitize dulu! buang kolom Nama/Telepon/Alamat sebelum share ke repo).
- [ ] **Yuken:** setelah sample masuk → tulis `configs/channels/*.yaml` + fixture test dari sample.
- [ ] **Bob:** screenshot/video riset ini jadi slide "research" proposal (kita riset format dari screen-recorded usage asli).
- [ ] Semua fixture yang dishare tim WAJIB di-sanitize (PII) — konsisten FR-29.
