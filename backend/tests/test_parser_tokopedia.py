"""Test parser Tokopedia Seller Center (CSV & XLSX).

Memverifikasi:
- Parsing file XLSX real seller Tokopedia
- Normalisasi status (completed, in_progress, cancelled, returned)
- Normalisasi uang, SKU, dan tanggal
- Drop PII (Nama Pembeli, No HP, Alamat mentah)
- Zero PII leaks

Run: pytest backend/tests/test_parser_tokopedia.py -v
"""
import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.parsers.tokopedia import parse_tokopedia, parse_tokopedia_xlsx
from app.services.parsers.shopee import load_config
from app.services.import_pipeline import _parse_file

CONFIG = load_config(os.path.join(
    os.path.dirname(__file__), "..", "configs", "channels", "tokopedia.yaml"))

REAL_SAMPLE = "/home/curzy/Downloads/klod/Daftar Pesanan_20260901-20261006_Tokopedia.xlsx"


def test_tokopedia_csv_mock():
    csv_data = (
        "Nomor Invoice,Status Pesanan,Tanggal Pesanan,Nama Produk,SKU Produk,Jumlah,Harga Awal (Rp),Harga Setelah Diskon (Rp),Voucher Toko (Rp),Kota/Kabupaten,Provinsi,Nama Pembeli,No. Telepon Penerima,Alamat Pengiriman\n"
        "INV/20261001/MPL/12345,Pesanan Selesai,01-10-2026 10:00:00,Kemeja Polos,KMJ-PLS,2,100000,90000,0,Kota Pontianak,Kalimantan Barat,Budi,08123456789,Jl. Ahmad Yani\n"
        "INV/20261001/MPL/12346,Pesanan Dibatalkan,01-10-2026 11:00:00,Celana Chino,CLN-CHN,1,150000,140000,10000,Kota Jakarta Selatan,DKI Jakarta,Andi,08129876543,Jl. Sudirman\n"
    ).encode("utf-8")

    res = parse_tokopedia(csv_data, CONFIG)
    assert res.rows_read == 2
    assert len(res.rows) == 2
    assert len(res.problems) == 0

    r0 = res.rows[0]
    assert r0["sales_channel"] == "tokopedia"
    assert r0["order_id"] == "INV/20261001/MPL/12345"
    assert r0["status"] == "completed"
    assert r0["sku"] == "KMJ-PLS"
    assert r0["qty"] == 2
    assert r0["list_price"] == 100000.0
    assert r0["paid_price"] == 90000.0
    assert r0["buyer_kabupaten"] == "Kota Pontianak"
    assert r0["buyer_province"] == "Kalimantan Barat"

    # PII verification
    for k in ("Nama Pembeli", "No. Telepon Penerima", "Alamat Pengiriman", "buyer_name", "phone", "address"):
        assert k not in r0

    r1 = res.rows[1]
    assert r1["status"] == "cancelled"
    assert r1["seller_discount"] == 10000.0


@pytest.mark.skipif(not os.path.exists(REAL_SAMPLE), reason="Real sample file not present on local machine")
def test_tokopedia_real_sample_xlsx():
    with open(REAL_SAMPLE, "rb") as f:
        data = f.read()

    res = _parse_file(data, ".xlsx", "tokopedia")
    assert res.rows_read == 89
    assert len(res.rows) == 89
    assert len(res.problems) == 0

    # Pastikan status canonical
    statuses = {r["status"] for r in res.rows}
    assert statuses.issubset({"completed", "in_progress", "cancelled", "returned", "unpaid"})

    # Pastikan 100% PII dropped
    for r in res.rows:
        assert "buyer_name" not in r
        assert "phone" not in r
        assert "address" not in r
        assert "Nama Pembeli" not in r
        assert "No. Telepon Penerima" not in r
        assert "Alamat Pengiriman" not in r
        assert r["sku"] is not None
        assert r["order_id"].startswith("INV/")
