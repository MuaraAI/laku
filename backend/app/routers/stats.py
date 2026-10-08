"""Public platform & engine telemetry endpoint (PRD §9A, landing page widget).

Public endpoint — TANPA auth, anonymous aggregate metrics only (zero PII).
Live realtime via Supabase RPC `get_platform_stats()`.

Audit prod 8 Okt: RPC ini sumber 502 intermittent di Caddy (origin lambat
saat Supabase drop) dan widget landing memanggilnya di SETIAP pageview.
Cache in-process TTL 60s: 1 RPC per menit per instance cukup untuk widget,
dan saat RPC gagal fallback ke angka cache terakhir (angka DB yang sah,
bukan karangan — aturan #4), bukan nol.
"""
from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter

from app.deps.settings import get_settings

router = APIRouter(tags=["stats"])

JAKARTA = timezone(timedelta(hours=7))

STATS_CACHE_TTL = 60.0  # detik
_stats_cache: dict | None = None
_stats_cache_at: float = 0.0

SUPPORTED_CHANNELS = [
    {"id": "shopee", "name": "Shopee", "status": "active"},
    {"id": "tiktok_shop", "name": "TikTok Shop", "status": "active"},
    {"id": "tokopedia", "name": "Tokopedia", "status": "active"},
]

# Tanpa DB / RPC gagal → nol yang jujur, bukan angka karangan (aturan #4: angka hanya dari DB)
EMPTY_URGENCY = {"critical": 0, "reorder": 0, "ok": 0, "overstock": 0, "dead": 0}


def _create_stats_client(create_client, settings):
    """Instansiasi Supabase client utk stats (terpisah agar mudah di-mock di test)."""
    key = settings.supabase_service_key or settings.supabase_anon_key
    if not key:
        raise ValueError("no supabase key configured")
    return create_client(settings.supabase_url, key)


def _get_live_platform_data() -> tuple[int, int, int, dict, bool]:
    """Ambil telemetry platform live dari Supabase RPC get_platform_stats(); fallback jika offline/demo.

    Audit prod 8 Okt: hasil sukses di-cache STATS_CACHE_TTL detik (RPC murah
    dibaca sering, tapi koneksi Supabase sesekali drop → 502 di Caddy).
    Saat RPC gagal DAN cache masih ada → pakai angka cache (stale tapi sah);
    tanpa cache sama sekali → nol + degraded seperti semula.
    """
    global _stats_cache, _stats_cache_at
    settings = get_settings()
    if not settings.supabase_url or settings.demo_mode:
        return 0, 0, 0, EMPTY_URGENCY, False

    now = time.monotonic()
    if _stats_cache is not None and now - _stats_cache_at < STATS_CACHE_TTL:
        c = _stats_cache
        return c["sellers"], c["products"], c["orders"], c["urgency"], False

    try:
        from supabase import create_client  # noqa: no stubs for supabase-py

        client = _create_stats_client(create_client, settings)
        resp = client.rpc("get_platform_stats").execute()
        data = resp.data or {}
        sellers = data.get("total_sellers_active", 0)
        products = data.get("total_products_monitored", 0)
        orders = data.get("total_orders_analyzed", 0)
        urgency = data.get("urgency_distribution") or dict(EMPTY_URGENCY)
        _stats_cache = {
            "sellers": int(sellers),
            "products": int(products),
            "orders": int(orders),
            "urgency": urgency,
        }
        _stats_cache_at = now
        return _stats_cache["sellers"], _stats_cache["products"], _stats_cache["orders"], urgency, False
    except Exception as e:
        import logging
        logging.getLogger("laku.stats").warning("get_platform_stats RPC fallback: %s", type(e).__name__)
        if _stats_cache is not None:
            c = _stats_cache
            # stale tapi angka DB yang sah — lebih jujur utk widget daripada 0
            return c["sellers"], c["products"], c["orders"], c["urgency"], False
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
