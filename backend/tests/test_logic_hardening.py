"""Regresi temuan hunting bug non-endpoint 7 Okt 2026 (B-X1, B-X2, B-X3).

X1: rate limit tidak bisa di-bypass dengan X-Forwarded-For palsu — XFF hanya
    dipercaya dari trusted proxy (localhost), koneksi langsung pakai client.host.
X2: parsing uang per-FILE locale — export EN ("150,000" / "1,234,567") tidak
    lagi terbaca sebagai desimal ID.
X3: adjustment negatif yang membuat on_hand minus ditolak 422 INSUFFICIENT_STOCK
    (beda dari mismatch FR-43 yang sengaja menampilkan minus dari data sales).
"""

from __future__ import annotations

import io
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.deps.auth import Identity, get_identity  # noqa: E402
from app.services.parsers.shopee import (  # noqa: E402
    _parse_money_locale,
    detect_money_locale,
)


def _owner() -> Identity:
    return Identity(user_id="u1", email="y@x.id", seller_id="s-int", role="owner")


HEADER = ("Nomor Pesanan,Status Pesanan,Waktu Pesanan Dibuat,Nama Produk,Nomor SKU,Variasi,"
          "Jumlah,Harga Awal,Harga Setelah Diskon,Diskon Penjual,Kabupaten/Kota,Provinsi,,"
          "Nama Penerima,Telepon,Alamat Pesanan\n")


@pytest.fixture()
def client():
    from app.deps.settings import get_settings

    s = get_settings()
    s.supabase_url = s.supabase_service_key = s.supabase_anon_key = ""
    s.demo_mode = False
    s.rate_limit_enabled = False
    import app.routers.imports as imp
    imp._memory_store = imp.ImportsMemoryStore()
    app.dependency_overrides[get_identity] = lambda: _owner()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ------------------------------------------------------------------ X2

class TestMoneyLocale:

    def test_detect_en_from_thousands_commas(self):
        assert detect_money_locale(["1,234,567", "150,000"]) == "en"

    def test_detect_id_from_dotted_thousands(self):
        assert detect_money_locale(["150.000", "1.234.567"]) == "id"

    def test_detect_en_from_mixed_comma_dot(self):
        # "1,234.56" = koma ribuan + titik desimal → EN anchor kuat
        assert detect_money_locale(["1,234.56", "12,345"]) == "en"

    def test_parse_en_thousands(self):
        assert _parse_money_locale("150,000", "en") == 150000.0
        assert _parse_money_locale("1,234,567", "en") == 1234567.0
        assert _parse_money_locale("1,234.56", "en") == 1234.56

    def test_parse_id_unchanged(self):
        # perilaku lama format ID tidak berubah
        assert _parse_money_locale("150.000", "id") == 150000.0
        assert _parse_money_locale("1.234.567,89", "id") == 1234567.89
        assert _parse_money_locale("12.50", "id") == 12.5

    def test_ambiguous_single_comma_ties_to_id(self):
        # "1,234" ambigu (ribuan EN vs desimal ID "1,234") → tie berat ke ID
        # (format ID = default produk; EN anchor kuat butuh ≥2 koma atau X,YYY.ZZ)
        assert detect_money_locale(["1,234"]) == "id"
        # dengan anchor EN kuat ("9,999,999") satu file → EN menang per-file
        assert detect_money_locale(["1,234", "9,999,999"]) == "en"

    def test_end_to_end_en_export_file(self, client):
        # file export EN: harga kolom pakai koma ribuan → semuanya harus benar
        en_header = ("Order ID,Order Status,Order Paid Time,Product Name,SKU,"
                     "Variation,Quantity,Original Price,Selling Price,Seller Discount,"
                     "City,State,,Recipient,Phone,Address\n")
        row = ("EN-1,Completed,29/09/2026 14:22,Beras,BERAS,,2,"
               "1,234,567,1,150,000,10,000,Kota,Prov,,B,0812,Jl\n")  # TIDAK di-quote → ragged on purpose
        # pakai quoted agar tidak ragged:
        row = ('EN-1,Completed,29/09/2026 14:22,Beras,BERAS,,2,"1,234,567","1,150,000","10,000",Kota,Prov,,B,0812,Jl\n')
        r = client.post("/v1/imports",
                        files={"file": ("en.csv", io.BytesIO((en_header + row).encode()), "text/csv")},
                        data={"channel": "shopee"})
        assert r.status_code == 201, r.text
        # preview tidak expose harga; validasi via confirm + rekomendasi:
        bid = r.json()["import_batch_id"]
        rc = client.post(f"/v1/imports/{bid}/confirm")
        assert rc.status_code == 200, rc.text
        # recap tidak membaca memory store; cukup pastikan tidak crash & baris masuk
        assert rc.json().get("new") == 1


# ------------------------------------------------------------------ X1

