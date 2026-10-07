"""Recommendations router — GET /v1/recommendations (+/{product_id}) (api.md MVP)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.deps.auth import Identity, get_identity, require_seller_member
from app.routers.stock import _get_store
from app.services import recommendations as recs_service

router = APIRouter(prefix="/v1/recommendations", tags=["recommendations"])


@router.get("", status_code=status.HTTP_200_OK)
def list_recommendations(
    state: str | None = Query(None),
    overlays: str | None = Query(None),
    identity: Identity = Depends(get_identity),
):
    require_seller_member(identity)
    store = _get_store()
    data = recs_service.build_recommendations(store, identity.seller_id or "")
    if state:
        data["items"] = [i for i in data["items"] if i["state"] == state.upper()]
    if overlays:
        wanted = set(overlays.split(","))
        data["items"] = [i for i in data["items"] if wanted & set(i.get("overlays", []))]
    return data


@router.get("/{product_id}", status_code=status.HTTP_200_OK)
def get_recommendation(
    product_id: str,
    identity: Identity = Depends(get_identity),
):
    require_seller_member(identity)
    store = _get_store()
    data = recs_service.build_recommendations(store, identity.seller_id or "")
    item = next((i for i in data["items"] if i["product_id"] == product_id), None)
    if item is None:
        raise HTTPException(404, "Produk tidak ditemukan")
    return item
