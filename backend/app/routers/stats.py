"""Public platform & engine telemetry endpoint (PRD §9A, landing page widget).

Public endpoint — TANPA auth, anonymous aggregate metrics only (zero PII).
Live realtime via Supabase RPC `get_platform_stats()`.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter

from app.deps.settings import get_settings

router = APIRouter(tags=["stats"])

JAKARTA = timezone(timedelta(hours=7))

SUPPORTED_CHANNELS = [
    {"id": "shopee", "name": "Shopee", "status": "active"},
    {"id": "tiktok_shop", "name": "TikTok Shop", "status": "active"},
    {"id": "tokopedia", "name": "Tokopedia", "status": "active"},
]

# Tanpa DB / RPC gagal → nol yang jujur, bukan angka karangan (aturan #4: angka hanya dari DB)
EMPTY_URGENCY = {"critical": 0, "reorder": 0, "ok": 0, "overstock": 0, "dead": 0}


def _get_live_platform_data() -> tuple[int, int, int, dict, bool]:
    """Ambil telemetry platform live dari Supabase RPC get_platform_stats(); fallback jika offline/demo."""
    settings = get_settings()
    if not settings.supabase_url or settings.demo_mode:
        return 0, 0, 0, EMPTY_URGENCY, False

    try:
        from supabase import create_client  # noqa: no stubs for supabase-py
        import logging

        key = settings.supabase_service_key or settings.supabase_anon_key
        if not key:
            return 0, 0, 0, EMPTY_URGENCY, True

        client = create_client(settings.supabase_url, key)
        resp = client.rpc("get_platform_stats").execute()
        data = resp.data or {}
        sellers = data.get("total_sellers_active", 0)
        products = data.get("total_products_monitored", 0)
        orders = data.get("total_orders_analyzed", 0)
        urgency = data.get("urgency_distribution") or dict(EMPTY_URGENCY)
        return int(sellers), int(products), int(orders), urgency, False
    except Exception as e:
        import logging
        logging.getLogger("laku.stats").warning("get_platform_stats RPC fallback: %s", type(e).__name__)
        return 0, 0, 0, EMPTY_URGENCY, True


@router.get("/stats")
@router.get("/v1/stats")
def get_public_stats() -> dict:
    """Public stats — telemetry platform realtime & deterministic engine spec."""
    now = datetime.now(JAKARTA).isoformat()
    sellers, products, orders, urgency, degraded = _get_live_platform_data()

    return {
        "service": "laku-engine",
        "version": "0.1.0",
        # degraded = DB sedang tidak terjangkau → angka 0 di bawah bukan data asli
        "status": "degraded" if degraded else "operational",
        "generated_at": now,
        "platform_metrics": {
            "total_sellers_active": sellers,
            "total_products_monitored": products,
            "total_orders_analyzed": orders,
            "total_channels_supported": len(SUPPORTED_CHANNELS),
        },
        "supported_channels": SUPPORTED_CHANNELS,
        "engine_spec": {
            "architecture": "deterministic_core",
            "formula": "PRD §9A (Silver-Peterson EOQ/ROP)",
            "ai_hallucination_risk": "0%",
            "ai_role": "read_only_advisor",
            "pii_at_rest": False,
            "raw_files_stored": False,
        },
        "restock_health_summary": {
            "target_service_level": "95%",
            "avg_lead_time_days": 5.0,
            "urgency_distribution": urgency,
        },
    }
