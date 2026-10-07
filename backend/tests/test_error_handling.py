"""Penanganan error API: respons JSON standar, kode status yang tepat, tanpa 500 dari input pengguna."""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.deps.auth import Identity, get_identity
from app.main import app
from app.routers.imports import _memory_store
from tests.test_import_pipeline import _csv, _row

SELLER = "s-err"
client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def _owner():
    for d in (_memory_store._batches, _memory_store._staging, _memory_store._lines):
        d.clear()
    app.dependency_overrides[get_identity] = lambda: Identity(
        user_id="u-err", email=None, seller_id=SELLER, role="owner")
    yield
    app.dependency_overrides.pop(get_identity, None)


def _upload(content=None, *, filename="export.csv", channel="shopee", mime="text/csv"):
    return client.post("/v1/imports", files={"file": (filename, content or _csv([_row("ORD-E1")]), mime)},
                       data={"channel": channel})


def test_unhandled_error_is_json_and_keeps_cors():
    # jaring terakhir: exception tak terduga → 500 JSON standar + header CORS (dulu teks polos tanpa CORS)
    with patch("app.routers.imports.import_pipeline.list_imports", side_effect=RuntimeError("boom")):
        r = client.get("/v1/imports", headers={"Origin": "https://laku.muaraai.com"})
    assert r.status_code == 500
    assert r.json()["error"]["code"] == "INTERNAL_ERROR"
    assert "boom" not in r.text  # pesan internal tidak bocor
    assert r.headers.get("access-control-allow-origin") == "https://laku.muaraai.com"


def test_unknown_channel_rejected_before_parsing():
    r = _upload(channel="lazada")
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "UNSUPPORTED_CHANNEL"


@pytest.mark.parametrize("mime", ["text/plain", "application/csv", "text/comma-separated-values"])
def test_real_world_csv_mime_types_accepted(mime):
    assert _upload(mime=mime).status_code == 201


def test_empty_file_is_422():
    r = client.post("/v1/imports", files={"file": ("x.csv", b"", "text/csv")}, data={"channel": "shopee"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "EMPTY_FILE"


def test_parser_crash_becomes_parse_error_not_500():
    with patch("app.services.import_pipeline._PARSERS", {"shopee": (lambda *_: (_ for _ in ()).throw(KeyError("x")), None)}):
        r = _upload()
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "PARSE_ERROR"


def test_cannot_cancel_committed_batch():
    batch = _upload().json()["import_batch_id"]
    assert client.post(f"/v1/imports/{batch}/confirm").status_code == 200
    r = client.delete(f"/v1/imports/{batch}")
    assert r.status_code == 409
    assert client.get("/v1/imports").json()["items"][0]["status"] == "committed"


@pytest.mark.parametrize("body,field", [
    ({"name": "Kopi", "sku": "KOP", "qty": 5, "cost_price": -1}, "cost_price"),
    ({"name": "Kopi", "sku": "KOP", "qty": -1}, "qty"),
    ({"name": "  ", "sku": "KOP", "qty": 1}, "name"),
    ({"name": "Kopi", "sku": "KOP", "qty": 1, "lead_time_days": 0}, "lead_time_days"),
    ({"name": "Kopi", "sku": "KOP", "qty": 1, "opening_date": "07-10-2026"}, "opening_date"),
])
def test_opening_stock_validation_names_the_field(body, field):
    r = client.post("/v1/stock/opening", json=body)
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "VALIDATION_ERROR" and err["field"] == field


def test_movement_type_validated():
    r = client.post("/v1/stock/movements", json={"product_id": "p1", "type": "steal", "qty": 1})
    assert r.status_code == 422
    assert "type" in r.json()["error"]["message"]


def test_rate_limit_retry_after_is_readable_cross_origin():
    r = client.options("/v1/imports", headers={"Origin": "https://laku.muaraai.com", "Access-Control-Request-Method": "GET"})
    assert r.status_code == 200
    g = client.get("/health", headers={"Origin": "https://laku.muaraai.com"})
    assert "retry-after" in g.headers.get("access-control-expose-headers", "").lower()
