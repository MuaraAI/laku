"""Test B2 — import pipeline + dedup/upsert + preview (external behavior).

Acceptance (plan-prd B2):
  - File sama 2× → "0 new, 0 updated"
  - Order 3-item = 3 rows
  - Status SELESAI→DIBATALKAN via re-import = "1 updated"
  - Import >20k baris = reject pesan split (sudah dicover test R1)
  - Seller scoping: batch seller lain tidak terlihat (ADR-1)
  - PII tidak pernah persist: staging purge, problems tanpa isi sel

Run: pytest backend/tests/test_import_pipeline.py -v
"""
from __future__ import annotations

import io
import csv
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.deps.auth import Identity, get_identity  # noqa: E402
from app.routers.imports import _memory_store  # noqa: E402

client = TestClient(app)

HEADER = ["Nomor Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat", "Nama Produk",
          "Nomor SKU", "Jumlah", "Harga Awal", "Harga Setelah Diskon",
          "Diskon Penjual", "Kabupaten/Kota", "Provinsi"]


def _row(order_id, status="SELESAI", waktu="29/09/2026 14:22", produk="Beras Ramos 5kg",
         sku="BERAS-5KG", qty="2", harga="50.000", diskon="48.000", voucher="2000",
         kab="Pontianak Kota", prov="Kalimantan Barat"):
    return [order_id, status, waktu, produk, sku, qty, harga, diskon, voucher, kab, prov]


