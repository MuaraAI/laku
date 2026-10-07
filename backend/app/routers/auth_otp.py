"""Email OTP login — backend generate kode 6 digit + kirim via Resend (login email).

Kenapa lewat backend (bukan andalkan template Supabase):
template email Supabase default mengirim MAGIC LINK ({{ .ConfirmationURL }}),
bukan kode 6 digit — template hanya bisa diubah manual via dashboard dan tidak
ter-versioned di repo. Jalur ini deterministic & ter-test:

  1. POST /v1/auth/otp/request
     → Supabase Admin API generate_link(type=email): bikin user kalau belum ada
       (trigger auto-provision seller dari #41 tetap jalan) + dapat token_hash.
     → Kode 6 digit kita generate (secrets), simpan HMAC-SHA256(code) + token_hash
       (TTL 10 menit, maks 5 kirim / 5 percobaan).
     → Email kode via Resend API.
  2. POST /v1/auth/otp/verify
     → Bandingkan kode (constant-time) → supabase.auth.verify_otp(token_hash)
       dengan anon key → session Supabase asli (access+refresh) → dikembalikan
       ke frontend untuk diset sebagai session (setSession).

Magic link lama tetap jalan (dua jalur beneran ke Supabase).
"""
from __future__ import annotations

import hashlib
import hmac
import re
import secrets
import time

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from app.deps.settings import get_settings

router = APIRouter(prefix="/v1/auth/otp", tags=["auth"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# --- batas keamanan ---
_CODE_TTL_SECONDS = 600        # 10 menit
_MAX_SEND = 5                  # kirim kode / 10 menit per email+IP
_MAX_VERIFY = 5                # percobaan masukkan kode per kode yang dikirim
_WINDOW_SECONDS = 600
_RESEND_TIMEOUT = 10.0

# Fallback in-memory (dev/test). Prod VPS pindah ke Redis — isi store cuma
# hash kode + token_hash Supabase (bukan PII), aman kalau hilang saat restart.
_SENDS: dict[str, list[float]] = {}   # "send:{email}:{ip}" -> [timestamps]
_CODES: dict[str, dict] = {}          # "code:{email}" -> {code_hash, token_hash, ...}


def _now() -> float:
    return time.monotonic()


def _sweep() -> None:
    """Buang entri kadaluarsa supaya store nggak tumbuh tanpa batas."""
    now = _now()
    for k in [k for k, v in _CODES.items() if v["expires_at"] < now]:
        _CODES.pop(k, None)
    for k in [k for k, ts in _SENDS.items() if not ts or now - ts[-1] > _WINDOW_SECONDS]:
        _SENDS.pop(k, None)


def _allow_send(email: str, ip: str) -> bool:
    now = _now()
    key = f"send:{email}:{ip}"
    hits = [t for t in _SENDS.get(key, []) if now - t < _WINDOW_SECONDS]
    if len(hits) >= _MAX_SEND:
        _SENDS[key] = hits
        return False
    hits.append(now)
    _SENDS[key] = hits
    return True


def _code_hash(code: str, email: str) -> str:
    # HMAC dengan email sebagai salt — hash kode di memori/DB nggak bisa
    # di-brute-force offline tanpa tahu email-nya.
    key = f"laku-otp:{email}".encode()
    return hmac.new(key, code.encode(), hashlib.sha256).hexdigest()


def _gen_code() -> str:
    # secrets, bukan random — kode = kredensial sementara
    return f"{secrets.randbelow(1_000_000):06d}"


def _ensure_email(email: str) -> str:
    """Normalisasi + validasi format email → 422 kalau invalid.

    Validasi di endpoint (bukan ValueError di validator) supaya error response
    JSON-nya konsisten {error: {code, message}} dan bebas bug serialisasi ctx.
    """
    v = (email or "").strip().lower()
    if not _EMAIL_RE.match(v):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "INVALID_EMAIL", "message": "Format email tidak valid."}},
        )
    return v


