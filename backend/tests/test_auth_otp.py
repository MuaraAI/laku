"""Test OTP email login (external behavior).

Cover:
  - /request: 200 + email terkirim (Resend dimock), rate limit 5/10 menit → 429
  - /verify: kode benar → session; kode salah → 401; >5 percobaan → kode hangus
  - Kode kedaluwarsa → 401 OTP_EXPIRED
  - Email invalid → 422
  - Kode disimpan sebagai HMAC hash, bukan plaintext (keamanan)
  - One-time use: kode yang sudah terpakai nggak bisa dipakai lagi

Run: pytest backend/tests/test_auth_otp.py -v
"""
from __future__ import annotations

import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.deps.settings import get_settings  # noqa: E402
from app.routers import auth_otp  # noqa: E402

client = TestClient(app)
EMAIL = "rina@warung.test"


@pytest.fixture(autouse=True)
def clean_otp_state():
    auth_otp._SENDS.clear()
    auth_otp._CODES.clear()
    yield
    auth_otp._SENDS.clear()
    auth_otp._CODES.clear()


@pytest.fixture(autouse=True)
def mock_email_send(monkeypatch):
    """Jangan kirim email beneran — tangkap kode yang 'terkirim'."""
    sent = {}

    def fake_send(to: str, code: str) -> None:
        sent[to] = code

    monkeypatch.setattr(auth_otp, "_send_email", fake_send)
    yield sent


@pytest.fixture(autouse=True)
def mock_supabase_link(monkeypatch):
    """generate_link Supabase → token_hash palsu (tanpa network)."""
    class _Props:
        token_hash = "fakehash1234567890abcdef"

    class _Resp:
        properties = _Props()

    def fake_create_link(email: str) -> str:
        return _Resp.properties.token_hash

    monkeypatch.setattr(auth_otp, "_create_link_token", fake_create_link)


@pytest.fixture(autouse=True)
def mock_supabase_env(monkeypatch):
    """conftest nge-blank supabase_url — OTP verify butuh URL+anon key terisi.

    Kita isi dummy: semua network call ke Supabase sudah di-mock di fixture lain.
    """
    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "https://mock.supabase.co", raising=False)
    monkeypatch.setattr(s, "supabase_anon_key", "mock-anon-key", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "mock-service-key", raising=False)
    yield


@pytest.fixture(autouse=True)
def mock_supabase_verify(monkeypatch):
    """verify_otp Supabase (server-side) → session palsu."""

    class _Session:
        access_token = "mock-access-token"
        refresh_token = "mock-refresh-token"
        expires_in = 3600

    class _Resp:
        session = _Session()

    class _Auth:
        def verify_otp(self, cfg):
            return _Resp()

    class _Client:
        auth = _Auth()

    def fake_create_client(url, key):
        return _Client()

    # verify_otp lazy-import: `from supabase import create_client` — patch di sumbernya
    import supabase as supabase_module
    monkeypatch.setattr(supabase_module, "create_client", fake_create_client)
    yield


def _request_code(email=EMAIL):
    return client.post("/v1/auth/otp/request", json={"email": email})


def _verify(email=EMAIL, token="000000"):
    return client.post("/v1/auth/otp/verify", json={"email": email, "token": token})


class TestRequest:

    def test_request_returns_ok_and_sends_code(self, mock_email_send):
        r = _request_code()
        assert r.status_code == 200
        assert r.json()["ok"] is True
        assert r.json()["expires_in"] == 600
        # email "terkirim" dengan kode 6 digit
        code = mock_email_send[EMAIL]
        assert len(code) == 6
        assert code.isdigit()

    def test_code_stored_hashed_not_plaintext(self, mock_email_send):
        _request_code()
        code = mock_email_send[EMAIL]
        entry = auth_otp._CODES[f"code:{EMAIL}"]
        # plaintext kode TIDAK ada di store — cuma HMAC
        assert entry["code_hash"] != code
        assert len(entry["code_hash"]) == 64  # sha256 hex
        assert code not in str(entry)

    def test_invalid_email_rejected(self):
        r = client.post("/v1/auth/otp/request", json={"email": "bukan-email"})
        assert r.status_code == 422

    def test_rate_limit_5_per_window(self):
        for _ in range(5):
            assert _request_code().status_code == 200
        r6 = _request_code()
        assert r6.status_code == 429
        assert r6.json()["detail"]["error"]["code"] == "RATE_LIMITED"


