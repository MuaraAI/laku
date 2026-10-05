"""Test B1 — parser Shopee (external behavior, fixture format-setia UNVERIFIED).

Run: pytest backend/tests/test_parser_shopee.py -v
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.parsers.shopee import load_config, parse_shopee  # noqa: E402

CONFIG = load_config(os.path.join(os.path.dirname(__file__), "..", "configs", "channels", "shopee.yaml"))
FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "shopee_sample.csv")


@pytest.fixture
def result():
    with open(FIXTURE, "rb") as f:
        return parse_shopee(f.read(), CONFIG)


def test_multiline_order_expands(result):
    """Order 3-item = 3 baris dengan order_id sama (line_key beda)."""
    lines_2401 = [r for r in result.rows if r["order_id"] == "AD-SHOPEE-2401"]
    assert len(lines_2401) == 3
    assert len({r["line_key"] for r in lines_2401}) == 3


def test_status_mapped(result):
    by_id = {r["order_id"]: r for r in result.rows}
    assert by_id["AD-SHOPEE-2402"]["status"] == "cancelled"
    assert all(r["status"] == "completed" for r in result.rows if r["order_id"] != "AD-SHOPEE-2402")


def test_money_parsed(result):
    lines = [r for r in result.rows if r["order_id"] == "AD-SHOPEE-2401"]
    beras = next(r for r in lines if "BERAS" in r["line_key"])
    assert beras["list_price"] == 150000.0
    assert beras["seller_discount"] == 4000.0


def test_empty_column_skipped(result):
    """Kolom kosong di tengah file tidak menggeser mapping (temuan riset Shopee)."""
    lines = [r for r in result.rows if r["order_id"] == "AD-SHOPEE-2401"]
    beras = next(r for r in lines if "BERAS" in r["line_key"])
    assert beras["buyer_kabupaten"] == "Pontianak Kota"
    assert beras["buyer_province"] == "Kalimantan Barat"


def test_scientific_id_is_problem_row(result):
    """ID korup notasi ilmiah Excel → problem row, bukan data sah."""
    bad = [p for p in result.problems if "notasi ilmiah" in p["reason"]]
    assert len(bad) == 1
    assert all("1.234E+15" not in (r["order_id"] or "") for r in result.rows)


def test_no_pii_in_output(result):
    """FR-29: nama/telepon/alamat TIDAK ada di output rows."""
    banned = ["Budi", "Ani", "Dedi", "Eko", "Fina",
              "081234567890", "081298765432", "081311122233",
              "Jl. Gajah Mada", "Jl. Sultan Agung"]
    blob = str(result.rows).lower()
    for token in banned:
        assert token.lower() not in blob, f"PII bocor: {token}"


def test_region_derived(result):
    galon = next(r for r in result.rows if r["order_id"] == "AD-SHOPEE-2405")
    assert galon["buyer_kabupaten"] == "Mempawah"


def test_row_counts(result):
    """7 baris data: 6 sah (1 di antaranya scientific → problem) → 6 rows + 1 problem."""
    assert result.rows_read == 7
    assert len(result.rows) == 6
    assert len(result.problems) == 1
