"""JWT auth — verify Supabase JWT via JWKS, resolve seller_id + role.

Flow: Bearer token → verify signature (JWKS, cached 10 menit) → ambil user_id
→ lookup seller_members → inject Identity ke request.state.
"""
import time
from dataclasses import dataclass

import httpx
import jwt
from fastapi import HTTPException, Request
from starlette.concurrency import run_in_threadpool

from app.deps.settings import get_settings

_JWKS_CACHE: dict = {"keys": None, "fetched_at": 0.0}
_JWKS_TTL = 600  # 10 menit


@dataclass
class Identity:
    user_id: str
    email: str | None
    seller_id: str | None
    role: str  # "owner" | "operator" | "admin" | "none"


def _fetch_jwks() -> dict:
    s = get_settings()
    now = time.time()
    if _JWKS_CACHE["keys"] is not None and now - _JWKS_CACHE["fetched_at"] < _JWKS_TTL:
        return _JWKS_CACHE["keys"]
    resp = httpx.get(s.jwks_url, timeout=10)
    resp.raise_for_status()
    _JWKS_CACHE["keys"] = resp.json()
    _JWKS_CACHE["fetched_at"] = now
    return _JWKS_CACHE["keys"]


def verify_token(token: str) -> dict:
    """Verify Supabase JWT. Raise HTTPException 401 kalau invalid."""
    settings = get_settings()
    if not settings.supabase_url:
        raise HTTPException(500, "Auth not configured (SUPABASE_URL missing)")
    try:
        header = jwt.get_unverified_header(token)
        jwks = _fetch_jwks()
        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if key is None:
            # L5: kid miss → bisa jadi Supabase baru rotate key; force refresh 1x
            _JWKS_CACHE["keys"] = None
            jwks = _fetch_jwks()
            key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if key is None:
            raise HTTPException(401, "Unknown token key")
        public_key = jwt.PyJWK.from_dict(key).key
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256", "ES256"],  # pinned — Supabase Auth JWKS supports RS256 & ES256
            audience="authenticated",
            options={"require": ["exp", "sub"]},
        )
        return payload
    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except (httpx.RequestError, httpx.HTTPStatusError):
        # JWKS/Supabase down bukan salah token — jangan bilang "invalid" (H7)
        raise HTTPException(503, "Auth upstream unavailable")
    except Exception:
        raise HTTPException(401, "Invalid token")


def _supabase_admin():
    """Service client — server-side only (bypass RLS untuk lookup membership)."""
    settings = get_settings()
    if not settings.supabase_service_key:
        raise HTTPException(500, "SUPABASE_SERVICE_KEY not configured")
    from supabase import create_client  # lazy: supabase-py

    return create_client(settings.supabase_url, settings.supabase_service_key)


async def _lookup_membership(user_id: str, email: str | None = None) -> tuple[str | None, str]:
    """Query seller_members. Auto-provision seller workspace jika user baru (defense-in-depth).

    supabase-py itu sinkron: dijalankan di threadpool supaya satu lookup lambat tidak
    membekukan event loop (PM2 1 worker → semua seller ikut menunggu).
    """
    return await run_in_threadpool(_lookup_membership_sync, user_id, email)


def _lookup_membership_sync(user_id: str, email: str | None = None) -> tuple[str | None, str]:
    settings = get_settings()
    if settings.demo_mode or not settings.supabase_service_key:
        return ("demo-seller", "owner")

    client = _supabase_admin()
    resp = (
        client.table("seller_members")
        .select("seller_id, role")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = resp.data or []
    if rows:
        return rows[0]["seller_id"], rows[0]["role"]

    # Fallback auto-provision jika trigger DB belum jalan
    store_name = f"Toko {email.split('@')[0]}" if email else "Toko Saya"
    try:
        new_seller = (
            client.table("sellers")
            .insert({
                "name": store_name,
                "email": email,
                "plan": "free",
                "timezone": "Asia/Jakarta",
                "service_level": 0.95,
                "lead_time_days": 5,
                "cycle_days": 14,
                "review_days": 7,
                "overstock_days": 60,
            })
            .execute()
            .data
        )
        if new_seller:
            sid = new_seller[0]["id"]
            client.table("seller_members").insert({
                "seller_id": sid,
                "user_id": user_id,
                "role": "owner",
            }).execute()
            return sid, "owner"
    except Exception:
        # Kalah race dengan trigger DB atau signup simultan: periksa ulang keanggotaan
        resp2 = (
            client.table("seller_members")
            .select("seller_id, role")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        rows2 = resp2.data or []
        if rows2:
            return rows2[0]["seller_id"], rows2[0]["role"]

    raise HTTPException(403, "No seller membership")


async def get_identity(request: Request) -> Identity:
    """FastAPI dependency — pasang di setiap protected endpoint."""
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    # verify_token bisa fetch JWKS (httpx sync, timeout 10 dtk) → threadpool, bukan event loop
    payload = await run_in_threadpool(verify_token, auth.removeprefix("Bearer ").strip())

    user_id = payload["sub"]
    email = payload.get("email")
    seller_id, role = await _lookup_membership(user_id, email=email)
    identity = Identity(user_id=user_id, email=email, seller_id=seller_id, role=role)
    request.state.identity = identity
    return identity


def require_owner(identity: Identity) -> Identity:
    """Guard: hanya owner (operator → 403)."""
    if identity.role != "owner":
        raise HTTPException(403, "Owner role required")
    return identity


def require_seller_member(identity: Identity) -> Identity:
    """Guard: owner atau operator dengan seller_id aktif."""
    if not identity.seller_id or identity.role not in ("owner", "operator"):
        raise HTTPException(403, "Seller membership required")
    return identity
