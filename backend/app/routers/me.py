"""Me router — onboarding status, seller settings, channels (B6, FR-30)."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.deps.auth import Identity, get_identity, require_owner
from app.deps.settings import get_settings

router = APIRouter(prefix="/v1/me", tags=["me"])

FIXTURES = Path(__file__).parent.parent.parent / "mock" / "fixtures"

# Step onboarding (FR-30): channel → panduan export → upload → lead time → stok
ONBOARDING_STEPS = ["channel", "export_guide", "upload", "lead_time", "stock"]


def _demo_seller() -> dict:
    with open(FIXTURES / "recommendations.json", encoding="utf-8") as f:
        import json

        return json.load(f)["sellers"][0]


def _supabase():
    """Service client (server-side, lookup/provision sellers)."""
    s = get_settings()
    if not s.supabase_service_key:
        raise HTTPException(500, "SUPABASE_SERVICE_KEY not configured")
    from supabase import create_client  # noqa: no stubs for supabase-py

    return create_client(s.supabase_url, s.supabase_service_key)


def _get_seller_row(seller_id: str) -> dict | None:
    rows = (
        _supabase()
        .table("sellers")
        .select("*")
        .eq("id", seller_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    return rows[0] if rows else None


# ---------------------------------------------------------------------------
# GET /v1/me/onboarding-status
# ---------------------------------------------------------------------------
@router.get("/onboarding-status", status_code=status.HTTP_200_OK)
async def onboarding_status(identity: Identity = Depends(get_identity)):
    """Status langkah onboarding untuk wizard FR-30."""
    settings = get_settings()
    if settings.demo_mode or not settings.supabase_service_key:
        s = _demo_seller()
        return {
            "seller_id": identity.seller_id or s["id"],
            "name": s["name"],
            "channels": s.get("channel", "").split("+") if s.get("channel") else [],
            "lead_time_days": 5,  # default ter-flag "asumsi" di UI
            "lead_time_is_default": True,
            "stock_set": False,
            "completed_steps": ["channel", "export_guide"],
            "next_step": "upload",
            "onboarding_complete": False,
        }

    if not identity.seller_id:
        raise HTTPException(403, "No seller membership")
    row = _get_seller_row(identity.seller_id)
    if row is None:
        raise HTTPException(404, "Seller tidak ditemukan")
    channels = (
        _supabase()
        .table("channels")
        .select("id")
        .execute()
        .data
        or []
    )
    has_channel = bool(row.get("email"))  # provisional: channel dari import pertama
    return {
        "seller_id": row["id"],
        "name": row["name"],
        "channels": [c["id"] for c in channels],
        "lead_time_days": row["lead_time_days"],
        "lead_time_is_default": row["lead_time_days"] == 5,
        "stock_set": False,  # B7 integration: cek stock_items
        "completed_steps": ONBOARDING_STEPS[:3] if has_channel else [],
        "next_step": "upload" if not has_channel else "lead_time",
        "onboarding_complete": False,
    }


# ---------------------------------------------------------------------------
# POST /v1/me/settings
# ---------------------------------------------------------------------------
class SellerSettings(BaseModel):
    lead_time_days: int | None = Field(default=None, ge=0, le=60)
    cycle_days: int | None = Field(default=None, ge=0, le=90)
    review_days: int | None = Field(default=None, ge=0, le=60)
    service_level: float | None = Field(default=None, ge=0.5, le=0.999)
    shared_to_insights: bool | None = None


@router.post("/settings", status_code=status.HTTP_200_OK)
async def update_settings(
    body: SellerSettings,
    identity: Identity = Depends(get_identity),
):
    """Update seller settings → engine recompute pakai nilai baru."""
    require_owner(identity)
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(422, "Tidak ada field yang diubah")
    settings = get_settings()
    if settings.demo_mode or not settings.supabase_service_key:
        return {"ok": True, "demo": True, "applied": updates}

    updates["updated_at"] = "now()"
    (
        _supabase()
        .table("sellers")
        .update(updates)
        .eq("id", identity.seller_id)
        .execute()
    )
    # B7 integration: trigger recompute recommendations di sini.
    return {"ok": True, "applied": updates}


# ---------------------------------------------------------------------------
# POST /v1/me/channels
# ---------------------------------------------------------------------------
class ChannelsBody(BaseModel):
    channels: list[str] = Field(min_length=1)


@router.post("/channels", status_code=status.HTTP_200_OK)
async def set_channels(
    body: ChannelsBody,
    identity: Identity = Depends(get_identity),
):
    """Simpan pilihan channel onboarding (FR-30 step 1)."""
    require_owner(identity)
    valid = {"shopee", "tiktok_shop", "tokopedia", "lazada"}
    unknown = set(body.channels) - valid
    if unknown:
        raise HTTPException(422, f"Channel tidak dikenal: {sorted(unknown)}")

    settings = get_settings()
    if settings.demo_mode or not settings.supabase_service_key:
        return {"ok": True, "demo": True, "channels": body.channels}

    # channel pilihan disimpan sebagai metadata batch pertama; tabel sellers
    # tidak punya kolom channels — MVP: simpan di sellers.email marker NO-OP.
    # (B7: kolom channels jsonb ditambahkan kalau terbukti perlu.)
    return {"ok": True, "channels": body.channels}
