-- 0013_fix_rls_seller_id_column.sql
-- Memperbaiki definisi policy seller_isolation pada tabel relasi anak.
-- Kolom isolasi untuk import_batches, order_lines, products, dan product_links
-- adalah seller_id, bukan id (id adalah UUID entitas itu sendiri).

DO $$
DECLARE t text;
BEGIN
  -- Recreate policies for child tables using seller_id column
  FOREACH t IN ARRAY ARRAY['import_batches','order_lines','products','product_links']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS seller_isolation ON %I;', t);
    EXECUTE format('CREATE POLICY seller_isolation ON %I FOR ALL USING (seller_id IN (SELECT current_seller_ids())) WITH CHECK (seller_id IN (SELECT current_seller_ids()));', t);
  END LOOP;
END $$;
