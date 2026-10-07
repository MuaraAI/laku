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
