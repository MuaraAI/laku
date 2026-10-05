# Seed Data Narrative — Laku Demo (FR-9)

> Spesifikasi buat penulis seed script (Yuken, M2). Target: **setiap state engine + overlay kelihatan dalam 1 layar dashboard tanpa scrolling narratif.** Semua angka organik (bukan 99.99%/50%), nama toko & produk realistis Pontianak.

## Seller (3, untuk insights k-anonymity Phase B)

| Seller | Toko | Kanal | Kategori | shared_to_insights |
|---|---|---|---|---|
| S1 (utama, demo) | Warung Bu Rina — Pontianak Barat | Shopee + TikTok Shop | Sembako & kebutuhan rumah | ON |
| S2 | Kedai Batu Layang — Pontianak Kota | Shopee | FnB / kebutuhan kedai | ON |
| S3 | Toko Abang Motor — Singkawang | TikTok Shop | Sparepart & aksesoris motor | ON (1 lagi OFF untuk demo default) |

Periode data: **1 Juli – 30 September 2026** (3 bulan; cukup buat DEAD ≥60 hari & tren).

## Katalog S1 — peta produk → state engine

| Produk | State yang didemokan | Resep data |
|---|---|---|
| Beras Ramos Premium 5kg | **CRITICAL** | Velocity ±8/hari naik (bulanan naik), stok sisa 9 → cover 1 hari ≤ LT |
| Minyak Goreng Sania 2L | **REORDER** | Stabil 3/hari, on_hand 28 → IP ≤ ROP, cover 9 hari > LT |
| Gula Pasir Gulaku 1kg | **OK** | 2/hari, on_hand 65 → cover 32 hari |
| Teh Celup Sariwangi isi 50 | **OVERSTOCK** (rough estimate) | 4 unit/30 hari, stok 210 → cover ~1.575 hari; ada cost_price → modal tertahan tampil |
| Lampu Tidur LED Awan | **DEAD** | HANYA ada di stock template (0 laku 90 hari, stok 35) → bukti A10 |
| Kopi Kapal Api Blend 165g | **INSUFFICIENT_DATA** | Baru aktif 10 hari, 3 unit → no quantity, tampil raw sales |
| Air Mineral Club 1500ml | **NEGATIVE overlay** | on_hand computed −6 → "Cocokkan stok", no quantity sampai dikonfirmasi |
| Galon Isi Ulang (voucher) | Trend RISING | ratio μ7/μ30 ≥ 1.2 (musiman panas Sep) |
| Sabun Colek Batang | Trend DECLINING | ratio ≤ 0.8 |
| Kopi Sachs 65g | Trend STABLE + **STALE overlay** | Datanya kontributor TikTok; TikTok S1 tidak diimpor 9 hari → badge "Perlu data terbaru", cover anchor ke data_through |

## Resep order (edge cases FR-9)

1. **Multi-item:** 1 order Shopee = Beras 2 + Minyak 1 + Gula 2 (3 baris, order ID berulang) — uji line_key.
2. **Diskon line:** Minyak diskon penjual Rp1.500/pc (kolom diskon seller).
3. **Voucher order-level:** voucher penjual Rp10.000 di order 3-item → alokasi pro-rata ke line (uji §9D).
4. **Cancelled:** 2 order "Dibatalkan" (Beras + Teh Celup) → exclude dari demand, muncul di recap "dibatalkan (info)".
5. **Returned:** 1 order Minyak retur 12 Sep → stok restore + masuk Returns recap.
6. **Stockout gap:** Beras stok 0 selama 4 hari (14–17 Agu) → stockout-day adjustment engine + warning UI.
7. **Stale channel:** S1 TikTok terakhir impor 25 Sep → overlay STALE pada produk kontributornya.
8. **Voucher platform vs penjual:** minimal 1 order dengan keduanya (platform-funded tidak mengurangi net seller).
9. **ID Excel:** sample fixture menyertakan 1 ID dalam notasi ilmiah `1.234E+15` (uji FR-7 guard).

## Regional spread (buyer) — untuk insights Phase B

S1: Pontianak Kota 55%, Pontianak Barat 20%, Kubu Raya 12%, Mempawah 8%, Singkawang 5%.
S2: Pontianak Kota 80%, Kubu Raya 20%. S3: Singkawang 60%, Pontianak 40%.
Kategori (taksonomi A12): sembako, minuman, kebersihan, motor, FnB. Kecamatan best-effort dari alamat (provinsi+Kota/Kab pasti).

## Angka acuan demo (layar Ringkasan S1)

Omzet kotor 30 hari ±Rp18.450.000 · Net ±Rp17.120.000 · SKU aktif 10 · Urgent 2 (CRITICAL+REORDER) · Stop-buying 2 (OVERSTOCK+DEAD) · Banner "TikTok: data s/d 25 Sep". Angka final dihitung dari generator, bukan hardcode.

## Rules generator

- Nama pembeli/HP/alamat **tidak pernah dibuat** — seed langsung tulis `buyer_kabupaten` (konsisten FR-29; tidak ada PII di file seed).
- Tanggal `sold_at` timestamptz WIB; beberapa order jam 23:xx untuk uji bucketing.
- Setiap produk S1 harus menghasilkan tepat 1 state + overlay sesuai tabel — jadi klaim FR-9 "every state demonstrable" terpenuhi dan bisa dites otomatis (assert per state di seed test).
