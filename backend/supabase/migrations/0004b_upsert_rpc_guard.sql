-- Migration 0004b — upsert_order_lines: + guard kepemilikan seller, pin search_path (dipanggil ImportsSupabaseStore.upsert_lines)
--
-- Dedup key 6 kolom (aturan mengikat #5): file sama 2x = 0 new, 0 updated.
-- Status/qty/harga berubah via re-import = 1 updated + change_log tercatat.
--
-- RLS: dipanggil dengan client per-user (anon/authenticated), jadi function
-- ini berjalan dengan izin PEMANGGIL (security invoker). Baris hanya bisa
-- menyentuh seller_id milik user via RLS kecuali dipanggil service_role.
-- p_seller_id dipakai untuk scoping eksplisit dan dicocokkan hard di WHERE.

CREATE OR REPLACE FUNCTION upsert_order_lines(
  p_seller_id uuid,
  p_batch_id uuid,
  p_rows jsonb,
  p_change_log jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_new int := 0;
  v_updated int := 0;
  v_unchanged int := 0;
  r jsonb;
  v_existing record;
  v_changed boolean;
BEGIN
  IF p_seller_id IS NULL THEN
    RAISE EXCEPTION 'seller_id wajib';
  END IF;

  -- Guard kepemilikan (defence-in-depth): p_seller_id HARUS milik pemanggil.
  -- Tanpa ini, kalau policy RLS berubah, RPC bisa silent no-op lintas seller.
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
      -- catatan: products/product_links matching (B3 auto-link) menyusul;
      -- kolom product_link_id boleh NULL.
      INSERT INTO order_lines (
        seller_id, source_system, sales_channel, shop_id, order_id, line_key,
        status, qty, unit_price, discount_amount, allocated_discount,
        sold_at, buyer_province, buyer_kabupaten, buyer_kecamatan
      ) VALUES (
        p_seller_id,
        r->>'source_system',
        r->>'sales_channel',
        NULLIF(r->>'shop_id', ''),
        r->>'order_id',
        r->>'line_key',
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
        OR v_existing.allocated_discount IS DISTINCT FROM (r->>'allocated_discount')::numeric
      );
      IF v_changed THEN
        UPDATE order_lines o SET
          status = r->>'status',
          qty = (r->>'qty')::int,
          unit_price = (r->>'unit_price')::numeric,
          discount_amount = COALESCE((r->>'discount_amount')::numeric, 0),
          allocated_discount = (r->>'allocated_discount')::numeric
        WHERE o.id = v_existing.id;
        v_updated := v_updated + 1;
      ELSE
        v_unchanged := v_unchanged + 1;
      END IF;
    END IF;
  END LOOP;

  -- tandai batch committed + simpan change_log
  UPDATE import_batches b SET
    status = 'committed',
    rows_new = v_new,
    rows_updated = v_updated,
    rows_unchanged = v_unchanged,
    change_log = p_change_log
  WHERE b.id = p_batch_id AND b.seller_id = p_seller_id;

  -- ADR-2: purge staging setelah commit
  DELETE FROM import_staging s
  USING import_batches b
  WHERE s.batch_id = b.id AND b.id = p_batch_id AND b.seller_id = p_seller_id;

  RETURN jsonb_build_object('new', v_new, 'updated', v_updated, 'unchanged', v_unchanged);
END;
$$;


-- Revoke dari anon: hanya authenticated (RLS tetap aktif) + service_role.
REVOKE EXECUTE ON FUNCTION upsert_order_lines(uuid, uuid, jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION upsert_order_lines(uuid, uuid, jsonb, jsonb) TO authenticated, service_role;
