"""Test parser TikTok Shop (config-map, fixture UNVERIFIED — format-setia).

Struktur test sama dengan B1 Shopee: multi-item = N baris, status map,
uang/tanggal ternormalisasi, kolom kosong ter-skip, 0 PII di output,
dan pipeline dedup idempoten untuk channel tiktok_shop.

Run: pytest backend/tests/test_parser_tiktok.py -v
"""
import io
import csv
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.parsers.tiktok import parse_tiktok, parse_tiktok_xlsx  # noqa: E402
from app.services.parsers.shopee import load_config  # noqa: E402

CONFIG = load_config(os.path.join(
    os.path.dirname(__file__), "..", "configs", "channels", "tiktok_shop.yaml"))
FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "tiktok_sample.csv")


@pytest.fixture
def result():
    with open(FIXTURE, "rb") as f:
        return parse_tiktok(f.read(), CONFIG)


def test_multiline_order_expands(result):
    """Order 3-item = 3 baris dengan order_id sama (line_key beda)."""
    lines_1001 = [r for r in result.rows if r["order_id"] == "TT-2026-1001"]
    assert len(lines_1001) == 3
    assert len({r["line_key"] for r in lines_1001}) == 3


def test_status_mapped(result):
    by_id = {r["order_id"]: r for r in result.rows}
    assert by_id["TT-2026-1002"]["status"] == "cancelled"
    assert by_id["TT-2026-1003"]["status"] == "in_progress"  # SIAP DIKIRIM
    assert all(r["status"] == "completed"
               for r in result.rows
               if r["order_id"] not in ("TT-2026-1002", "TT-2026-1003"))


def test_money_parsed(result):
    lines = [r for r in result.rows if r["order_id"] == "TT-2026-1001"]
    beras = next(r for r in lines if "BERAS" in r["line_key"])
    assert beras["list_price"] == 150000.0
    assert beras["seller_discount"] == 4000.0
    assert beras["paid_price"] == 146000.0


def test_channel_and_source(result):
    assert all(r["sales_channel"] == "tiktok_shop" for r in result.rows)
    assert all(r["source_system"] == "tiktok_seller_center" for r in result.rows)


def test_region_derived(result):
    galon = next(r for r in result.rows if r["order_id"] == "TT-2026-1004")
    assert galon["buyer_kabupaten"] == "Mempawah"
    assert galon["buyer_province"] == "Kalimantan Barat"


def test_no_pii_in_output(result):
    """FR-29: nama/telepon/alamat TIDAK ada di output rows."""
    banned = ["Budi", "Ani", "Dedi", "Fina",
              "081234567890", "081298765432", "081311122233",
              "Jl. Gajah Mada", "Jl. Sultan Agung", "Jl. Proklamasi"]
    blob = str(result.rows).lower()
    for token in banned:
        assert token.lower() not in blob, f"PII bocor: {token}"


def test_row_counts(result):
    """6 baris data, semuanya sah (0 problem)."""
    assert result.rows_read == 6
    assert len(result.rows) == 6
    assert len(result.problems) == 0


def test_scientific_id_is_problem():
    """ID korup notasi ilmiah → problem row; reason tanpa echo isi sel (PII rule)."""
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["ID Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat",
                "Nama Produk", "Nomor SKU", "Jumlah", "Harga Jual"])
    w.writerow(["1.234E+15", "SELESAI", "28/09/2026 19:45",
                "Beras", "BERAS-5KG", "2", "50.000"])
    result = parse_tiktok(buf.getvalue().encode("utf-8"), CONFIG)
    assert result.rows == []
    assert len(result.problems) == 1
    assert "notasi ilmiah" in result.problems[0]["reason"]
    assert "1.234E+15" not in result.problems[0]["reason"]  # jangan echo isi sel


def test_xlsx_parse():
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["ID Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat",
               "Nama Produk", "Nomor SKU", "Jumlah", "Harga Jual"])
    ws.append(["TT-2026-2001", "SELESAI", "28/09/2026 19:45",
               "Beras XLSX", "BERAS-XL", 2, "50.000"])
    buf = io.BytesIO()
    wb.save(buf)
    result = parse_tiktok_xlsx(buf.getvalue(), CONFIG)
    assert len(result.rows) == 1
    assert result.rows[0]["sales_channel"] == "tiktok_shop"


