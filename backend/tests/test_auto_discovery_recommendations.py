"""Test auto-discovery of products from sales & Silver-Peterson math in recommendations."""
import pytest
from datetime import datetime, timedelta, timezone

from app.services.stock_ledger import StockMemoryStore, set_opening
from app.services.recommendations import build_recommendations


class DummySalesSource:
    def __init__(self, lines):
        self._lines = lines


def test_auto_discovery_of_sales_products():
    seller_id = "test-seller-discovery"
    t_now = datetime.now(timezone.utc)
    t_past = t_now - timedelta(days=25)
    sales_data = {
        seller_id: {
            "line1_past": {
                "sku": "SRM-NIA10",
                "qty": 15,
                "status": "completed",
                "sold_at": t_past.isoformat(),
                "unit_price": 79000,
                "sales_channel": "shopee",
            },
            "line1_now": {
                "sku": "SRM-NIA10",
                "qty": 15,
                "status": "completed",
                "sold_at": t_now.isoformat(),
                "unit_price": 79000,
                "sales_channel": "shopee",
            },
            "line2_past": {
                "sku": "SUN-SPF50",
                "qty": 20,
                "status": "completed",
                "sold_at": t_past.isoformat(),
                "unit_price": 95000,
                "sales_channel": "tiktok_shop",
            },
            "line2_now": {
                "sku": "SUN-SPF50",
                "qty": 20,
                "status": "completed",
                "sold_at": t_now.isoformat(),
                "unit_price": 95000,
                "sales_channel": "tiktok_shop",
            },
        }
    }
    sales_source = DummySalesSource(sales_data)
    store = StockMemoryStore(sales_source=sales_source)

    # 1. list_products should discover SRM-NIA10 and SUN-SPF50
    prods = store.list_products(seller_id)
    assert len(prods) == 2
    skus = {p["sku"] for p in prods}
    assert skus == {"SRM-NIA10", "SUN-SPF50"}

    # Names should be friendly merchant names from catalog
    srm = next(p for p in prods if p["sku"] == "SRM-NIA10")
    assert srm["name"] == "Serum Niacinamide 10%"
    sun = next(p for p in prods if p["sku"] == "SUN-SPF50")
    assert sun["name"] == "Sunscreen SPF 50"

    # 2. build_recommendations should run Silver-Peterson math on both
    recs = build_recommendations(store, seller_id)
    assert len(recs["items"]) == 2

    rec_srm = next(r for r in recs["items"] if r["sku"] == "SRM-NIA10")
    assert rec_srm["state"] == "CRITICAL"
    assert rec_srm["channel"] == "shopee"
    assert rec_srm["price"] == 79000
    assert rec_srm["reorder_point"] is not None and rec_srm["reorder_point"] > 0
    assert rec_srm["safety_stock"] is not None and rec_srm["safety_stock"] > 0
    assert rec_srm["suggested_qty"] is not None and rec_srm["suggested_qty"] > 0
    assert rec_srm["why"].get("stock_assumed") is True

    # 3. Now set opening stock for SRM-NIA10 to 100 units (safe)
    set_opening(store, seller_id, name="Serum Niacinamide 10%", sku="SRM-NIA10", qty=100)
    recs2 = build_recommendations(store, seller_id)
    rec_srm_updated = next(r for r in recs2["items"] if r["sku"] == "SRM-NIA10")
    # Now it's not CRITICAL anymore, because on_hand (100) > ROP
    assert rec_srm_updated["state"] in ("OK", "OVERSTOCK")
    assert rec_srm_updated["suggested_qty"] == 0
    assert rec_srm_updated["why"].get("stock_assumed") is None or rec_srm_updated["why"].get("stock_assumed") is False
