"""Test Y1 — auth & repository base (external behavior).

Run: pytest backend/tests/test_auth.py -v
"""
import os
import sys

import pytest
from fastapi import HTTPException

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.deps.auth import Identity, require_owner  # noqa: E402


# ---------- require_owner (pure logic, tanpa network) ----------

def test_owner_passes():
    ident = Identity(user_id="u1", email=None, seller_id="s1", role="owner")
    assert require_owner(ident) is ident


def test_operator_rejected():
    ident = Identity(user_id="u1", email=None, seller_id="s1", role="operator")
    with pytest.raises(HTTPException) as e:
        require_owner(ident)
    assert e.value.status_code == 403


# ---------- verify_token (pakai env supabase kosong → 500 config error) ----------

def test_verify_token_no_config(monkeypatch):
    from app.deps.auth import verify_token
    from app.deps.settings import get_settings

    monkeypatch.setenv("SUPABASE_URL", "")
    get_settings.cache_clear()
    with pytest.raises(HTTPException) as e:
        verify_token("whatever.token.here")
    assert e.value.status_code == 500
    get_settings.cache_clear()


# ---------- repository base: fail closed tanpa seller_id ----------

def test_repository_requires_seller_id():
    from app.repositories.base import SellerRepository

    class Dummy(SellerRepository):
        table_name = "order_lines"

    with pytest.raises(HTTPException) as e:
        Dummy(client=None, seller_id="")
    assert e.value.status_code == 500


class _FakeQuery:
    """Fake supabase query chain untuk list()."""

    def __init__(self, rows):
        self._rows = rows

    def select(self, *_):
        return self

    def eq(self, *_):
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, *_):
        return self

    def execute(self):
        class R:
            data = self._rows

        return R()


class _FakeClient:
    def __init__(self, rows):
        self._rows = rows
        self.last_table = None

    def table(self, name):
        self.last_table = name
        return _FakeQuery(self._rows)


def test_repository_scopes_every_query():
    """Semua query otomatis di-scope seller_id — bukti ADR-1."""
    from app.repositories.base import SellerRepository

    captured = {}

    class SpyQuery(_FakeQuery):
        def eq(self, col, val):
            captured[col] = val
            return self

    class SpyClient(_FakeClient):
        def table(self, name):
            self.last_table = name
            return SpyQuery([{"id": "r1", "seller_id": "s-mine"}])

    class Dummy(SellerRepository):
        table_name = "order_lines"

    repo = Dummy(client=SpyClient([]), seller_id="s-mine")
    rows = repo.list()

    assert rows == [{"id": "r1", "seller_id": "s-mine"}]
    # scoping wajib: seller_id selalu jadi filter pertama di setiap query
    assert captured.get("seller_id") == "s-mine"


def test_verify_token_supports_es256(monkeypatch):
    """Pastikan token Supabase dengan algoritma ES256 (ECC) valid dan ter-decode."""
    from app.deps.auth import verify_token, _JWKS_CACHE
    from app.deps.settings import get_settings
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives import serialization
    import jwt
    import time

    # Generate ES256 EC key pair
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    pub_numbers = public_key.public_numbers()

    import base64

    def int_to_b64(val: int) -> str:
        b = val.to_bytes((val.bit_length() + 7) // 8, byteorder="big")
        return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

    kid = "test-es256-kid"
    jwk_dict = {
        "kty": "EC",
        "crv": "P-256",
        "kid": kid,
        "x": int_to_b64(pub_numbers.x),
        "y": int_to_b64(pub_numbers.y),
        "use": "sig",
        "alg": "ES256",
    }

    token = jwt.encode(
        {"sub": "user-es256-123", "aud": "authenticated", "exp": int(time.time()) + 3600},
        private_key,
        algorithm="ES256",
        headers={"kid": kid},
    )

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "https://test.supabase.co", raising=False)
    _JWKS_CACHE["keys"] = {"keys": [jwk_dict]}
    _JWKS_CACHE["fetched_at"] = time.time()

    payload = verify_token(token)
    assert payload["sub"] == "user-es256-123"
    assert payload["aud"] == "authenticated"