class TestRateLimitXFF:

    def test_xff_spoof_no_longer_bypasses(self, monkeypatch):
        from app.deps.settings import get_settings
        from app.middleware.rate_limit import RateLimitMiddleware

        s = get_settings()
        monkeypatch.setattr(s, "rate_limit_enabled", True, raising=False)
        middleware = RateLimitMiddleware(lambda scope, receive, send: None)

        class FakeRequest:
            def __init__(self, ip, xff):
                self.url = type("U", (), {"path": "/v1/imports", })()
                self.method = "POST"
                self.headers = {"x-forwarded-for": xff} if xff else {}
                self.client = type("C", (), {"host": ip})()

        # koneksi langsung (bukan dari localhost) dgn XFF palsu → pakai client.host
        req = FakeRequest("203.0.113.7", "10.9.9.1, 10.9.9.2")
        assert middleware._client_ip(req) == "203.0.113.7"

        # koneksi dari localhost (Caddy) → XFF dipercaya, ambil hop terakhir
        req = FakeRequest("127.0.0.1", "203.0.113.7, 10.0.0.1")
        assert middleware._client_ip(req) == "10.0.0.1"

    def test_endpoint_rate_limit_still_works_via_localhost(self, client, monkeypatch):
        """Jalur Caddy sungguhan: koneksi dari 127.0.0.1 + XFF = IP asli client.
        Ini yang dipakai production — limit harus tetap menendang di ke-11."""
        from app.deps.settings import get_settings

        s = get_settings()
        monkeypatch.setattr(s, "rate_limit_enabled", True, raising=False)
        codes = []
        for i in range(12):
            rr = client.post(
                "/v1/imports",
                files={"file": ("f.csv", io.BytesIO((HEADER + "AD-X,SELESAI,29/09/2026 14:22,P,S,,1,1,1,0,K,P,,B,08,J\n").encode()), "text/csv")},
                data={"channel": "shopee"},
                headers={"X-Forwarded-For": "203.0.113.7"},  # IP asli konstan (dari Caddy)
            )
            codes.append(rr.status_code)
        assert 429 in codes, f"limit harus tetap jalan di jalur proxy: {codes}"

    def test_untrusted_connection_ignores_xff(self, client, monkeypatch):
        """Koneksi BUKAN dari trusted proxy: XFF palsu diabaikan — semua request
        masuk bucket koneksi aslinya, jadi limit tetap kena (bukti fix X1)."""
        from app.deps.settings import get_settings
        from app.middleware.rate_limit import RateLimitMiddleware

        # unit-level: host bukan localhost → XFF diabaikan
        class FakeClient:
            host = "198.51.100.9"  # koneksi langsung dari luar

        class FakeURL:
            path = "/v1/imports"

        class FakeRequest:
            client = FakeClient()
            url = FakeURL()
            method = "POST"
            headers = {"x-forwarded-for": "10.9.9.1"}

        assert RateLimitMiddleware._client_ip(FakeRequest()) == "198.51.100.9"


# ------------------------------------------------------------------ X3

class TestStockAdjustmentGuard:

    def test_adjustment_below_zero_rejected(self, client):
        r = client.post("/v1/stock/opening", json={"name": "P", "sku": "SKU-G1", "qty": 10})
        pid = r.json()["product_id"]
        rr = client.post("/v1/stock/movements",
                         json={"product_id": pid, "type": "adjustment", "qty": -50})
        assert rr.status_code == 422
        assert rr.json()["error"]["code"] == "INSUFFICIENT_STOCK"
        # stok tidak berubah
        items = client.get("/v1/stock").json()["items"]
        assert next(i for i in items if i["sku"] == "SKU-G1")["on_hand"] == 10

    def test_adjustment_to_exact_zero_allowed(self, client):
        r = client.post("/v1/stock/opening", json={"name": "P", "sku": "SKU-G2", "qty": 10})
        pid = r.json()["product_id"]
        rr = client.post("/v1/stock/movements",
                         json={"product_id": pid, "type": "adjustment", "qty": -10})
        assert rr.status_code == 200
        items = client.get("/v1/stock").json()["items"]
        assert next(i for i in items if i["sku"] == "SKU-G2")["on_hand"] == 0

    def test_positive_adjustment_unaffected(self, client):
        r = client.post("/v1/stock/opening", json={"name": "P", "sku": "SKU-G3", "qty": 10})
        pid = r.json()["product_id"]
        rr = client.post("/v1/stock/movements",
                         json={"product_id": pid, "type": "adjustment", "qty": 5})
        assert rr.status_code == 200


# ------------------------------------------------------------------ audit 8 Okt

class TestClientIpPriority:
    """Audit prod 8 Okt: topologi live = client -> Cloudflare -> Caddy -> uvicorn.
    IP klien asli ada di CF-Connecting-IP; XFF terakhir = IP edge Cloudflare."""

    def _mw(self):
        from app.middleware.rate_limit import RateLimitMiddleware
        return RateLimitMiddleware(None)

    def _req(self, host="127.0.0.1", headers=None):
        class FakeClient:
            pass
        FakeClient.host = host

        class FakeRequest:
            pass
        FakeRequest.client = FakeClient()
        FakeRequest.headers = headers or {}
        return FakeRequest()

    def test_cf_connecting_ip_wins(self):
        req = self._req(headers={
            "cf-connecting-ip": "203.0.113.7",
            "x-forwarded-for": "198.51.100.1",  # edge Cloudflare
        })
        assert self._mw()._client_ip(req) == "203.0.113.7"

    def test_xff_fallback_without_cf(self):
        # jalur tanpa Cloudflare (mis. akses LAN langsung ke Caddy)
        req = self._req(headers={"x-forwarded-for": "198.51.100.1, 10.0.0.1"})
        assert self._mw()._client_ip(req) == "10.0.0.1"

    def test_untrusted_cf_header_ignored(self):
        # koneksi langsung dari luar: CF-Connecting-IP palsu TIDAK dipercaya
        req = self._req(host="198.51.100.9", headers={"cf-connecting-ip": "1.2.3.4"})
        assert self._mw()._client_ip(req) == "198.51.100.9"
