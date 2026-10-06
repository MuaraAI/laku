"""Golden tests for B5 — Sales recap (PRD v3.1 §9D, FR-39).

Covers:
  - Exact §9D golden worked example:
      Order 1 (completed): 2 x 50.000, discount 5.000 -> gross 100.000
      Order 2 (returned): 1 x 30.000 -> gross 30.000
      Order 3 (cancelled): 1 x 20.000
      Totals: Gross 130.000, Returns 30.000, Discounts 5.000, Net 95.000, Orders 1, AOV 95.000, Cancelled (info) 20.000
  - paid_price_after_discount fixture yields identical gross (100.000)
  - Pro-rata order-level voucher allocation sums exactly to voucher amount
  - Channel sums strictly equal combined totals
  - Operator gets 403 Forbidden on /v1/recap
  - Stale and partial coverage warnings
  - Static metrics help endpoint
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.deps.auth import Identity, get_identity
from app.services.recap import (
    ChannelCoverage,
    RecapLine,
    allocate_order_voucher,
    compute_recap,
    get_metrics_help,
)


client = TestClient(app)


# ---------------------------------------------------------------------------
# Golden Worked Example §9D
# ---------------------------------------------------------------------------

def test_golden_worked_example_exact():
    """Verify exact §9D numbers:
    Order 1: qty 2 x 50,000, seller discount 5,000 -> gross 100,000
    Order 2: qty 1 x 30,000, returned -> gross 30,000
    Order 3: qty 1 x 20,000, cancelled -> 20,000
    """
    lines = [
        RecapLine(
            order_id="ORD-001",
            line_key="ORD-001:L1",
            channel="shopee",
            status="completed",
            qty=2,
            unit_price=50000.0,
            discount_amount=5000.0,
            sold_at="2026-09-15 10:00:00",
        ),
        RecapLine(
            order_id="ORD-002",
            line_key="ORD-002:L1",
            channel="shopee",
            status="returned",
            qty=1,
            unit_price=30000.0,
            discount_amount=0.0,
            sold_at="2026-09-16 11:00:00",
        ),
        RecapLine(
            order_id="ORD-003",
            line_key="ORD-003:L1",
            channel="shopee",
            status="cancelled",
            qty=1,
            unit_price=20000.0,
            discount_amount=0.0,
            sold_at="2026-09-17 12:00:00",
        ),
    ]

    recap = compute_recap(lines, period_days=30)
    totals = recap["totals"]

    assert totals["gross_rp"] == 130000, f"Gross expected 130000, got {totals['gross_rp']}"
    assert totals["returns_rp"] == 30000, f"Returns expected 30000, got {totals['returns_rp']}"
    assert totals["discounts_rp"] == 5000, f"Discounts expected 5000, got {totals['discounts_rp']}"
    assert totals["net_rp"] == 95000, f"Net expected 95000, got {totals['net_rp']}"
    assert totals["orders"] == 1, f"Orders expected 1, got {totals['orders']}"
    assert totals["aov_rp"] == 95000, f"AOV expected 95000, got {totals['aov_rp']}"
    assert totals["cancelled_info_rp"] == 20000, f"Cancelled expected 20000, got {totals['cancelled_info_rp']}"


def test_paid_price_after_discount_basis():
    """Verify that price_basis == 'paid_price_after_discount' reproduces the same gross:
    paid unit price 47,500 + line discount 5,000 on qty 2 -> gross 100,000.
    """
    line = RecapLine(
        order_id="ORD-001",
        line_key="ORD-001:L1",
        channel="shopee",
        status="completed",
        qty=2,
        unit_price=47500.0,  # paid price
        paid_price=47500.0,
        discount_amount=5000.0,
        price_basis="paid_price_after_discount",
    )
    assert line.line_gross == 100000.0


# ---------------------------------------------------------------------------
# Order-level voucher pro-rata allocation
# ---------------------------------------------------------------------------

def test_order_voucher_pro_rata():
    """Verify order-level voucher is allocated pro-rata to gross and sums exactly to voucher."""
    lines = [
        RecapLine(
            order_id="ORD-MULTI",
            line_key="L1",
            channel="tiktok_shop",
            status="completed",
            qty=1,
            unit_price=100000.0,  # 50% of gross
        ),
        RecapLine(
            order_id="ORD-MULTI",
            line_key="L2",
            channel="tiktok_shop",
            status="completed",
            qty=1,
            unit_price=60000.0,   # 30% of gross
        ),
        RecapLine(
            order_id="ORD-MULTI",
            line_key="L3",
            channel="tiktok_shop",
            status="completed",
            qty=1,
            unit_price=40000.0,   # 20% of gross
        ),
    ]

    voucher_amount = 15000.0
    allocated = allocate_order_voucher(lines, voucher_amount)

    assert allocated[0].allocated_discount == 7500.0  # 50% of 15k
    assert allocated[1].allocated_discount == 4500.0  # 30% of 15k
    assert allocated[2].allocated_discount == 3000.0  # 20% of 15k
    assert sum(l.allocated_discount for l in allocated) == voucher_amount


# ---------------------------------------------------------------------------
# Channel sums equal total
# ---------------------------------------------------------------------------

def test_channel_sums_equal_totals():
    """Verify per_channel numbers sum exactly to totals."""
    lines = [
        RecapLine("O1", "O1:1", "shopee", "completed", 2, 50000.0, discount_amount=4000.0, sold_at="2026-09-10"),
        RecapLine("O2", "O2:1", "tiktok_shop", "completed", 3, 30000.0, discount_amount=2000.0, sold_at="2026-09-11"),
        RecapLine("O3", "O3:1", "shopee", "returned", 1, 50000.0, sold_at="2026-09-12"),
    ]

    recap = compute_recap(lines, period_days=30)
    totals = recap["totals"]
    channels = recap["per_channel"]

    sum_gross = sum(c["gross_rp"] for c in channels)
    sum_returns = sum(c["returns_rp"] for c in channels)
    sum_discounts = sum(c["discounts_rp"] for c in channels)
    sum_net = sum(c["net_rp"] for c in channels)

    assert sum_gross == totals["gross_rp"]
    assert sum_returns == totals["returns_rp"]
    assert sum_discounts == totals["discounts_rp"]
    assert sum_net == totals["net_rp"]


# ---------------------------------------------------------------------------
# Coverage warnings (stale and partial)
# ---------------------------------------------------------------------------

def test_coverage_banner_warnings():
    """Stale channel and partial range generate clear warnings."""
    coverages = [
        ChannelCoverage("shopee", "2026-09-01", "2026-09-30", "2026-09-30", stale=False, partial=False),
        ChannelCoverage("tiktok_shop", "2026-09-01", "2026-09-20", "2026-09-20", stale=True, partial=True),
    ]

    recap = compute_recap([], coverages=coverages, period_days=30)
    warnings = recap["warnings"]

    types = {w["type"] for w in warnings}
    assert "stale" in types
    assert "partial" in types
    assert recap["sementara_last_days"] == 7


# ---------------------------------------------------------------------------
# Role-based authorization on HTTP endpoint
# ---------------------------------------------------------------------------

def test_operator_forbidden_on_recap(monkeypatch):
    """Operator role MUST receive 403 Forbidden."""
    async def fake_operator():
        return Identity(user_id="u-op", email=None, seller_id="s1", role="operator")

    app.dependency_overrides[get_identity] = fake_operator
    try:
        r = client.get("/v1/recap")
        assert r.status_code == 403
        assert "Owner role required" in r.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_owner_allowed_on_recap():
    """Owner role receives 200 OK."""
    async def fake_owner():
        return Identity(user_id="u-owner", email=None, seller_id="s1", role="owner")

    app.dependency_overrides[get_identity] = fake_owner
    try:
        r = client.get("/v1/recap")
        assert r.status_code == 200
        data = r.json()
        assert "totals" in data
        assert "gross_rp" in data["totals"]
    finally:
        app.dependency_overrides.clear()


def test_metrics_help_endpoint():
    """GET /v1/recap/metrics-help returns all metric explanations."""
    r = client.get("/v1/recap/metrics-help")
    assert r.status_code == 200
    help_dict = r.json()
    assert "gross" in help_dict
    assert "net" in help_dict
    assert "returns" in help_dict
    assert "discounts" in help_dict
    assert "cancelled_info" in help_dict
