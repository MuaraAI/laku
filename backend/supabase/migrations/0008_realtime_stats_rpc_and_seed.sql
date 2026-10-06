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


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100023', 'SP-2026100023:SKU-ESK-001', 'completed', 1, 15000.0, 0, '2026-10-05T20:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100031', 'SP-2026100031:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-10-05T18:06:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100036', 'SP-2026100036:SKU-MIE-001', 'in_progress', 1, 22000.0, 0, '2026-10-05T11:55:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100056', 'SP-2026100056:SKU-ROT-002', 'in_progress', 1, 18000.0, 0, '2026-10-05T10:39:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100041', 'SP-2026100041:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-10-04T17:12:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100017', 'SP-2026100017:SKU-NSG-001', 'completed', 1, 25000.0, 0, '2026-10-04T16:28:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100030', 'SP-2026100030:SKU-TEH-001', 'completed', 1, 9000.0, 0, '2026-10-04T11:23:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100057', 'SP-2026100057:SKU-AYG-002', 'completed', 2, 22000.0, 0, '2026-10-03T15:11:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100050', 'SP-2026100050:SKU-MIE-001', 'in_progress', 3, 22000.0, 0, '2026-10-02T16:28:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100008', 'SP-2026100008:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-10-01T13:25:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100058', 'SP-2026100058:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-09-30T21:26:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100014', 'SP-2026100014:SKU-ROT-001', 'completed', 1, 18000.0, 0, '2026-09-30T10:34:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100021', 'SP-2026100021:SKU-NSG-001', 'completed', 1, 25000.0, 0, '2026-09-29T13:51:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100028', 'SP-2026100028:SKU-ESK-001', 'completed', 2, 15000.0, 0, '2026-09-27T19:20:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100012', 'SP-2026100012:SKU-ESK-002', 'completed', 3, 17000.0, 0, '2026-09-27T16:48:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100019', 'SP-2026100019:SKU-ROT-002', 'completed', 1, 18000.0, 0, '2026-09-27T15:13:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100059', 'SP-2026100059:SKU-AYG-002', 'cancelled', 1, 22000.0, 0, '2026-09-26T09:49:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100001', 'SP-2026100001:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-09-26T09:01:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100042', 'SP-2026100042:SKU-NSG-001', 'in_progress', 3, 25000.0, 0, '2026-09-25T13:42:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100011', 'SP-2026100011:SKU-CRS-002', 'cancelled', 3, 16000.0, 0, '2026-09-25T09:24:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100027', 'SP-2026100027:SKU-AYG-003', 'completed', 2, 21000.0, 0, '2026-09-24T17:02:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100003', 'SP-2026100003:SKU-AYG-001', 'completed', 1, 18000.0, 0, '2026-09-24T12:51:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100044', 'SP-2026100044:SKU-TEH-001', 'completed', 2, 9000.0, 0, '2026-09-23T21:00:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100005', 'SP-2026100005:SKU-CRS-001', 'completed', 3, 14000.0, 0, '2026-09-23T12:53:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100016', 'SP-2026100016:SKU-ROT-001', 'completed', 3, 18000.0, 0, '2026-09-23T10:16:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100043', 'SP-2026100043:SKU-TAH-001', 'cancelled', 3, 12000.0, 0, '2026-09-23T10:12:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100013', 'SP-2026100013:SKU-ROT-001', 'in_progress', 1, 18000.0, 0, '2026-09-22T20:11:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100026', 'SP-2026100026:SKU-MIE-001', 'completed', 1, 22000.0, 0, '2026-09-22T09:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100060', 'SP-2026100060:SKU-MIE-002', 'completed', 2, 23000.0, 0, '2026-09-21T18:07:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100047', 'SP-2026100047:SKU-AYG-003', 'completed', 2, 21000.0, 0, '2026-09-21T17:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100045', 'SP-2026100045:SKU-ROT-001', 'in_progress', 2, 18000.0, 0, '2026-09-20T18:13:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100022', 'SP-2026100022:SKU-AYG-003', 'in_progress', 2, 21000.0, 0, '2026-09-20T11:55:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100049', 'SP-2026100049:SKU-PIS-001', 'completed', 3, 15000.0, 0, '2026-09-20T10:51:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100009', 'SP-2026100009:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-09-18T18:29:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100006', 'SP-2026100006:SKU-CRS-001', 'completed', 1, 14000.0, 0, '2026-09-18T12:29:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100048', 'SP-2026100048:SKU-AYG-001', 'in_progress', 1, 18000.0, 0, '2026-09-18T11:09:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100039', 'SP-2026100039:SKU-CRS-002', 'cancelled', 3, 16000.0, 0, '2026-09-17T18:32:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100054', 'SP-2026100054:SKU-CRS-002', 'completed', 2, 16000.0, 0, '2026-09-17T12:48:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100010', 'SP-2026100010:SKU-ROT-001', 'completed', 2, 18000.0, 0, '2026-09-17T11:08:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100038', 'SP-2026100038:SKU-ESK-001', 'completed', 1, 15000.0, 0, '2026-09-15T21:50:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100035', 'SP-2026100035:SKU-AYG-002', 'completed', 2, 22000.0, 0, '2026-09-15T13:57:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100025', 'SP-2026100025:SKU-ROT-002', 'completed', 1, 18000.0, 0, '2026-09-15T11:03:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100051', 'SP-2026100051:SKU-TEH-001', 'completed', 1, 9000.0, 0, '2026-09-14T15:04:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100055', 'SP-2026100055:SKU-AYG-001', 'completed', 2, 18000.0, 0, '2026-09-14T14:31:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100052', 'SP-2026100052:SKU-NSG-002', 'completed', 3, 32000.0, 0, '2026-09-13T14:44:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100015', 'SP-2026100015:SKU-AYG-003', 'completed', 1, 21000.0, 0, '2026-09-13T08:15:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100032', 'SP-2026100032:SKU-ESK-002', 'completed', 3, 17000.0, 0, '2026-09-12T18:40:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100020', 'SP-2026100020:SKU-TAH-001', 'completed', 2, 12000.0, 0, '2026-09-12T09:06:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100037', 'SP-2026100037:SKU-NSG-001', 'in_progress', 2, 25000.0, 0, '2026-09-11T20:44:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100040', 'SP-2026100040:SKU-AYG-002', 'completed', 1, 22000.0, 0, '2026-09-11T17:16:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100007', 'SP-2026100007:SKU-ESK-002', 'completed', 3, 17000.0, 0, '2026-09-11T15:24:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100034', 'SP-2026100034:SKU-NSG-002', 'completed', 3, 32000.0, 0, '2026-09-09T09:56:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100046', 'SP-2026100046:SKU-ESK-001', 'completed', 3, 15000.0, 0, '2026-09-08T21:48:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100018', 'SP-2026100018:SKU-AYG-002', 'completed', 1, 22000.0, 0, '2026-09-08T19:40:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100004', 'SP-2026100004:SKU-CRS-001', 'completed', 2, 14000.0, 0, '2026-09-08T14:06:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100053', 'SP-2026100053:SKU-TAH-001', 'in_progress', 2, 12000.0, 0, '2026-09-07T11:53:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100033', 'SP-2026100033:SKU-NSG-002', 'cancelled', 3, 32000.0, 0, '2026-09-07T08:21:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100029', 'SP-2026100029:SKU-NSG-001', 'completed', 1, 25000.0, 0, '2026-09-06T15:39:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100024', 'SP-2026100024:SKU-PIS-001', 'completed', 2, 15000.0, 0, '2026-09-06T14:16:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'SP-2026100002', 'SP-2026100002:SKU-ESK-001', 'completed', 3, 15000.0, 0, '2026-09-06T09:13:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100030', 'TT-2026100030:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-10-05T20:32:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100039', 'TT-2026100039:SKU-ESK-001', 'completed', 2, 15000.0, 0, '2026-10-05T17:09:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100035', 'TT-2026100035:SKU-ROT-002', 'cancelled', 2, 18000.0, 0, '2026-10-03T13:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100005', 'TT-2026100005:SKU-ESK-002', 'in_progress', 2, 17000.0, 0, '2026-10-02T19:37:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100055', 'TT-2026100055:SKU-ESK-002', 'cancelled', 1, 17000.0, 0, '2026-10-01T17:00:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100007', 'TT-2026100007:SKU-ESK-002', 'completed', 3, 17000.0, 0, '2026-10-01T12:21:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100022', 'TT-2026100022:SKU-PIS-002', 'completed', 3, 15000.0, 0, '2026-09-30T20:11:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100006', 'TT-2026100006:SKU-CRS-002', 'completed', 2, 16000.0, 0, '2026-09-30T15:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100046', 'TT-2026100046:SKU-NSG-001', 'cancelled', 2, 25000.0, 0, '2026-09-29T21:21:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100010', 'TT-2026100010:SKU-CRS-001', 'completed', 3, 14000.0, 0, '2026-09-29T16:21:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100021', 'TT-2026100021:SKU-ESK-002', 'completed', 1, 17000.0, 0, '2026-09-29T13:38:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100034', 'TT-2026100034:SKU-NSG-002', 'completed', 1, 32000.0, 0, '2026-09-29T10:26:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100013', 'TT-2026100013:SKU-PIS-002', 'in_progress', 1, 15000.0, 0, '2026-09-28T10:40:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100025', 'TT-2026100025:SKU-PIS-001', 'completed', 2, 15000.0, 0, '2026-09-27T21:34:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100024', 'TT-2026100024:SKU-ROT-002', 'completed', 1, 18000.0, 0, '2026-09-27T14:52:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100017', 'TT-2026100017:SKU-ESK-001', 'completed', 1, 15000.0, 0, '2026-09-27T09:10:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100049', 'TT-2026100049:SKU-TEH-001', 'completed', 3, 9000.0, 0, '2026-09-26T21:29:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100043', 'TT-2026100043:SKU-ESK-002', 'in_progress', 3, 17000.0, 0, '2026-09-26T11:39:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100051', 'TT-2026100051:SKU-PIS-002', 'completed', 3, 15000.0, 0, '2026-09-26T09:53:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100036', 'TT-2026100036:SKU-TEH-001', 'completed', 1, 9000.0, 0, '2026-09-25T09:15:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100002', 'TT-2026100002:SKU-ESK-001', 'completed', 1, 15000.0, 0, '2026-09-24T19:53:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100031', 'TT-2026100031:SKU-TEH-002', 'in_progress', 3, 12000.0, 0, '2026-09-23T15:22:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100003', 'TT-2026100003:SKU-CRS-001', 'completed', 1, 14000.0, 0, '2026-09-23T14:42:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100019', 'TT-2026100019:SKU-NSG-002', 'in_progress', 2, 32000.0, 0, '2026-09-23T11:41:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100038', 'TT-2026100038:SKU-MIE-001', 'completed', 1, 22000.0, 0, '2026-09-22T14:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100028', 'TT-2026100028:SKU-ROT-001', 'completed', 3, 18000.0, 0, '2026-09-21T19:18:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100033', 'TT-2026100033:SKU-ROT-001', 'completed', 3, 18000.0, 0, '2026-09-21T08:08:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100020', 'TT-2026100020:SKU-CRS-002', 'completed', 2, 16000.0, 0, '2026-09-20T19:19:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100016', 'TT-2026100016:SKU-TAH-001', 'completed', 2, 12000.0, 0, '2026-09-20T15:19:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100052', 'TT-2026100052:SKU-CRS-001', 'cancelled', 1, 14000.0, 0, '2026-09-20T15:15:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100053', 'TT-2026100053:SKU-NSG-001', 'completed', 2, 25000.0, 0, '2026-09-18T12:12:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100029', 'TT-2026100029:SKU-ROT-001', 'in_progress', 3, 18000.0, 0, '2026-09-18T11:58:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100004', 'TT-2026100004:SKU-PIS-001', 'completed', 3, 15000.0, 0, '2026-09-17T18:57:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100044', 'TT-2026100044:SKU-AYG-002', 'completed', 3, 22000.0, 0, '2026-09-15T20:28:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100027', 'TT-2026100027:SKU-ROT-002', 'completed', 2, 18000.0, 0, '2026-09-15T16:00:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100012', 'TT-2026100012:SKU-MIE-001', 'completed', 2, 22000.0, 0, '2026-09-15T11:23:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100001', 'TT-2026100001:SKU-AYG-001', 'completed', 2, 18000.0, 0, '2026-09-15T09:37:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100042', 'TT-2026100042:SKU-AYG-002', 'completed', 3, 22000.0, 0, '2026-09-14T08:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100032', 'TT-2026100032:SKU-TAH-001', 'completed', 1, 12000.0, 0, '2026-09-13T21:49:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100008', 'TT-2026100008:SKU-PIS-002', 'in_progress', 3, 15000.0, 0, '2026-09-13T19:26:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100041', 'TT-2026100041:SKU-PIS-002', 'completed', 1, 15000.0, 0, '2026-09-12T14:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100026', 'TT-2026100026:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-09-12T12:35:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100045', 'TT-2026100045:SKU-ROT-002', 'completed', 2, 18000.0, 0, '2026-09-12T10:50:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100037', 'TT-2026100037:SKU-AYG-001', 'completed', 1, 18000.0, 0, '2026-09-11T19:19:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100014', 'TT-2026100014:SKU-PIS-002', 'in_progress', 1, 15000.0, 0, '2026-09-11T08:16:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100015', 'TT-2026100015:SKU-TEH-001', 'cancelled', 1, 9000.0, 0, '2026-09-10T20:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100054', 'TT-2026100054:SKU-MIE-002', 'in_progress', 1, 23000.0, 0, '2026-09-10T20:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100011', 'TT-2026100011:SKU-MIE-001', 'completed', 1, 22000.0, 0, '2026-09-09T19:34:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100048', 'TT-2026100048:SKU-PIS-002', 'completed', 1, 15000.0, 0, '2026-09-09T18:14:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100050', 'TT-2026100050:SKU-ROT-002', 'completed', 1, 18000.0, 0, '2026-09-09T11:56:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100047', 'TT-2026100047:SKU-AYG-001', 'completed', 2, 18000.0, 0, '2026-09-08T20:25:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100023', 'TT-2026100023:SKU-TAH-001', 'completed', 2, 12000.0, 0, '2026-09-08T15:22:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100040', 'TT-2026100040:SKU-TEH-001', 'cancelled', 3, 9000.0, 0, '2026-09-08T15:22:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100009', 'TT-2026100009:SKU-CRS-002', 'completed', 3, 16000.0, 0, '2026-09-08T12:14:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TT-2026100018', 'TT-2026100018:SKU-TEH-001', 'in_progress', 3, 9000.0, 0, '2026-09-07T11:18:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100006', 'TP-2026100006:SKU-TEH-002', 'completed', 2, 12000.0, 0, '2026-10-04T11:26:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100010', 'TP-2026100010:SKU-NSG-001', 'completed', 2, 25000.0, 0, '2026-10-03T16:23:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100035', 'TP-2026100035:SKU-MIE-002', 'completed', 2, 23000.0, 0, '2026-10-01T20:30:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100023', 'TP-2026100023:SKU-PIS-001', 'in_progress', 3, 15000.0, 0, '2026-09-30T17:48:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100012', 'TP-2026100012:SKU-AYG-003', 'completed', 3, 21000.0, 0, '2026-09-29T18:01:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100002', 'TP-2026100002:SKU-PIS-001', 'completed', 2, 15000.0, 0, '2026-09-29T09:30:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100027', 'TP-2026100027:SKU-MIE-001', 'completed', 1, 22000.0, 0, '2026-09-28T09:32:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100003', 'TP-2026100003:SKU-PIS-002', 'completed', 2, 15000.0, 0, '2026-09-26T08:03:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100030', 'TP-2026100030:SKU-TEH-001', 'completed', 3, 9000.0, 0, '2026-09-25T19:05:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100043', 'TP-2026100043:SKU-ROT-001', 'completed', 3, 18000.0, 0, '2026-09-25T16:01:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100033', 'TP-2026100033:SKU-MIE-001', 'in_progress', 1, 22000.0, 0, '2026-09-25T14:09:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100009', 'TP-2026100009:SKU-NSG-001', 'completed', 3, 25000.0, 0, '2026-09-25T12:22:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100004', 'TP-2026100004:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-09-25T10:04:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100044', 'TP-2026100044:SKU-AYG-003', 'cancelled', 3, 21000.0, 0, '2026-09-24T14:11:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100017', 'TP-2026100017:SKU-ROT-001', 'in_progress', 3, 18000.0, 0, '2026-09-23T19:14:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100037', 'TP-2026100037:SKU-ROT-001', 'completed', 1, 18000.0, 0, '2026-09-23T09:45:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100008', 'TP-2026100008:SKU-ROT-002', 'completed', 3, 18000.0, 0, '2026-09-23T08:37:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100005', 'TP-2026100005:SKU-NSG-001', 'completed', 3, 25000.0, 0, '2026-09-22T17:27:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100036', 'TP-2026100036:SKU-MIE-001', 'in_progress', 1, 22000.0, 0, '2026-09-22T16:26:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100026', 'TP-2026100026:SKU-MIE-002', 'completed', 2, 23000.0, 0, '2026-09-20T20:36:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100014', 'TP-2026100014:SKU-PIS-002', 'completed', 3, 15000.0, 0, '2026-09-20T18:27:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100025', 'TP-2026100025:SKU-AYG-002', 'in_progress', 2, 22000.0, 0, '2026-09-20T15:02:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100024', 'TP-2026100024:SKU-PIS-001', 'completed', 3, 15000.0, 0, '2026-09-20T09:30:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100034', 'TP-2026100034:SKU-ESK-001', 'completed', 2, 15000.0, 0, '2026-09-19T13:43:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100019', 'TP-2026100019:SKU-MIE-001', 'completed', 3, 22000.0, 0, '2026-09-18T08:20:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100028', 'TP-2026100028:SKU-TAH-001', 'completed', 2, 12000.0, 0, '2026-09-17T12:24:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100007', 'TP-2026100007:SKU-PIS-002', 'completed', 1, 15000.0, 0, '2026-09-17T10:43:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100013', 'TP-2026100013:SKU-AYG-003', 'completed', 1, 21000.0, 0, '2026-09-15T19:20:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100029', 'TP-2026100029:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-09-15T12:46:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100016', 'TP-2026100016:SKU-NSG-002', 'completed', 2, 32000.0, 0, '2026-09-15T11:49:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100020', 'TP-2026100020:SKU-CRS-002', 'completed', 3, 16000.0, 0, '2026-09-13T14:37:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100039', 'TP-2026100039:SKU-CRS-001', 'completed', 1, 14000.0, 0, '2026-09-13T14:05:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100042', 'TP-2026100042:SKU-AYG-002', 'completed', 1, 22000.0, 0, '2026-09-13T12:07:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100011', 'TP-2026100011:SKU-TEH-001', 'completed', 2, 9000.0, 0, '2026-09-11T12:44:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100001', 'TP-2026100001:SKU-ESK-001', 'completed', 3, 15000.0, 0, '2026-09-10T08:22:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100015', 'TP-2026100015:SKU-PIS-002', 'completed', 3, 15000.0, 0, '2026-09-09T12:43:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100022', 'TP-2026100022:SKU-MIE-002', 'completed', 1, 23000.0, 0, '2026-09-09T10:16:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100021', 'TP-2026100021:SKU-NSG-001', 'completed', 3, 25000.0, 0, '2026-09-08T16:40:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100032', 'TP-2026100032:SKU-NSG-001', 'in_progress', 3, 25000.0, 0, '2026-09-08T12:54:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100038', 'TP-2026100038:SKU-PIS-001', 'cancelled', 2, 15000.0, 0, '2026-09-08T11:52:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100045', 'TP-2026100045:SKU-CRS-001', 'completed', 2, 14000.0, 0, '2026-09-07T18:24:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100040', 'TP-2026100040:SKU-PIS-002', 'in_progress', 3, 15000.0, 0, '2026-09-07T12:58:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100018', 'TP-2026100018:SKU-AYG-003', 'completed', 2, 21000.0, 0, '2026-09-06T15:58:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100031', 'TP-2026100031:SKU-MIE-001', 'completed', 1, 22000.0, 0, '2026-09-06T13:19:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


INSERT INTO order_lines (seller_id, source_system, sales_channel, order_id, line_key, status, qty, unit_price, discount_amount, sold_at, buyer_kabupaten, buyer_province)
VALUES ('a90a0461-4c1d-57d1-8bba-d8ae57605be7', 'marketplace_export', 'shopee', 'TP-2026100041', 'TP-2026100041:SKU-NSG-002', 'cancelled', 3, 32000.0, 0, '2026-09-06T12:13:00', 'KOTA PONTIANAK', 'KALIMANTAN BARAT')
ON CONFLICT (seller_id, source_system, sales_channel, shop_id, order_id, line_key) DO NOTHING;


COMMIT;