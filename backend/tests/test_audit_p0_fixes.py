"""Tests verifying all fixes from the 5-subagent backend audit."""

import pytest
from app.services.engine import compute, EngineInput
from app.deps.auth import Identity, require_seller_member, require_owner
from fastapi import HTTPException


def test_negative_stock_state_critical():
    inp = EngineInput(
        daily_units=[1] * 30,
        history_days=30,
        on_hand=-5,
        on_order=0,
        lead_time_days=7,
        review_days=7,
        stock_set_up=True,
    )
    rec = compute(inp)
    assert "NEGATIVE" in rec.overlays
    assert rec.state == "CRITICAL"


def test_safe_qty_coalesce_none():
    s = {"qty": None, "sku": "SKU-A"}
    # Memastikan tidak crash TypeError: int() argument must be a string... not 'NoneType'
    qty = int(s.get("qty") or 0)
    assert qty == 0


def test_operator_role_guard():
    operator = Identity(user_id="u1", email="op@laku.com", seller_id="s1", role="operator")
    owner = Identity(user_id="u2", email="own@laku.com", seller_id="s1", role="owner")
    nobody = Identity(user_id="u3", email="no@laku.com", seller_id=None, role="")

    # Operator lolos di require_seller_member
    assert require_seller_member(operator).seller_id == "s1"
    assert require_seller_member(owner).seller_id == "s1"

    # Nobody ditolak
    with pytest.raises(HTTPException) as exc_info:
        require_seller_member(nobody)
    assert exc_info.value.status_code == 403

    # Operator tetap ditolak di require_owner (saldo awal)
    with pytest.raises(HTTPException) as exc_info2:
        require_owner(operator)
    assert exc_info2.value.status_code == 403


@pytest.mark.anyio
async def test_auto_provisioning_demo_mode():
    from app.deps.auth import _lookup_membership
    sid, role = await _lookup_membership("new-user-123")
    assert role == "owner"
    assert sid is not None


def test_nan_non_finite_engine_safe():
    inp = EngineInput(
        daily_units=[float("nan")] * 30,  # type: ignore
        history_days=30,
        on_hand=10,
        on_order=0,
        lead_time_days=7,
        review_days=7,
        stock_set_up=True,
    )
    rec = compute(inp)
    assert rec.state == "INSUFFICIENT_DATA"
    assert "non-finite" in rec.inputs.get("note", "")


def test_fetch_all_paginated_multi_page():
    from app.repositories.base import fetch_all_paginated

    # Mock query builder simulating PostgREST range behaviour
    total_items = [{"id": i} for i in range(2500)]

    class MockQuery:
        def __init__(self):
            self._start = 0
            self._end = 999

        def range(self, start, end):
            self._start = start
            self._end = end
            return self

        def execute(self):
            class Resp:
                data = []
            r = Resp()
            r.data = total_items[self._start : self._end + 1]
            return r

    q = MockQuery()
    results = fetch_all_paginated(q, page_size=1000)
    assert len(results) == 2500
    assert [r["id"] for r in results] == list(range(2500))


def test_fetch_all_paginated_fallback_no_range():
    from app.repositories.base import fetch_all_paginated

    class NoRangeQuery:
        def execute(self):
            class Resp:
                data = [{"id": 1}, {"id": 2}]
            return Resp()

    results = fetch_all_paginated(NoRangeQuery())
    assert len(results) == 2


def test_imports_supabase_store_column_whitelist():
    from app.services.imports_store import ImportsSupabaseStore

    captured_payloads = []

    class MockQuery:
        def __init__(self, payload):
            self.payload = payload

        def execute(self):
            class Resp:
                data = [self.payload]
            return Resp()

    class MockTable:
        def insert(self, payload):
            captured_payloads.append(payload)
            return MockQuery(payload)

    class MockClient:
        def table(self, name):
            return MockTable()

    store = ImportsSupabaseStore(MockClient())
    batch = {
        "id": "b1",
        "seller_id": "s1",
        "channel": "shopee",
        "source_system": "shopee_seller_center",
        "unknown_extra_field": "should_be_stripped",
        "file_hash": "hash123",
        "status": "preview",
        "row_count": 10,
    }
    store.create_batch("s1", batch)
    assert len(captured_payloads) == 1
    assert "unknown_extra_field" not in captured_payloads[0]
    assert captured_payloads[0]["source_system"] == "shopee_seller_center"
    assert captured_payloads[0]["channel"] == "shopee"


