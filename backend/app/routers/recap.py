"""Sales recap router (PRD v3.1 §9D, FR-39).

Owner-only endpoint: Operator receives 403 Forbidden.
"""

from __future__ import annotations

import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.deps.auth import Identity, get_identity, require_owner
from app.deps.settings import get_settings
from app.services.recap import ChannelCoverage, RecapLine, compute_recap, get_metrics_help

router = APIRouter(prefix="/v1/recap", tags=["recap"])

FIXTURES = Path(__file__).parent.parent.parent / "mock" / "fixtures"


@router.get("", status_code=status.HTTP_200_OK)
def get_recap(
    days: int = Query(30, ge=1, le=365),
    identity: Identity = Depends(get_identity),
):
    """Get consolidated sales recap. Owner only."""
    require_owner(identity)
    settings = get_settings()

    # Fixture seed HANYA di demo mode — prod misconfig harus fail, bukan serve angka karangan
    if settings.demo_mode and not settings.supabase_url:
        fixture_path = FIXTURES / "recap.json"
        if fixture_path.exists():
            with open(fixture_path, encoding="utf-8") as f:
                data = json.load(f)
            data["period"]["days"] = days
            return data

    if settings.supabase_url and settings.supabase_service_key and identity.seller_id:
        from datetime import datetime, timedelta, timezone
        from app.services.recap import RecapLine
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_service_key)
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        resp = (
            client.table("order_lines")
            .select("order_id, line_key, sales_channel, status, qty, unit_price, discount_amount, allocated_discount, sold_at")
            .eq("seller_id", identity.seller_id)
            .gte("sold_at", cutoff)
            .execute()
        )
        raw_rows = resp.data or []
        recap_lines = [
            RecapLine(
                order_id=r["order_id"],
                line_key=r["line_key"],
                channel=r["sales_channel"],
                status=r["status"],
                qty=int(r.get("qty") or 0),
                unit_price=float(r.get("unit_price") or 0),
                discount_amount=float(r.get("discount_amount") or 0),
                allocated_discount=float(r.get("allocated_discount") or 0),
                sold_at=r["sold_at"],
            )
            for r in raw_rows
        ]
        return compute_recap(recap_lines, period_days=days)

    return compute_recap([], period_days=days)


@router.get("/metrics-help", status_code=status.HTTP_200_OK)
def metrics_help():
    """Static definitions for metrics explanations (bottom-sheet UI)."""
    return get_metrics_help()
