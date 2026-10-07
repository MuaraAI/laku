-- 0014_add_source_system_to_import_batches.sql
-- Menambahkan kolom source_system ke import_batches agar menyimpan sistem asal impor
-- (contoh: shopee_seller_center, tiktok_shop_seller_center, tokopedia_seller_dashboard).

ALTER TABLE public.import_batches ADD COLUMN IF NOT EXISTS source_system text;
