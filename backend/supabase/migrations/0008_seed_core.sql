-- Migration 0008: Realtime Platform Stats RPC & Seed Narrative Data
BEGIN;


CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_sellers_active', (SELECT count(*) FROM sellers),
    'total_products_monitored', (SELECT count(*) FROM products),
    'total_orders_analyzed', (SELECT count(*) FROM order_lines),
    'total_batches_processed', (SELECT count(*) FROM import_batches),
    'urgency_distribution', jsonb_build_object(
      'critical', (SELECT count(*) FROM recommendations WHERE state = 'CRITICAL'),
      'reorder', (SELECT count(*) FROM recommendations WHERE state = 'REORDER'),
      'ok', (SELECT count(*) FROM recommendations WHERE state = 'OK'),
      'overstock', (SELECT count(*) FROM recommendations WHERE state = 'OVERSTOCK'),
      'dead', (SELECT count(*) FROM recommendations WHERE state = 'DEAD')
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon, authenticated, service_role;


INSERT INTO sellers (id, name, email, plan, timezone, service_level, lead_time_days, cycle_days, review_days, overstock_days, shared_to_insights)
VALUES
  ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Toko Demo Sembako (Bu Rina)', 'demo-sembako@muaraai.com', 'pro', 'Asia/Jakarta', 0.95, 5, 14, 7, 60, true),
  ('8b57ce89-fffe-5e24-b051-c2cef7078701', 'Kedai Batu Layang', 'kedai-batulayang@muaraai.com', 'free', 'Asia/Jakarta', 0.95, 4, 14, 7, 60, true),
  ('17e27cb6-49ba-5deb-90c7-9696c0932a8b', 'Toko Abang Motor', 'abang-motor@muaraai.com', 'pro', 'Asia/Jakarta', 0.95, 6, 14, 7, 60, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('b3b604bb-5e72-5110-b4fe-420bca8bb403', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Beras Ramos Premium 5kg', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'b3b604bb-5e72-5110-b4fe-420bca8bb403', 'shopee', 'shopee:BERAS-RAMOS-5KG', 'BERAS-RAMOS-5KG', 'Beras Ramos Premium 5kg')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('b3b604bb-5e72-5110-b4fe-420bca8bb403', 9, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('15c8e21d-3bbf-5775-9a63-18dddb2be036', 'b3b604bb-5e72-5110-b4fe-420bca8bb403', 'CRITICAL', '{}', 96, 26, 89, 1.1, '{"mu": 8.2, "sigma": 2.1, "lead_time_days": 5, "review_days": 7, "on_hand": 9, "on_order": 0, "defaults_flagged": ["lead_time"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('339fe8d1-325c-5d94-b90f-a8bd45823308', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Minyak Goreng Sania 2L', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '339fe8d1-325c-5d94-b90f-a8bd45823308', 'shopee', 'shopee:MINYAK-SANIA-2L', 'MINYAK-SANIA-2L', 'Minyak Goreng Sania 2L')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('339fe8d1-325c-5d94-b90f-a8bd45823308', 28, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('7a70ccb4-b21b-5b1d-96dd-0172467fd515', '339fe8d1-325c-5d94-b90f-a8bd45823308', 'REORDER', '{}', 41, 11, 24, 9.3, '{"mu": 3.0, "sigma": 0.8, "lead_time_days": 5, "review_days": 7, "on_hand": 28, "on_order": 0, "defaults_flagged": []}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('16e9dcac-aa44-55a5-bdfb-a35744e8c4e3', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Gula Pasir Gulaku 1kg', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '16e9dcac-aa44-55a5-bdfb-a35744e8c4e3', 'shopee', 'shopee:GULA-GULAKU-1KG', 'GULA-GULAKU-1KG', 'Gula Pasir Gulaku 1kg')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('16e9dcac-aa44-55a5-bdfb-a35744e8c4e3', 65, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('b7478fa3-320f-579b-a52f-a7dc89521064', '16e9dcac-aa44-55a5-bdfb-a35744e8c4e3', 'OK', '{}', 38, 10, 0, 32.5, '{"mu": 2.0, "sigma": 0.6, "lead_time_days": 5, "review_days": 7, "on_hand": 65, "on_order": 0, "defaults_flagged": []}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('066f4e90-2ffb-5449-bc6c-2501dc6a629d', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Teh Celup Sariwangi isi 50', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '066f4e90-2ffb-5449-bc6c-2501dc6a629d', 'shopee', 'shopee:TEH-SARIWANGI-50', 'TEH-SARIWANGI-50', 'Teh Celup Sariwangi isi 50')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('066f4e90-2ffb-5449-bc6c-2501dc6a629d', 210, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('5e6d3d21-aa45-5969-8b91-be7ad52ba569', '066f4e90-2ffb-5449-bc6c-2501dc6a629d', 'OVERSTOCK', '{}', 0, 0, 0, 1575.0, '{"mu_obs": 0.13, "on_hand": 210, "overstock_days": 60, "note": "estimasi kasar (<5 unit/30 hari)"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('12432e81-4286-59bf-9d53-b375f4379def', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Lampu Tidur LED Awan', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '12432e81-4286-59bf-9d53-b375f4379def', 'shopee', 'shopee:LAMPU-LED-AWAN', 'LAMPU-LED-AWAN', 'Lampu Tidur LED Awan')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('12432e81-4286-59bf-9d53-b375f4379def', 35, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('07fdb7a0-f67f-5442-8b41-4e6c575a21d4', '12432e81-4286-59bf-9d53-b375f4379def', 'DEAD', '{}', 0, 0, 0, NULL, '{"history_days": 92, "units_sold_60d": 0, "on_hand": 35, "source": "stock_template"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('40bf16c6-f6f1-53ee-87dd-8bb4ebacaf35', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Kopi Kapal Api Blend 165g', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '40bf16c6-f6f1-53ee-87dd-8bb4ebacaf35', 'shopee', 'shopee:KOPI-KAPAL-165', 'KOPI-KAPAL-165', 'Kopi Kapal Api Blend 165g')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('40bf16c6-f6f1-53ee-87dd-8bb4ebacaf35', 10, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('195e4be0-e506-5075-a7ee-c085dff60cd9', '40bf16c6-f6f1-53ee-87dd-8bb4ebacaf35', 'INSUFFICIENT_DATA', '{}', 0, 0, 0, NULL, '{"history_days": 10, "units_sold_30d": 3, "note": "raw sales ditampilkan"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('c45d15a6-275c-5a06-aeb8-2fb997b897ba', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Air Mineral Club 1500ml', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'c45d15a6-275c-5a06-aeb8-2fb997b897ba', 'shopee', 'shopee:AIR-CLUB-1500', 'AIR-CLUB-1500', 'Air Mineral Club 1500ml')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('c45d15a6-275c-5a06-aeb8-2fb997b897ba', 10, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('92593c0f-7fa1-5657-b9d1-4abc88dade87', 'c45d15a6-275c-5a06-aeb8-2fb997b897ba', 'OK', '{}', 30, 8, 0, NULL, '{"on_hand_computed": -6, "note": "Cocokkan stok \u2014 stok buku tidak mungkin negatif"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('2a4a501a-9d4e-5429-9925-a54b13d05457', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Galon Isi Ulang', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '2a4a501a-9d4e-5429-9925-a54b13d05457', 'shopee', 'shopee:GALON-ISI', 'GALON-ISI', 'Galon Isi Ulang')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('2a4a501a-9d4e-5429-9925-a54b13d05457', 27, '2026-09-01', 2)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('d4ef5a2b-72a9-50a9-8209-4c71c5beb788', '2a4a501a-9d4e-5429-9925-a54b13d05457', 'REORDER', '{}', 22, 6, 18, 6.0, '{"mu": 4.5, "mu_7d": 5.8, "ratio": 1.29, "lead_time_days": 2, "on_hand": 27}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('547ec288-3608-5a42-a9c5-5fccf336b4a2', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Sabun Colek Batang', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '547ec288-3608-5a42-a9c5-5fccf336b4a2', 'shopee', 'shopee:SABUN-COLEK', 'SABUN-COLEK', 'Sabun Colek Batang')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('547ec288-3608-5a42-a9c5-5fccf336b4a2', 33, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('b9b1530f-3c6f-599f-aa86-014788249d74', '547ec288-3608-5a42-a9c5-5fccf336b4a2', 'OK', '{}', 5, 2, 0, 41.0, '{"mu": 0.8, "mu_7d": 0.4, "ratio": 0.5, "on_hand": 33}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;


INSERT INTO products (id, seller_id, canonical_name, match_state)
VALUES ('1cbec7d6-b467-5356-8b9d-0262f29a4db4', 'a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'Kopi Sachs 65g', 'exact')
ON CONFLICT (id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;

INSERT INTO product_links (seller_id, product_id, channel, channel_product_key, sku_raw, title_raw)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', '1cbec7d6-b467-5356-8b9d-0262f29a4db4', 'shopee', 'shopee:KOPI-SACHS-65', 'KOPI-SACHS-65', 'Kopi Sachs 65g')
ON CONFLICT (seller_id, channel, channel_product_key) DO UPDATE SET sku_raw = EXCLUDED.sku_raw;


INSERT INTO stock_items (product_id, opening_qty, opening_date, lead_time_days)
VALUES ('1cbec7d6-b467-5356-8b9d-0262f29a4db4', 12, '2026-09-01', 5)
ON CONFLICT (product_id) DO UPDATE SET opening_qty = EXCLUDED.opening_qty;


INSERT INTO recommendations (id, product_id, state, overlays, reorder_point, safety_stock, suggested_qty, days_of_cover, inputs)
VALUES ('ba292471-7632-5d59-8ff3-5740cd78a0ba', '1cbec7d6-b467-5356-8b9d-0262f29a4db4', 'REORDER', '{}', 26, 7, 12, 8.0, '{"mu": 1.5, "sigma": 0.5, "lead_time_days": 5, "review_days": 7, "on_hand": 12, "data_through": "2026-09-25", "note": "kanal tiktok_shop terakhir impor 25 Sep"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;



COMMIT;
