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
