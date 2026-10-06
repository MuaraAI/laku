

-- ============ CORE: sellers & membership ============
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  plan_expires_at timestamptz,
  timezone text NOT NULL DEFAULT 'Asia/Jakarta',
  service_level numeric NOT NULL DEFAULT 0.95,
  lead_time_days int NOT NULL DEFAULT 5,
  cycle_days int NOT NULL DEFAULT 14 CHECK (cycle_days >= 0),
  review_days int NOT NULL DEFAULT 7 CHECK (review_days >= 0),
  overstock_days int NOT NULL DEFAULT 60,
  shared_to_insights boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_members (
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','operator')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (seller_id, user_id)
);

CREATE TABLE IF NOT EXISTS platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channels (
  id text PRIMARY KEY,
  display_name text NOT NULL
);
INSERT INTO channels (id, display_name) VALUES
  ('shopee','Shopee'),('tiktok_shop','TikTok Shop'),('tokopedia','Tokopedia'),('lazada','Lazada')
ON CONFLICT (id) DO NOTHING;


-- ============ IMPORT ============
CREATE TABLE IF NOT EXISTS import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  channel text NOT NULL REFERENCES channels(id),
  file_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','preview','committed','failed','expired')),
  rows_read int NOT NULL DEFAULT 0,
  rows_new int NOT NULL DEFAULT 0,
  rows_updated int NOT NULL DEFAULT 0,
  rows_unchanged int NOT NULL DEFAULT 0,
  rows_problem int NOT NULL DEFAULT 0,
  row_count int NOT NULL DEFAULT 0,
  data_from date,
  data_through date,
  sku_fill_rate numeric,
  change_log jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_import_batches_seller ON import_batches(seller_id, created_at DESC);

CREATE TABLE IF NOT EXISTS import_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  line_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_staging_batch ON import_staging(batch_id);


-- ============ ORDER LINES (jantung data) ============
CREATE TABLE IF NOT EXISTS order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  source_system text NOT NULL,
  sales_channel text NOT NULL REFERENCES channels(id),
  shop_id text,
  order_id text NOT NULL,
  line_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('completed','in_progress','cancelled','returned','unpaid')),
  qty int NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  discount_amount numeric,
  allocated_discount numeric,
  sold_at timestamptz NOT NULL,
  buyer_province text,
  buyer_kabupaten text,
  buyer_kecamatan text,
  category_id text,
  product_link_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, source_system, sales_channel, shop_id, order_id, line_key)
);
CREATE INDEX idx_order_lines_seller_time ON order_lines(seller_id, sales_channel, sold_at DESC);
CREATE INDEX idx_order_lines_product ON order_lines(product_link_id);


-- ============ PRODUCTS & MATCHING ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  canonical_name text NOT NULL,
  category_id text,
  match_state text NOT NULL DEFAULT 'unmatched' CHECK (match_state IN ('exact','fuzzy','manual','unmatched')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_seller ON products(seller_id);

CREATE TABLE IF NOT EXISTS product_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel text NOT NULL REFERENCES channels(id),
  channel_product_key text NOT NULL,
  sku_raw text,
  title_raw text,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, channel, channel_product_key)
);
CREATE INDEX idx_product_links_product ON product_links(product_id);
ALTER TABLE order_lines ADD CONSTRAINT fk_order_lines_product
  FOREIGN KEY (product_link_id) REFERENCES product_links(id);


-- ============ STOCK ============
CREATE TABLE IF NOT EXISTS stock_items (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  opening_qty int NOT NULL DEFAULT 0 CHECK (opening_qty >= 0),
  opening_date date NOT NULL DEFAULT CURRENT_DATE,
  lead_time_days int,
  lead_time_sd_days numeric,
  cost_price numeric CHECK (cost_price IS NULL OR cost_price >= 0)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('receipt','adjustment','writeoff')),
  qty int NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  by_user uuid REFERENCES auth.users(id),
  note text
);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, at);


-- ============ RECOMMENDATIONS ============
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  computed_at timestamptz NOT NULL DEFAULT now(),
  state text NOT NULL CHECK (state IN ('CRITICAL','REORDER','OK','OVERSTOCK','DEAD','INSUFFICIENT_DATA')),
  overlays text[] NOT NULL DEFAULT '{}',
  reorder_point int,
  safety_stock int,
  suggested_qty int,
  days_of_cover numeric,
  inputs jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_recommendations_product ON recommendations(product_id, computed_at DESC);


-- ============ CONSENTS & AUDIT ============
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  version int NOT NULL DEFAULT 1,
  granted boolean NOT NULL DEFAULT true,
  at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target text,
  meta jsonb NOT NULL DEFAULT '{}',
  at timestamptz NOT NULL DEFAULT now()
);


-- ============ PHASE B (struktur siap, fitur menyusul) ============
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_chat_user ON ai_chat_messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
