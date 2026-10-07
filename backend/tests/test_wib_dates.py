"""Tanggal bisnis = WIB: order 00:00–06:59 WIB tidak boleh pindah ke hari sebelumnya."""
from datetime import date

from app.services.recap import RecapLine, compute_recap
from app.services.stock_ledger import StockMemoryStore, compute_stock
from app.services.wib import to_wib_date


def test_utc_string_from_db_maps_to_wib_date():
    # 2026-10-06T20:00:00+00:00 = 7 Okt 03:00 WIB
    assert to_wib_date("2026-10-06T20:00:00+00:00") == date(2026, 10, 7)
    assert to_wib_date("2026-10-06T16:59:59Z") == date(2026, 10, 6)
    assert to_wib_date("2026-10-07") == date(2026, 10, 7)
    assert to_wib_date(None) is None and to_wib_date("bukan tanggal") is None


def test_recap_trend_buckets_by_wib_day():
    lines = [RecapLine(order_id="A", line_key="A:1", channel="shopee", status="completed",
                       qty=1, unit_price=10000, sold_at="2026-10-06T20:00:00+00:00")]
    trend = compute_recap(lines, period_days=7)["trend"]
    assert [(t["date"], t["net_rp"]) for t in trend] == [("2026-10-07", 10000)]


def test_early_morning_sale_on_opening_day_reduces_stock():
    store = StockMemoryStore()
    p = store.create_product("s1", {"name": "Kopi", "sku": "KOP"})
    store.upsert_stock_item("s1", p["id"], {"opening_qty": 10, "opening_date": "2026-10-07"})
    # 05:00 WIB tanggal 7 (= 6 Okt 22:00 UTC) — dulu dianggap sebelum opening_date, stok tidak berkurang
    sales = [{"sku": "KOP", "qty": 3, "sold_at": "2026-10-06T22:00:00+00:00"}]
    assert compute_stock(store, "s1", p, sales=sales)["on_hand"] == 7
