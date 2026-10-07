"""Pengaturan seller & lead time per produk harus sampai ke engine (dulu selalu default 5 hari)."""
from datetime import date, timedelta

from app.services.recommendations import build_recommendations
from app.services.stock_ledger import StockMemoryStore

TODAY = date(2026, 10, 7)


class _Sales:
    """Sumber sales minimal yang dibaca StockMemoryStore.fetch_eligible_sales."""

    def __init__(self, seller_id, lines):
        self._lines = {seller_id: {i: line for i, line in enumerate(lines)}}


def _store(settings=None, product_lead=None):
    lines = [
        {"sku": "KOP", "qty": 10, "status": "completed", "unit_price": 18000, "sales_channel": "shopee",
         "sold_at": (TODAY - timedelta(days=d)).isoformat() + "T10:00:00+07:00"}
        for d in range(30)
    ] + [{"sku": "KOP", "qty": 2, "status": "completed", "unit_price": 20000, "sales_channel": "tiktok_shop",
          "sold_at": (TODAY - timedelta(days=1)).isoformat() + "T10:00:00+07:00"}]
    store = StockMemoryStore(sales_source=_Sales("s1", lines))
    if settings is not None:
        store.get_seller_settings = lambda seller_id: settings
    p = store.create_product("s1", {"name": "Kopi", "sku": "KOP"})
    store.upsert_stock_item("s1", p["id"], {"opening_qty": 400, "opening_date": (TODAY - timedelta(days=40)).isoformat(),
                                            "lead_time_days": product_lead})
    return store


def _item(store):
    return build_recommendations(store, "s1", today=TODAY)["items"][0]


def test_default_lead_time_is_flagged_assumed():
    why = _item(_store())["why"]
    assert why["lead_time_days"] == 5 and why["lead_time_assumed"] is True


def test_seller_lead_time_changes_rop():
    base = _item(_store())
    slow = _item(_store(settings={"lead_time_days": 12}))
    assert slow["why"]["lead_time_days"] == 12 and slow["why"]["lead_time_assumed"] is False
    assert slow["reorder_point"] > base["reorder_point"]


def test_product_lead_time_beats_seller_setting():
    item = _item(_store(settings={"lead_time_days": 12}, product_lead=3))
    assert item["why"]["lead_time_days"] == 3 and item["why"]["lead_time_assumed"] is False


def test_price_and_channel_come_from_order_lines():
    item = _item(_store())
    # (300×18.000 + 2×20.000) / 302 ≈ 18.013
    assert item["price"] == 18013
    assert item["channel"] == "shopee"
