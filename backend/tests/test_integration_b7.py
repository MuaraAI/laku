"""Test B7 — integration end-to-end: upload → preview → confirm → stock → recommendations.

Alur nyata (satu TestClient, satu seller): fixture Shopee CSV di-upload,
di-preview, di-commit, stok di-set via opening, lalu engine menurunkan
rekomendasi dari data yang sama. Plus: dedup 0/0 saat re-upload, recap
endpoint, dan PII scan terhadap semua state in-memory store.

Run: pytest backend/tests/test_integration_b7.py -v
"""
from __future__ import annotations

import io
import json
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.deps.auth import Identity, get_identity  # noqa: E402

client = TestClient(app)
FIXTURE = Path(__file__).parent / "fixtures" / "shopee_sample.csv"


def _owner() -> Identity:
    return Identity(user_id="u1", email="y@x.id", seller_id="s-int", role="owner")


@pytest.fixture(autouse=True)
def _demo_env(monkeypatch):
    from app.deps.settings import get_settings

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "", raising=False)
    monkeypatch.setattr(s, "supabase_anon_key", "", raising=False)
    monkeypatch.setattr(s, "demo_mode", False, raising=False)
    # memory store fresh per test
    import app.routers.imports as imp
    imp._memory_store = imp.ImportsMemoryStore()
    import app.routers.stock as stk
    stk._memory_store = None
    app.dependency_overrides[get_identity] = lambda: _owner()
    yield
    app.dependency_overrides.clear()


def _upload_and_confirm() -> dict:
    with open(FIXTURE, "rb") as f:
        content = f.read()
    r = client.post(
        "/v1/imports",
        files={"file": ("shopee.csv", io.BytesIO(content), "text/csv")},
        data={"channel": "shopee"},
    )
    assert r.status_code == 201, r.text
    batch = r.json()
    assert batch["status"] == "preview"
    rc = client.post(f"/v1/imports/{batch['import_batch_id']}/confirm")
    assert rc.status_code == 200, rc.text
    return {"batch": batch, "confirm": rc.json()}


def test_full_flow_upload_confirm_stock_recommendations():
    res = _upload_and_confirm()
    assert res["confirm"]["new"] > 0

    # re-upload file sama → 0 new, 0 updated (aturan mengikat #5)
    res2 = _upload_and_confirm()
    assert res2["confirm"]["new"] == 0
    assert res2["confirm"]["updated"] == 0

    # set stok awal via endpoint opening (JSON single) pakai SKU dari import
    sku = (res["batch"].get("new_products") or ["SKU-UJI"])[0]
    ro = client.post("/v1/stock/opening", json={"name": "Produk Uji", "sku": sku, "qty": 100})
    assert ro.status_code in (200, 201), ro.text
    products = client.get("/v1/stock").json()
    assert isinstance(products["items"], list)

    # recommendations dari engine
    rr = client.get("/v1/recommendations")
    assert rr.status_code == 200
    body = rr.json()
    assert "items" in body and isinstance(body["items"], list)
    for item in body["items"]:
        assert item["state"] in {"CRITICAL", "REORDER", "OK", "OVERSTOCK", "DEAD", "INSUFFICIENT_DATA"}


def test_recap_endpoint_alive():
    r = client.get("/v1/recap?days=30")
    assert r.status_code == 200
    body = r.json()
    # recap deterministik: meski tanpa DB, struktur harus lengkap
    assert "totals" in body or "net" in json.dumps(body)


def test_pii_never_persisted_in_store():
    _upload_and_confirm()
    import app.routers.imports as imp

    blob = repr(imp._memory_store.__dict__)
    # field PII tidak pernah ada di schema row
    for field in ["buyer_name", "buyer_phone", "buyer_address", "recipient"]:
        assert field not in blob
    # fixture beneran harus bebas PII juga
    fixture_text = FIXTURE.read_text(encoding="utf-8").lower()
    assert "pembeli" not in fixture_text or "nama pembeli" not in fixture_text