def _csv(rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(HEADER)
    for r in rows:
        w.writerow(r)
    return buf.getvalue().encode("utf-8")


def _upload(content, filename="export.csv", channel="shopee"):
    return client.post(
        "/v1/imports",
        files={"file": (filename, content, "text/csv")},
        data={"channel": channel},
    )


@pytest.fixture(autouse=True)
def setup_auth_and_store():
    _memory_store._batches.clear()
    _memory_store._staging.clear()
    _memory_store._lines.clear()
    app.dependency_overrides[get_identity] = lambda: Identity(
        user_id="u-owner", email=None, seller_id="s-b2", role="owner"
    )
    yield
    _memory_store._batches.clear()
    _memory_store._staging.clear()
    _memory_store._lines.clear()
    app.dependency_overrides.pop(get_identity, None)


def _upload_and_confirm(content, filename="export.csv"):
    r = _upload(content, filename)
    assert r.status_code == 201, r.text
    batch_id = r.json()["import_batch_id"]
    c = client.post(f"/v1/imports/{batch_id}/confirm")
    assert c.status_code == 200, c.text
    return r.json(), c.json()


# ---------------------------------------------------------------------------
# Acceptance 1: file sama 2× → 0 new, 0 updated (idempoten)
# ---------------------------------------------------------------------------

class TestIdempotency:

    def test_same_file_twice_zero_new_zero_updated(self):
        """ATURAN MENGIKAT #5: import ulang = '0 new, 0 updated'."""
        content = _csv([_row("ORD-1001"), _row("ORD-1002", sku="MINYAK-2L", qty="1")])

        _first_up, first_confirm = _upload_and_confirm(content)
        assert first_confirm["new"] == 2
        assert first_confirm["updated"] == 0

        _second_up, second_confirm = _upload_and_confirm(content)
        assert second_confirm["new"] == 0
        assert second_confirm["updated"] == 0
        assert second_confirm["unchanged"] == 2

    def test_same_file_twice_preview_shows_all_unchanged(self):
        content = _csv([_row("ORD-1001")])
        _upload_and_confirm(content)
        r = _upload(content)
        assert r.status_code == 201
        body = r.json()
        assert body["new"] == 0
        assert body["updated"] == 0
        assert body["unchanged"] == 1

    def test_partial_overlap_counts(self):
        """2 baris lama (1 berubah) + 1 baris baru = 1 new, 1 updated, 1 unchanged."""
        v1 = _csv([_row("ORD-1"), _row("ORD-2"), _row("ORD-3")])
        _upload_and_confirm(v1)

        # ORD-2 qty berubah, ORD-4 baru
        v2 = _csv([_row("ORD-1"), _row("ORD-2", qty="5"), _row("ORD-4", sku="KOPI-165G")])
        r = _upload(v2)
        body = r.json()
        assert body["new"] == 1
        assert body["updated"] == 1
        assert body["unchanged"] == 1


# ---------------------------------------------------------------------------
# Acceptance 2: order multi-item = N rows
# ---------------------------------------------------------------------------

class TestMultiItemOrder:

    def test_three_item_order_three_rows(self):
        """Plan B2: 'order 3-item = 3 rows'."""
        content = _csv([
            _row("ORD-MULTI", sku="BERAS-5KG", qty="2"),
            _row("ORD-MULTI", produk="Minyak Sania 2L", sku="MINYAK-2L", qty="1"),
            _row("ORD-MULTI", produk="Gula Gulaku 1kg", sku="GULA-1KG", qty="3"),
        ])
        up, confirm = _upload_and_confirm(content)
        assert up["rows_read"] == 3
        assert confirm["new"] == 3

        # confirm ulang file sama → tetap 3 rows, 0 new
        _, confirm2 = _upload_and_confirm(content)
        assert confirm2["new"] == 0
        assert confirm2["unchanged"] == 3


# ---------------------------------------------------------------------------
# Acceptance 3: status berubah via re-import = "1 updated" (status upsert FR-27)
# ---------------------------------------------------------------------------

class TestStatusUpsert:

    def test_status_change_one_updated(self):
        """Plan B2: status SELESAI→DIBATALKAN via re-import = '1 updated'."""
        v1 = _csv([_row("ORD-ST", status="SELESAI")])
        _upload_and_confirm(v1)

        v2 = _csv([_row("ORD-ST", status="DIBATALKAN")])
        r = _upload(v2)
        assert r.json()["updated"] == 1

        _, confirm = _upload_and_confirm(v2)
        assert confirm["updated"] == 1
        assert confirm["new"] == 0

    def test_status_change_logged(self):
        """Re-import yang mengubah status tercatat di riwayat (updated=1)."""
        v1 = _csv([_row("ORD-LOG", status="SELESAI")])
        _upload_and_confirm(v1)
        v2 = _csv([_row("ORD-LOG", status="DIBATALKAN")])
        _, confirm = _upload_and_confirm(v2)
        assert confirm["updated"] == 1

        history = client.get("/v1/imports").json()["items"]
        target = next(b for b in history if b["import_batch_id"] == confirm["batch_id"])
        assert target["updated"] == 1


# ---------------------------------------------------------------------------
# Preview payload & SKU fill rate
# ---------------------------------------------------------------------------

class TestPreview:

    def test_preview_payload_shape(self):
        content = _csv([_row("ORD-P1"), _row("ORD-P2")])
        r = _upload(content)
        assert r.status_code == 201
        body = r.json()
        for key in ("rows_read", "new", "updated", "unchanged",
                    "problem_rows", "new_products", "sku_fill_rate"):
            assert key in body, f"missing {key}"
        assert body["rows_read"] == 2
        assert body["new"] == 2

    def test_preview_endpoint_matches_upload_response(self):
        content = _csv([_row("ORD-PV")])
        up = _upload(content).json()
        r = client.get(f"/v1/imports/{up['import_batch_id']}/preview")
        assert r.status_code == 200
        body = r.json()
        assert body["rows_read"] == 1
        assert body["new"] == 1
        assert body["status"] == "preview"

    def test_sku_fill_rate_full(self):
        content = _csv([_row("ORD-SKU1"), _row("ORD-SKU2", sku="MINYAK-2L")])
        body = _upload(content).json()
        assert body["sku_fill_rate"] == 1.0

    def test_sku_fill_rate_partial(self):
        content = _csv([_row("ORD-SKU3", sku=""), _row("ORD-SKU4", sku="MINYAK-2L")])
        body = _upload(content).json()
        assert body["sku_fill_rate"] == 0.5

    def test_data_from_through(self):
        content = _csv([
            _row("ORD-D1", waktu="27/09/2026 10:00"),
            _row("ORD-D2", waktu="29/09/2026 12:00"),
        ])
        body = _upload(content).json()
        assert body["data_from"] == "2026-09-27T10:00:00"
        assert body["data_through"] == "2026-09-29T12:00:00"

    def test_new_products_listed(self):
        content = _csv([_row("ORD-NP", sku="PROD-BARU-99")])
        body = _upload(content).json()
        assert "PROD-BARU-99" in body["new_products"]


# ---------------------------------------------------------------------------
# Problem rows
# ---------------------------------------------------------------------------

class TestProblems:

    def test_problem_rows_excluded_from_data(self):
        """Baris invalid → problem, bukan data. Baris valid tetap masuk."""
        content = _csv([
            _row("ORD-OK"),
            _row("1.234E+15", sku="SABUN-COLEK", qty="5"),  # ID ilmiah → problem
        ])
        body = _upload(content).json()
        assert body["rows_read"] == 2
        assert body["problem_rows"] == 1
        assert body["new"] == 1  # cuma baris valid

    def test_problems_endpoint_lists_reasons_without_cell_content(self):
        """api.md: problem rows = {row, column, reason} — tanpa isi sel (PII rule)."""
        content = _csv([
            _row("ORD-OK2"),
            _row("1.234E+15", sku="SABUN-XX", qty="3"),
        ])
        batch_id = _upload(content).json()["import_batch_id"]
        r = client.get(f"/v1/imports/{batch_id}/problems")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 1
        problem = body["problems"][0]
        assert set(problem.keys()) == {"row", "column", "reason"}

    def test_problems_survive_after_commit(self):
        """Staging di-purge setelah commit, tapi problems tetap bisa diakses."""
        content = _csv([
            _row("ORD-OK3"),
            _row("1.234E+15", sku="SABUN-YY", qty="2"),
        ])
        batch_id = _upload(content).json()["import_batch_id"]
        client.post(f"/v1/imports/{batch_id}/confirm")
        r = client.get(f"/v1/imports/{batch_id}/problems")
        assert r.status_code == 200
        assert r.json()["total"] == 1


# ---------------------------------------------------------------------------
# Batch lifecycle
# ---------------------------------------------------------------------------

class TestLifecycle:

    def test_confirm_twice_conflict(self):
        content = _csv([_row("ORD-C1")])
        batch_id = _upload(content).json()["import_batch_id"]
        client.post(f"/v1/imports/{batch_id}/confirm")
        r = client.post(f"/v1/imports/{batch_id}/confirm")
        assert r.status_code == 409
        assert r.json()["detail"]["error"]["code"] == "ALREADY_COMMITTED"

    def test_history_lists_batches(self):
        _upload_and_confirm(_csv([_row("ORD-H1")]))
        _upload_and_confirm(_csv([_row("ORD-H2")]))
        items = client.get("/v1/imports").json()["items"]
        assert len(items) == 2
        assert {b["status"] for b in items} == {"committed"}

    def test_cancel_purges_staging(self):
        content = _csv([_row("ORD-X1")])
        batch_id = _upload(content).json()["import_batch_id"]
        r = client.delete(f"/v1/imports/{batch_id}")
        assert r.status_code == 204
        # batch nggak bisa di-confirm setelah cancel
        c = client.post(f"/v1/imports/{batch_id}/confirm")
        assert c.status_code == 422

    def test_unknown_batch_404(self):
        assert client.get("/v1/imports/nonexistent/preview").status_code == 404
        assert client.post("/v1/imports/nonexistent/confirm").status_code == 404
        assert client.get("/v1/imports/nonexistent/problems").status_code == 404


# ---------------------------------------------------------------------------
# Seller scoping (ADR-1) — perilaku setara RLS di store in-memory
# ---------------------------------------------------------------------------

class TestSellerScoping:

    def test_other_seller_cannot_see_batch(self):
        content = _csv([_row("ORD-SC1")])
        batch_id = _upload(content).json()["import_batch_id"]

        original = app.dependency_overrides[get_identity]
        app.dependency_overrides[get_identity] = lambda: Identity(
            user_id="u-other", email=None, seller_id="s-lain", role="owner"
        )
        try:
            assert client.get(f"/v1/imports/{batch_id}/preview").status_code == 404
            assert client.post(f"/v1/imports/{batch_id}/confirm").status_code == 404
            assert client.get(f"/v1/imports/{batch_id}/problems").status_code == 404
            # riwayat cuma berisi batch sendiri
            assert client.get("/v1/imports").json()["items"] == []
        finally:
            app.dependency_overrides[get_identity] = original

    def test_same_file_different_seller_not_unchanged(self):
        """Dedup key includes seller_id: file identik antar seller = NEW di seller lain."""
        content = _csv([_row("ORD-SC2")])
        _upload_and_confirm(content)

        original = app.dependency_overrides[get_identity]
        app.dependency_overrides[get_identity] = lambda: Identity(
            user_id="u-other", email=None, seller_id="s-lain", role="owner"
        )
        try:
            r = _upload(content)
            assert r.json()["new"] == 1  # seller lain → tetap new, bukan unchanged
        finally:
            app.dependency_overrides[get_identity] = original


# ---------------------------------------------------------------------------
# PII & aturan mengikat
# ---------------------------------------------------------------------------

class TestPII:

    def test_output_rows_have_no_pii_fields(self):
        """FR-29: rows canonical tidak punya field nama/telepon/alamat."""
        from app.services.import_pipeline import _parse_file

        content = _csv([_row("ORD-PII")])
        result = _parse_file(content, ".csv", "shopee")
        assert len(result.rows) == 1
        banned = {"buyer_name", "phone", "address", "nama_penerima", "telepon"}
        assert banned.isdisjoint({k.lower() for k in result.rows[0]})

    def test_staging_purged_after_confirm(self):
        """ADR-2: staging purge setelah commit — tidak ada salinan rows yang tersisa."""
        content = _csv([_row("ORD-PII2")])
        batch_id = _upload(content).json()["import_batch_id"]
        client.post(f"/v1/imports/{batch_id}/confirm")
        rows, problems = _memory_store.get_staging("s-b2", batch_id)
        assert rows == [] and problems == []


# ---------------------------------------------------------------------------
# Channel guard
# ---------------------------------------------------------------------------

class TestChannelGuard:

    def test_unsupported_channel_rejected(self):
        content = _csv([_row("ORD-CH")])
        r = _upload(content, channel="lazada")  # belum ada parser-nya
        assert r.status_code == 422
        assert r.json()["detail"]["error"]["code"] == "UNSUPPORTED_CHANNEL"

    def test_missing_required_columns_rejected(self):
        buf = io.StringIO()
        buf.write("Kolom Acak,Kolom B\n")
        r = _upload(buf.getvalue().encode("utf-8"))
        assert r.status_code == 422
        assert r.json()["detail"]["error"]["code"] == "MISSING_COLUMNS"
