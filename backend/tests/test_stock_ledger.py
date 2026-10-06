"""Test B4 — stock ledger (external behavior, plan Ronde 2).

Acceptance (backend-task-plan B4):
  - Receipt menambah on_hand
  - Sales setelah opening_date mengurangi; sales sebelum opening_date tidak
  - Retur/cancel via re-import me-restore stok (FR-11)
  - on_hand negatif muncul sebagai mismatch, tidak pernah di-clamp (FR-43)
  - Stock template CSV/XLSX (FR-26/A10): produk yang belum pernah laku ikut terbentuk
  - Seller scoping (ADR-1)

Run: pytest backend/tests/test_stock_ledger.py -v
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
from app.services.stock_ledger import (  # noqa: E402
    StockMemoryStore,
    compute_stock,
    set_opening,
    record_movement,
    import_template,
)

SELLER = "s-b4"

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_override():
    app.dependency_overrides[get_identity] = lambda: Identity(
        user_id="u-b4", email=None, seller_id=SELLER, role="owner"
    )
    yield
    app.dependency_overrides.pop(get_identity, None)


@pytest.fixture
def store():
    return StockMemoryStore(sales_source=None)


def _mkitem(store, sku="BERAS-5KG", qty=100, opening="2026-09-01"):
    r = set_opening(store, SELLER, name="Beras Ramos 5kg", sku=sku, qty=qty,
                    opening_date=opening)
    # bentuk product dict yang dikonsumsi compute_stock
    return {"id": r["product_id"], "name": r["name"], "sku": r["sku"]}


# ---------------------------------------------------------------------------
# Acceptance: receipt menambah, writeoff/adjustment mengubah
# ---------------------------------------------------------------------------

class TestMovements:

    def test_receipt_adds_stock(self, store):
        """Plan B4: 'receipt menambah'."""
        p = _mkitem(store, qty=100)
        stock = record_movement(store, SELLER, p["id"], "receipt", 50)
        assert stock["on_hand"] == 150
        assert stock["receipts"] == 50

    def test_writeoff_reduces_stock(self, store):
        p = _mkitem(store, qty=100)
        stock = record_movement(store, SELLER, p["id"], "writeoff", 10)
        assert stock["on_hand"] == 90
        assert stock["adjustments"] == -10

    def test_adjustment_signed(self, store):
        p = _mkitem(store, qty=100)
        record_movement(store, SELLER, p["id"], "adjustment", -5)
        stock = record_movement(store, SELLER, p["id"], "adjustment", 3)
        assert stock["on_hand"] == 98
        assert stock["adjustments"] == -2

    def test_movement_invalid_type(self, store):
        p = _mkitem(store)
        with pytest.raises(Exception) as e:
            record_movement(store, SELLER, p["id"], "purchase", 5)
        assert e.value.code == "INVALID_TYPE"

    def test_movement_unknown_product(self, store):
        with pytest.raises(Exception) as e:
            record_movement(store, SELLER, "nope", "receipt", 5)
        assert e.value.code == "PRODUCT_NOT_FOUND"


# ---------------------------------------------------------------------------
# Acceptance: eligible sales decrement (butuh imports store sebagai sumber)
# ---------------------------------------------------------------------------

def _line(sku, qty, sold_at, status="completed"):
    return {
        "source_system": "shopee_seller_center", "sales_channel": "shopee",
        "shop_id": None, "order_id": f"ORD-{sku}-{sold_at}-{qty}",
        "line_key": f"ORD-{sku}:{sku}", "sku": sku, "status": status,
        "qty": qty, "list_price": 50000.0, "paid_price": 48000.0,
        "seller_discount": 2000.0, "sold_at": sold_at,
    }


class TestSalesDecrement:

    def _store_with_sales(self):
        imports = StockMemoryStore.__new__(StockMemoryStore)
        imports._batches, imports._staging, imports._lines = {}, {}, {}
        imports._lines[SELLER] = {
            ("k1",): _line("BERAS-5KG", 7, "2026-09-10T14:00:00"),
            ("k2",): _line("BERAS-5KG", 3, "2026-08-20T10:00:00"),   # sebelum opening
            ("k3",): _line("BERAS-5KG", 5, "2026-09-12T09:00:00", status="cancelled"),
            ("k4",): _line("MINYAK-2L", 4, "2026-09-15T11:00:00"),   # produk lain
        }
        store = StockMemoryStore(sales_source=imports)
        return store

    def test_sales_after_opening_date_reduce(self, store):
        """Plan B4: 'sales setelah opening_date mengurangi'."""
        store = self._store_with_sales()
        p = _mkitem(store, qty=100, opening="2026-09-01")
        stock = compute_stock(store, SELLER, p)
        # 7 terjual (10 Sep) dihitung; 3 (20 Agu, sebelum opening) dan
        # 5 cancelled tidak; MINYAK produk lain.
        assert stock["eligible_sales"] == 7
        assert stock["on_hand"] == 93

    def test_sales_before_opening_date_do_not_reduce(self, store):
        store = self._store_with_sales()
        p = _mkitem(store, qty=100, opening="2026-10-01")
        stock = compute_stock(store, SELLER, p)
        assert stock["eligible_sales"] == 0
        assert stock["on_hand"] == 100

    def test_returned_via_reimport_restores_stock(self, store):
        """FR-11: sale yang jadi 'returned' via re-import me-restore stok."""
        store = self._store_with_sales()
        p = _mkitem(store, qty=100, opening="2026-09-01")
        assert compute_stock(store, SELLER, p)["on_hand"] == 93

        # seller upload export baru: baris ORD itu statusnya jadi returned
        key = ("k1",)
        store.sales_source._lines[SELLER][key]["status"] = "returned"
        stock = compute_stock(store, SELLER, p)
        assert stock["eligible_sales"] == 0
        assert stock["on_hand"] == 100  # stok balik (goods return to shelf)

    def test_in_progress_still_counts(self, store):
        """in_progress masuk eligible (A9: completed|in_progress decrement)."""
        store = self._store_with_sales()
        store.sales_source._lines[SELLER][("k1",)]["status"] = "in_progress"
        p = _mkitem(store, qty=100, opening="2026-09-01")
        assert compute_stock(store, SELLER, p)["eligible_sales"] == 7


# ---------------------------------------------------------------------------
# Acceptance: negatif → mismatch, jangan clamp (FR-43)
# ---------------------------------------------------------------------------

class TestNegativeMismatch:

    def test_negative_on_hand_flagged_not_clamped(self, store):
        """Plan B4: 'negatif muncul sebagai mismatch' — nilai tetap negatif."""
        imports = StockMemoryStore.__new__(StockMemoryStore)
        imports._batches, imports._staging, imports._lines = {}, {}, {}
        imports._lines[SELLER] = {("k1",): _line("BERAS-5KG", 150, "2026-09-10T14:00:00")}
        store = StockMemoryStore(sales_source=imports)

        p = _mkitem(store, qty=100, opening="2026-09-01")
        stock = compute_stock(store, SELLER, p)
        assert stock["on_hand"] == -50       # tampil apa adanya
        assert stock["mismatch"] is True     # flag nyala

    def test_no_mismatch_when_positive(self, store):
        p = _mkitem(store, qty=100)
        stock = record_movement(store, SELLER, p["id"], "receipt", 1)
        assert stock["mismatch"] is False


# ---------------------------------------------------------------------------
# Opening single + template import (FR-26/A10)
# ---------------------------------------------------------------------------

class TestOpening:

    def test_set_opening_creates_product(self, store):
        result = set_opening(store, SELLER, name="Gula Gulaku 1kg", sku="GULA-1KG", qty=40)
        assert result["created"] is True
        assert result["on_hand"] == 40
        assert result["opening_date"] is not None

    def test_set_opening_updates_existing(self, store):
        set_opening(store, SELLER, name="Gula Gulaku 1kg", sku="GULA-1KG", qty=40)
        result = set_opening(store, SELLER, name="Gula Gulaku 1kg", sku="GULA-1KG", qty=25)
        assert result["created"] is False
        assert result["on_hand"] == 25

    def test_opening_negative_rejected(self, store):
        with pytest.raises(Exception) as e:
            set_opening(store, SELLER, name="X", sku="X-1", qty=-5)
        assert e.value.code == "INVALID_QTY"

    def test_product_without_stock_item_not_set_up(self, store):
        p = store.create_product(SELLER, {"name": "Baru Masuk", "sku": "BARU-1"})
        stock = compute_stock(store, SELLER, p)
        assert stock["stock_set_up"] is False
        assert stock["on_hand"] is None


TEMPLATE_HEADER = ["Nama Produk", "SKU", "Qty", "Harga Modal", "Lead Time"]


def _template_csv(rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(TEMPLATE_HEADER)
    for r in rows:
        w.writerow(r)
    return buf.getvalue().encode("utf-8")


class TestTemplateImport:

    def test_template_creates_never_sold_products(self, store):
        """FR-26/A10: produk yang gak pernah laku pun ikut kebentuk."""
        raw = _template_csv([
            ["Beras Ramos 5kg", "BERAS-5KG", "100", "13000", "5"],
            ["Galon Isi Ulang", "GALON-ISI", "30", "", "2"],       # never sold, no cost
            ["Kopi Kapal Api", "KOPI-KAPAL", "12", "9500", ""],    # no lead time
        ])
        result = import_template(store, SELLER, raw, ".csv")
        assert result["created"] == 3
        assert result["updated"] == 0

        items = {i["sku"]: i for i in store.list_products(SELLER)}
        assert "GALON-ISI" in items  # A10: never-sold product exists

        stocks = {s["sku"]: s for s in [
            compute_stock(store, SELLER, p) for p in store.list_products(SELLER)
        ]}
        assert stocks["GALON-ISI"]["on_hand"] == 30
        assert stocks["GALON-ISI"]["stock_set_up"] is True

    def test_template_rerun_updates_not_duplicates(self, store):
        raw = _template_csv([["Beras Ramos 5kg", "BERAS-5KG", "100", "13000", "5"]])
        import_template(store, SELLER, raw, ".csv")
        raw2 = _template_csv([["Beras Ramos 5kg", "BERAS-5KG", "80", "13500", "5"]])
        result = import_template(store, SELLER, raw2, ".csv")
        assert result["created"] == 0
        assert result["updated"] == 1
        p = store.find_product_by_sku(SELLER, "BERAS-5KG")
        assert compute_stock(store, SELLER, p)["on_hand"] == 80

    def test_template_skips_invalid_rows(self, store):
        raw = _template_csv([
            ["Beras Ramos 5kg", "BERAS-5KG", "100", "", ""],
            ["", "NO-NAME", "10", "", ""],        # tanpa nama → skip
            ["Tanpa Qty", "NO-QTY", "", "", ""],  # tanpa qty → skip
        ])
        result = import_template(store, SELLER, raw, ".csv")
        assert result["created"] == 1
        assert len(result["skipped"]) == 2

    def test_template_xlsx(self, store):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(TEMPLATE_HEADER)
        ws.append(["Beras XLSX", "BERAS-XL", "60", "13000", "5"])
        buf = io.BytesIO()
        wb.save(buf)
        result = import_template(store, SELLER, buf.getvalue(), ".xlsx")
        assert result["created"] == 1

    def test_template_missing_columns_rejected(self, store):
        # kolom header tak dikenal → MISSING_COLUMNS
        buf = io.StringIO()
        buf.write("KolomA,KolomB\n1,2\n")
        with pytest.raises(Exception) as e:
            import_template(store, SELLER, buf.getvalue().encode(), ".csv")
        assert e.value.code == "MISSING_COLUMNS"


# ---------------------------------------------------------------------------
# Router behavior + seller scoping
# ---------------------------------------------------------------------------

class TestRouter:

    def test_list_and_detail_flow(self, store):
        r = client.post("/v1/stock/opening", json={
            "name": "Beras Ramos 5kg", "sku": "BERAS-5KG", "qty": 100,
        })
        assert r.status_code == 200
        body = r.json()
        assert body["on_hand"] == 100

        # movement
        m = client.post("/v1/stock/movements", json={
            "product_id": body["product_id"], "type": "receipt", "qty": 25,
        })
        assert m.status_code == 200
        assert m.json()["on_hand"] == 125

        # list
        lst = client.get("/v1/stock").json()
        assert lst["items"][0]["on_hand"] == 125
        assert lst["mismatch_count"] == 0

        # detail with movements
        d = client.get(f"/v1/stock/{body['product_id']}").json()
        assert d["on_hand"] == 125
        assert len(d["movements"]) == 1
        assert d["movements"][0]["type"] == "receipt"

    def test_opening_via_template_upload(self, store):
        raw = _template_csv([["Via Upload", "UPLOAD-1", "15", "", ""]])
        r = client.post("/v1/stock/opening",
                        files={"file": ("template.csv", raw, "text/csv")})
        assert r.status_code == 200
        assert r.json()["created"] == 1

    def test_detail_404(self, store):
        assert client.get("/v1/stock/nonexistent").status_code == 404

    def test_movement_product_not_found(self, store):
        r = client.post("/v1/stock/movements", json={
            "product_id": "ghost", "type": "receipt", "qty": 5,
        })
        assert r.status_code == 404

    def test_seller_scoping_isolation(self, store):
        """ADR-1: produk seller A tidak terlihat oleh seller B."""
        client.post("/v1/stock/opening", json={
            "name": "Milik A", "sku": "MILIK-A", "qty": 10,
        })
        original = app.dependency_overrides[get_identity]
        app.dependency_overrides[get_identity] = lambda: Identity(
            user_id="u-lain", email=None, seller_id="s-lain", role="owner"
        )
        try:
            # seller lain: list kosong, template dengan SKU sama buat produk BARU
            lst = client.get("/v1/stock").json()
            assert lst["items"] == []
            r = client.post("/v1/stock/opening", json={
                "name": "Milik B", "sku": "MILIK-A", "qty": 99,
            })
            assert r.json()["created"] is True  # bukan update produk seller A
            assert r.json()["on_hand"] == 99
        finally:
            app.dependency_overrides[get_identity] = original
