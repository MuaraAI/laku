BEGIN;
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