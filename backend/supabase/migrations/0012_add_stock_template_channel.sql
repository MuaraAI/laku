-- ============================================================================
-- Migration 0012: Add stock_template and manual channels to channels table
--
-- Menambahkan channel internal 'stock_template' dan 'manual' agar foreign key
-- product_links_channel_fkey terpenuhi saat user menambahkan saldo awal stok / produk manual.
-- ============================================================================

INSERT INTO public.channels (id, display_name) VALUES
  ('stock_template', 'Saldo Awal / Template Stok'),
  ('manual', 'Manual')
ON CONFLICT (id) DO NOTHING;
