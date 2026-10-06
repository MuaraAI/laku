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

FIXTURES = Path(__file__).parent.parent / "mock" / "fixtures"


@router.get("", status_code=status.HTTP_200_OK)
async def get_recap(
    days: int = Query(30, ge=1, le=365),
    identity: Identity = Depends(get_identity),
):
    """Get consolidated sales recap. Owner only."""
    require_owner(identity)
    settings = get_settings()

    # Fixture seed HANYA di demo mode — prod misconfig harus fail, bukan serve angka karangan
    if settings.demo_mode:
        fixture_path = FIXTURES / "recap.json"
        if fixture_path.exists():
            with open(fixture_path, encoding="utf-8") as f:
                data = json.load(f)
            data["period"]["days"] = days
            return data

    # TODO (B2 integration): Fetch order_lines for identity.seller_id within days from DB
    # Fallback to empty recap structure
    return compute_recap([], period_days=days)


@router.get("/metrics-help", status_code=status.HTTP_200_OK)
async def metrics_help():
    """Static definitions for metrics explanations (bottom-sheet UI)."""
    return get_metrics_help()
