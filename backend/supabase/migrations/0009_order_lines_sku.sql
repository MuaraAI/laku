-- ============================================================================
-- Migration 0009: Add sku column to order_lines and update upsert_order_lines RPC
--
-- Memperbaiki temuan audit database:
-- 1. order_lines butuh kolom sku untuk query performan stock_ledger/recommendations
--    (menghindari query gagal PostgREST 400).
-- 2. Update upsert_order_lines RPC untuk insert/update kolom sku.
-- ============================================================================

ALTER TABLE order_lines ADD COLUMN IF NOT EXISTS sku text;
CREATE INDEX IF NOT EXISTS idx_order_lines_seller_sku_status ON order_lines(seller_id, sku, status);

CREATE OR REPLACE FUNCTION upsert_order_lines(
  p_seller_id uuid,
  p_batch_id uuid,
  p_rows jsonb,
  p_change_log jsonb DEFAULT '[]'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
  v_new int := 0;
  v_updated int := 0;
  v_unchanged int := 0;
  v_existing record;
  v_changed boolean;
BEGIN
  IF p_seller_id IS NULL THEN
    RAISE EXCEPTION 'seller_id wajib';
  END IF;

  IF auth.uid() IS NOT NULL AND p_seller_id NOT IN (SELECT current_seller_ids()) THEN
    RAISE EXCEPTION 'seller % bukan milik user', p_seller_id;
  END IF;

  FOR r IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    SELECT * INTO v_existing FROM order_lines o
    WHERE o.seller_id = p_seller_id
      AND o.source_system = r->>'source_system'
      AND o.sales_channel = r->>'sales_channel'
      AND COALESCE(o.shop_id, '') = COALESCE(r->>'shop_id', '')
      AND o.order_id = r->>'order_id'
      AND o.line_key = r->>'line_key';

    IF v_existing IS NULL THEN
      INSERT INTO order_lines (
        seller_id, source_system, sales_channel, shop_id, order_id, line_key,
        sku, status, qty, unit_price, discount_amount, allocated_discount,
        sold_at, buyer_province, buyer_kabupaten, buyer_kecamatan
      ) VALUES (
        p_seller_id,
        r->>'source_system',
        r->>'sales_channel',
        NULLIF(r->>'shop_id', ''),
        r->>'order_id',
        r->>'line_key',
        NULLIF(r->>'sku', ''),
        r->>'status',
        (r->>'qty')::int,
        (r->>'unit_price')::numeric,
        COALESCE((r->>'discount_amount')::numeric, 0),
        (r->>'allocated_discount')::numeric,
        (r->>'sold_at')::timestamptz,
        NULLIF(r->>'buyer_province', ''),
        NULLIF(r->>'buyer_kabupaten', ''),
        NULLIF(r->>'buyer_kecamatan', '')
      );
      v_new := v_new + 1;
    ELSE
      v_changed := (
        v_existing.status IS DISTINCT FROM r->>'status'
        OR v_existing.qty IS DISTINCT FROM (r->>'qty')::int
        OR v_existing.unit_price IS DISTINCT FROM (r->>'unit_price')::numeric
        OR v_existing.discount_amount IS DISTINCT FROM COALESCE((r->>'discount_amount')::numeric, 0)
        OR v_existing.allocated_discount IS DISTINCT FROM (r->>'allocated_discount')::numeric
        OR v_existing.sku IS DISTINCT FROM NULLIF(r->>'sku', '')
      );
      IF v_changed THEN
        UPDATE order_lines o SET
          status = r->>'status',
          qty = (r->>'qty')::int,
          unit_price = (r->>'unit_price')::numeric,
          discount_amount = COALESCE((r->>'discount_amount')::numeric, 0),
          allocated_discount = (r->>'allocated_discount')::numeric,
          sku = COALESCE(NULLIF(r->>'sku', ''), o.sku)
        WHERE o.id = v_existing.id;
        v_updated := v_updated + 1;
      ELSE
        v_unchanged := v_unchanged + 1;
      END IF;
    END IF;
  END LOOP;

  UPDATE import_batches b SET
    status = 'committed',
    rows_new = v_new,
    rows_updated = v_updated,
    rows_unchanged = v_unchanged,
    change_log = p_change_log
  WHERE b.id = p_batch_id AND b.seller_id = p_seller_id;

  DELETE FROM import_staging s
  USING import_batches b
  WHERE s.batch_id = b.id AND b.id = p_batch_id AND b.seller_id = p_seller_id;

  RETURN jsonb_build_object('new', v_new, 'updated', v_updated, 'unchanged', v_unchanged);
END;
$$;

REVOKE EXECUTE ON FUNCTION upsert_order_lines(uuid, uuid, jsonb, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION upsert_order_lines(uuid, uuid, jsonb, jsonb) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION get_platform_stats() FROM anon;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated, service_role;
