-- ============================================================================
-- Migration 0016: Security, RLS & Schema Integrity Hardening (Audit Max)
--
-- 1. [P0-1] Kunci hak akses tabel seller_members (SELECT only untuk client;
--    cegah pengambilalihan workspace toko oleh user lain via direct REST POST).
-- 2. [P0-2] Aktifkan RLS dan tolak akses client anon/authenticated pada platform_admins.
-- 3. [P1-1] Paksa deduplikasi pesanan tetap unik meskipun shop_id bernilai NULL
--    (menggunakan NULLS NOT DISTINCT Postgres 15+).
-- 4. [P1-3] Tambahkan ON DELETE SET NULL pada order_lines.product_link_id agar
--    penghapusan produk tidak menabrak FK restrict.
-- 5. [P2-1] Optimasi performa subquery scalar initPlan pada consents.
-- 6. [P1-4/P2-5/P2-6] Covering indexes untuk hot query paths (dedup lookup, sold_at range, sku_raw lookup).
-- ============================================================================

-- 1. Lock down seller_members RLS
DROP POLICY IF EXISTS member_self ON public.seller_members;
DROP POLICY IF EXISTS member_select_self ON public.seller_members;
CREATE POLICY member_select_self ON public.seller_members FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 2. Enable RLS and deny anon/authenticated on platform_admins
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.platform_admins FROM anon, authenticated, public;
GRANT ALL ON TABLE public.platform_admins TO service_role;

-- 3. Enforce dedup key uniqueness for null shop_id
ALTER TABLE public.order_lines
  DROP CONSTRAINT IF EXISTS order_lines_seller_id_source_system_sales_channel_shop_id__key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_order_lines_dedup
  ON public.order_lines (seller_id, source_system, sales_channel, shop_id, order_id, line_key)
  NULLS NOT DISTINCT;

-- 4. Add ON DELETE SET NULL on order_lines.product_link_id
ALTER TABLE public.order_lines DROP CONSTRAINT IF EXISTS fk_order_lines_product;
ALTER TABLE public.order_lines ADD CONSTRAINT fk_order_lines_product
  FOREIGN KEY (product_link_id) REFERENCES public.product_links(id) ON DELETE SET NULL;

-- 5. Fix consents initPlan performance
DROP POLICY IF EXISTS consents_self ON public.consents;
CREATE POLICY consents_self ON public.consents FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 6. Covering indexes for hot query paths
CREATE INDEX IF NOT EXISTS idx_order_lines_dedup_lookup
  ON public.order_lines (seller_id, source_system, sales_channel, COALESCE(shop_id, ''), order_id, line_key);
CREATE INDEX IF NOT EXISTS idx_order_lines_seller_sold_at
  ON public.order_lines (seller_id, sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_links_seller_sku
  ON public.product_links (seller_id, sku_raw);
