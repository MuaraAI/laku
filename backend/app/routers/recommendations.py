"""Recommendations router — GET /v1/recommendations (+/{product_id}) (api.md MVP)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.deps.auth import Identity, get_identity
from app.deps.settings import get_settings
from app.routers.stock import _get_store
from app.services import recommendations as recs_service

router = APIRouter(prefix="/v1/recommendations", tags=["recommendations"])


@router.get("", status_code=status.HTTP_200_OK)
async def list_recommendations(
    state: str | None = Query(None),
    overlays: str | None = Query(None),
    identity: Identity = Depends(get_identity),
):
    settings = get_settings()
    store = _get_store()
    seller_id = identity.seller_id or ""
    if settings.demo_mode and not settings.supabase_url:
        # demo: pakai fixture seed narrative (tetap deterministik, tanpa DB)
        import json
        from pathlib import Path

        f = Path(__file__).parent.parent / "mock" / "fixtures" / "recommendations.json"
        data = json.loads(f.read_text(encoding="utf-8"))
        items = data["recommendations"]
        if state:
            items = [i for i in items if i["state"] == state.upper()]
        if overlays:
            wanted = set(overlays.split(","))
            items = [i for i in items if wanted & set(i.get("overlays", []))]
        return {"items": items, "counts": data["counts"], "generated_at": data["generated_at"]}

    data = recs_service.build_recommendations(store, seller_id)
    if state:
        data["items"] = [i for i in data["items"] if i["state"] == state.upper()]
    if overlays:
        wanted = set(overlays.split(","))
        data["items"] = [i for i in data["items"] if wanted & set(i.get("overlays", []))]
    return data


@router.get("/{product_id}", status_code=status.HTTP_200_OK)
async def get_recommendation(
    product_id: str,
    identity: Identity = Depends(get_identity),
):
    settings = get_settings()
    if settings.demo_mode and not settings.supabase_url:
        import json
        from pathlib import Path

        f = Path(__file__).parent.parent / "mock" / "fixtures" / "recommendations.json"
        items = json.loads(f.read_text(encoding="utf-8"))["recommendations"]
        item = next((i for i in items if i["product_id"] == product_id), None)
        if item is None:
            raise HTTPException(404, "Produk tidak ditemukan")
        return item

    store = _get_store()
    data = recs_service.build_recommendations(store, identity.seller_id or "")
    item = next((i for i in data["items"] if i["product_id"] == product_id), None)
    if item is None:
        raise HTTPException(404, "Produk tidak ditemukan")
    return item
