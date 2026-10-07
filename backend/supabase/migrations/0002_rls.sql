-- ============ RLS ============
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;

-- helper: seller_id milik user saat ini
CREATE OR REPLACE FUNCTION current_seller_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT seller_id FROM seller_members WHERE user_id = auth.uid()
$$;

-- seller scoping: semua tabel dengan seller_id
DO $$
DECLARE t text;
BEGIN
  -- tabel sellers menggunakan primary key id
  CREATE POLICY seller_isolation ON sellers FOR ALL
    USING (id IN (SELECT current_seller_ids()))
    WITH CHECK (id IN (SELECT current_seller_ids()));

  -- tabel entitas anak menggunakan kolom foreign key seller_id
  FOREACH t IN ARRAY ARRAY['import_batches','order_lines','products','product_links']
  LOOP
    EXECUTE format('CREATE POLICY seller_isolation ON %I FOR ALL USING (seller_id IN (SELECT current_seller_ids())) WITH CHECK (seller_id IN (SELECT current_seller_ids()))', t);
  END LOOP;
END $$;

-- seller_members: user lihat membership sendiri
CREATE POLICY member_self ON seller_members FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- import_staging via batch seller
CREATE POLICY staging_seller ON import_staging FOR ALL
  USING (EXISTS (SELECT 1 FROM import_batches b WHERE b.id = batch_id AND b.seller_id IN (SELECT current_seller_ids())))
  WITH CHECK (EXISTS (SELECT 1 FROM import_batches b WHERE b.id = batch_id AND b.seller_id IN (SELECT current_seller_ids())));

-- stock via product seller
CREATE POLICY stock_items_seller ON stock_items FOR ALL
  USING (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())))
  WITH CHECK (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())));

CREATE POLICY stock_movements_seller ON stock_movements FOR ALL
  USING (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())))
  WITH CHECK (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())));

CREATE POLICY recommendations_seller ON recommendations FOR ALL
  USING (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())))
  WITH CHECK (product_id IN (SELECT id FROM products WHERE seller_id IN (SELECT current_seller_ids())));

-- consents & ai: user milik sendiri
CREATE POLICY consents_self ON consents FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_chat_self ON ai_chat_messages FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_memories_self ON ai_memories FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- audit_log: admin baca semua; sisanya service-only (no policy = deny to anon/authenticated)
-- platform_admins: managed via service role

-- channels: public read-only reference
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY channels_read ON channels FOR SELECT USING (true);