class TestVerify:

    def test_correct_code_returns_session(self, mock_email_send):
        _request_code()
        code = mock_email_send[EMAIL]
        r = _verify(token=code)
        assert r.status_code == 200
        body = r.json()
        assert body["access_token"] == "mock-access-token"
        assert body["refresh_token"] == "mock-refresh-token"

    def test_wrong_code_401(self, mock_email_send):
        _request_code()
        r = _verify(token="999999")
        assert r.status_code == 401
        assert r.json()["detail"]["error"]["code"] == "OTP_INVALID"

    def test_code_one_time_use(self, mock_email_send):
        _request_code()
        code = mock_email_send[EMAIL]
        assert _verify(token=code).status_code == 200
        # kode yang sama dipakai lagi → ditolak (sudah dibuang)
        r = _verify(token=code)
        assert r.status_code == 401
        assert r.json()["detail"]["error"]["code"] in ("OTP_INVALID", "OTP_EXPIRED")

    def test_too_many_attempts_burns_code(self, mock_email_send):
        _request_code()
        for _ in range(5):
            assert _verify(token="000001").status_code == 401
        # percobaan ke-6 dengan kode BENAR pun ditolak (kode di-burn)
        code = mock_email_send[EMAIL]
        r = _verify(token=code)
        assert r.status_code == 401
        assert r.json()["detail"]["error"]["code"] == "OTP_LOCKED"

    def test_verify_without_request_401(self):
        r = _verify(token="123456")
        assert r.status_code == 401
        assert r.json()["detail"]["error"]["code"] == "OTP_EXPIRED"

    def test_expired_code_401(self, mock_email_send, monkeypatch):
        _request_code()
        # majukan waktu 11 menit
        entry = auth_otp._CODES[f"code:{EMAIL}"]
        entry["expires_at"] = auth_otp._now() - 1
        code = mock_email_send[EMAIL]
        r = _verify(token=code)
        assert r.status_code == 401
        assert r.json()["detail"]["error"]["code"] == "OTP_EXPIRED"

    def test_new_request_invalidates_old_code(self, mock_email_send):
        _request_code()
        old_code = mock_email_send[EMAIL]
        _request_code()  # minta ulang
        new_code = mock_email_send[EMAIL]
        assert old_code != new_code or True  # bisa kebetulan sama; yang penting:
        # kode lama nggak berlaku (entry tergantikan)
        r = _verify(token=old_code)
        assert r.status_code in (401,)  # lama hangus kecuali kebetulan == baru
        if old_code == new_code:
            pytest.skip("kode kebetulan identik — probabilistik 1/1jt")
        assert r.json()["detail"]["error"]["code"] == "OTP_INVALID"

    def test_non_digit_token_rejected(self, mock_email_send):
        _request_code()
        r = client.post("/v1/auth/otp/verify",
                        json={"email": EMAIL, "token": "abc123"})
        assert r.status_code == 422


class TestConfig:

    def test_request_without_resend_key_500(self, monkeypatch):
        # hapus mock email autouse: panggil _send_email asli yang ngecek API key
        s = get_settings()
        monkeypatch.setattr(s, "resend_api_key", "", raising=False)
        monkeypatch.setattr(auth_otp, "_send_email", _original_send_email())
        r = _request_code()
        assert r.status_code == 500

    def test_real_send_email_called_with_resend(self, monkeypatch, mock_email_send):
        """Kalau resend_api_key ada, _send_email asli dipanggil (bukan mock)."""
        calls = {}

        def fake_httpx_post(url, **kwargs):
            calls["url"] = url
            calls["json"] = kwargs.get("json", {})
            calls["headers"] = kwargs.get("headers", {})

            class R:
                status_code = 200

            return R()

        s = get_settings()
        monkeypatch.setattr(s, "resend_api_key", "re_test_key", raising=False)
        # ganti mock autouse dengan _send_email asli (yang pakai httpx)
        monkeypatch.setattr(auth_otp, "_send_email", _original_send_email())
        monkeypatch.setattr("app.routers.auth_otp.httpx.post", fake_httpx_post)

        r = _request_code()
        assert r.status_code == 200
        assert calls["url"] == "https://api.resend.com/emails"
        assert calls["headers"]["Authorization"] == "Bearer re_test_key"
        assert calls["json"]["to"] == [EMAIL]
        assert "Kode login Laku" in calls["json"]["subject"]


def _original_send_email():
    """Ambil fungsi _send_email asli dari source module (sebelum di-mock)."""
    import importlib
    import inspect
    # Ambil dari fungsi ter-registry: exec ulang definisi fungsinya saja
    src = inspect.getsource(auth_otp)
    # fallback simpel: buka file dan exec fungsi _send_email dalam namespace baru
    path = os.path.join(os.path.dirname(__file__), "..", "app", "routers", "auth_otp.py")
    with open(path, encoding="utf-8") as f:
        code = f.read()
    # potong mulai dari def _send_email sampai sebelum @router
    start = code.index("def _send_email")
    end = code.index("@router.post", start)
    ns = {"httpx": __import__("httpx"),
          "HTTPException": __import__("fastapi", fromlist=["HTTPException"]).HTTPException}
    # konstanta modul yang dipakai di body _send_email
    ns["_CODE_TTL_SECONDS"] = auth_otp._CODE_TTL_SECONDS
    ns["_RESEND_TIMEOUT"] = auth_otp._RESEND_TIMEOUT
    exec("from app.deps.settings import get_settings\n" + code[start:end], ns)
    return ns["_send_email"]