class OtpRequestIn(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def _normalize(cls, v: str) -> str:
        return v.strip().lower()


class OtpVerifyIn(BaseModel):
    email: str
    token: str = Field(min_length=6, max_length=6)

    @field_validator("email")
    @classmethod
    def _normalize(cls, v: str) -> str:
        return v.strip().lower()


def _supabase_admin():
    s = get_settings()
    if not s.supabase_service_key:
        raise HTTPException(500, "SUPABASE_SERVICE_KEY not configured")
    from supabase import create_client  # noqa: no stubs supabase-py

    return create_client(s.supabase_url, s.supabase_service_key)


def _create_link_token(email: str) -> str:
    """generate_link(type=email): auto-create user (trigger seller #41 jalan)
    + token_hash yang nanti dipakai server-side untuk mint session."""
    resp = _supabase_admin().auth.admin.generate_link({"type": "email", "email": email})
    props = getattr(resp, "properties", None) or {}
    token_hash = props.get("token_hash") or ""
    if not token_hash:
        raise HTTPException(502, "Gagal menyiapkan sesi login (Supabase).")
    return token_hash


def _send_email(to: str, code: str) -> None:
    s = get_settings()
    if not s.resend_api_key:
        raise HTTPException(500, "RESEND_API_KEY not configured")
    resp = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {s.resend_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": s.email_from,
            "to": [to],
            "subject": f"Kode login Laku: {code}",
            "html": (
                '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">'
                '<h2 style="margin-bottom:8px">Kode login kamu</h2>'
                f'<p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">{code}</p>'
                f'<p style="color:#555">Berlaku {_CODE_TTL_SECONDS // 60} menit. '
                "Jangan bagikan kode ini ke siapa pun.</p>"
                '<p style="color:#999;font-size:12px">Kalau kamu tidak meminta kode ini, abaikan email ini.</p>'
                "</div>"
            ),
        },
        timeout=_RESEND_TIMEOUT,
    )
    if resp.status_code >= 400:
        # Jangan echo body Resend (bisa berisi alamat internal) — cukup status.
        raise HTTPException(502, f"Gagal mengirim email ({resp.status_code}).")


@router.post("/request", status_code=status.HTTP_200_OK)
async def request_otp(body: OtpRequestIn, request: Request):
    """Kirim kode 6 digit. Respons selalu sama (tidak membocorkan keberadaan user)."""
    email = _ensure_email(body.email)
    _sweep()
    ip = request.client.host if request.client else "unknown"
    if not _allow_send(email, ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": {"code": "RATE_LIMITED",
                              "message": f"Terlalu banyak permintaan. Coba lagi dalam {_WINDOW_SECONDS // 60} menit."}},
        )

    token_hash = _create_link_token(email)
    code = _gen_code()
    _CODES[f"code:{email}"] = {
        "code_hash": _code_hash(code, email),
        "token_hash": token_hash,
        "expires_at": _now() + _CODE_TTL_SECONDS,
        "attempts": 0,
    }
    _send_email(email, code)
    return {"ok": True, "expires_in": _CODE_TTL_SECONDS}


@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_otp(body: OtpVerifyIn):
    """Verifikasi kode → session Supabase asli (access+refresh+expires_in)."""
    email = _ensure_email(body.email)
    _sweep()
    s = get_settings()
    if not s.supabase_url or not s.supabase_anon_key:
        raise HTTPException(500, "Supabase auth not configured")

    key = f"code:{email}"
    token = (body.token or "").strip()
    if not token.isdigit():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "INVALID_TOKEN", "message": "Kode harus 6 angka."}},
        )
    entry = _CODES.get(key)
    if entry is None or entry["expires_at"] < _now():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "OTP_EXPIRED",
                              "message": "Kode kedaluwarsa atau belum diminta. Minta kode baru."}},
        )

    entry["attempts"] += 1
    if entry["attempts"] > _MAX_VERIFY:
        _CODES.pop(key, None)  # paksa minta kode baru
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "OTP_LOCKED",
                              "message": "Terlalu banyak percobaan. Minta kode baru."}},
        )

    if not hmac.compare_digest(entry["code_hash"], _code_hash(token, email)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "OTP_INVALID", "message": "Kode salah."}},
        )

    # Kode benar → mint session Supabase via token_hash (server-side, anon key).
    from supabase import create_client

    client = create_client(s.supabase_url, s.supabase_anon_key)
    try:
        resp = client.auth.verify_otp({
            "token_hash": entry["token_hash"],
            "type": "email",
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "OTP_INVALID", "message": "Sesi kedaluwarsa. Minta kode baru."}},
        )
    finally:
        _CODES.pop(key, None)  # one-time use — habis dipakai / gagal, buang

    session = getattr(resp, "session", None)
    if session is None or not getattr(session, "access_token", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "OTP_INVALID", "message": "Sesi gagal dibuat. Coba lagi."}},
        )
    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expires_in": session.expires_in,
    }