def test_numeric_id_cell_flagged_in_xlsx():
    """Cell ID tersimpan sebagai angka di Excel → problem (FR-7)."""
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["ID Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat",
               "Nama Produk", "Nomor SKU", "Jumlah", "Harga Jual"])
    ws.append([123450987654321, "SELESAI", "28/09/2026 19:45",
               "Beras", "BERAS-5KG", 2, "50.000"])
    buf = io.BytesIO()
    wb.save(buf)
    result = parse_tiktok_xlsx(buf.getvalue(), CONFIG)
    assert result.rows == []
    assert any("format teks" in p["reason"] for p in result.problems)


# ---------------------------------------------------------------------------
# Pipeline end-to-end: upload → confirm → idempoten (channel tiktok_shop)
# ---------------------------------------------------------------------------

def _upload_and_confirm(content):
    from app.main import app as _app
    from app.deps.auth import Identity, get_identity
    c = TestClient(_app)
    _app.dependency_overrides[get_identity] = lambda: Identity(
        user_id="u-tt", email=None, seller_id="s-tt", role="owner")
    try:
        r = c.post("/v1/imports",
                   files={"file": ("tiktok.csv", content, "text/csv")},
                   data={"channel": "tiktok_shop"})
        assert r.status_code == 201, r.text
        batch_id = r.json()["import_batch_id"]
        cf = c.post(f"/v1/imports/{batch_id}/confirm")
        assert cf.status_code == 200, cf.text
        return r.json(), cf.json()
    finally:
        _app.dependency_overrides.pop(get_identity, None)


def test_pipeline_tiktok_end_to_end_idempotent():
    """Dedup key include channel: file TikTok sama 2× = 0 new, 0 updated."""
    with open(FIXTURE, "rb") as f:
        content = f.read()

    first_preview, first_confirm = _upload_and_confirm(content)
    assert first_confirm["new"] == 6

    _second_preview, second_confirm = _upload_and_confirm(content)
    assert second_confirm["new"] == 0
    assert second_confirm["updated"] == 0
    assert second_confirm["unchanged"] == 6


def test_pipeline_tiktok_isolated_from_shopee():
    """Dedup key 6 kolom: order_id + line_key SAMA tapi channel beda = baris baru,
    bukan unchanged (regression: TikTok×Shopee cross-channel collision)."""
    tt_header = ["ID Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat",
                 "Nama Produk", "Nomor SKU", "Jumlah", "Harga Jual"]
    tt_row = ["ORDER-SAMA-001", "SELESAI", "29/09/2026 14:22",
              "Beras Ramos 5kg", "BERAS-5KG", "2", "50.000"]

    # 1) commit baris lewat channel shopee (header Shopee)
    sh_buf = io.StringIO()
    sh = csv.writer(sh_buf)
    sh.writerow(["Nomor Pesanan", "Status Pesanan", "Waktu Pesanan Dibuat",
                 "Nama Produk", "Nomor SKU", "Jumlah", "Harga Awal"])
    sh.writerow(["ORDER-SAMA-001", "SELESAI", "29/09/2026 14:22",
                 "Beras Ramos 5kg", "BERAS-5KG", "2", "50.000"])

    from app.main import app as _app
    from app.deps.auth import Identity, get_identity
    c = TestClient(_app)
    _app.dependency_overrides[get_identity] = lambda: Identity(
        user_id="u-tt", email=None, seller_id="s-tt", role="owner")
    try:
        r1 = c.post("/v1/imports",
                    files={"file": ("shopee.csv", sh_buf.getvalue().encode(), "text/csv")},
                    data={"channel": "shopee"})
        assert r1.status_code == 201, r1.text
        c1 = c.post(f"/v1/imports/{r1.json()['import_batch_id']}/confirm")
        assert c1.json()["new"] == 1

        # 2) file TikTok dengan order_id + line_key identik → harus NEW, bukan unchanged
        tt_buf = io.StringIO()
        w = csv.writer(tt_buf)
        w.writerow(tt_header)
        w.writerow(tt_row)
        r2 = c.post("/v1/imports",
                    files={"file": ("tiktok.csv", tt_buf.getvalue().encode(), "text/csv")},
                    data={"channel": "tiktok_shop"})
        assert r2.status_code == 201, r2.text
        preview = r2.json()
        assert preview["new"] == 1, "channel beda dengan key sama harus dianggap baru (FR-3)"
        assert preview["unchanged"] == 0

        cf = c.post(f"/v1/imports/{r2.json()['import_batch_id']}/confirm")
        assert cf.json()["new"] == 1
    finally:
        _app.dependency_overrides.pop(get_identity, None)
