"""Test B6 — me router: onboarding-status, settings, channels (external behavior).

Acceptance (plan B6):
  - onboarding-status jalan di demo mode tanpa Supabase (seed Bu Rina).
  - settings: owner boleh update, operator 403.
  - channels: channel tidak dikenal = 422.

Run: pytest backend/tests/test_me.py -v
"""
from __future__ import annotations

import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.deps.auth import Identity, get_identity  # noqa: E402

client = TestClient(app)


def _owner() -> Identity:
    return Identity(user_id="u-owner", email="o@x.id", seller_id="demo-seller", role="owner")


def _operator() -> Identity:
    return Identity(user_id="u-op", email="p@x.id", seller_id="demo-seller", role="operator")


@pytest.fixture(autouse=True)
def _force_demo(monkeypatch):
    from app.deps.settings import get_settings

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "", raising=False)
    monkeypatch.setattr(s, "demo_mode", True, raising=False)
    yield


def test_onboarding_status_demo():
    app.dependency_overrides[get_identity] = lambda: _owner()
    r = client.get("/v1/me/onboarding-status")
    assert r.status_code == 200
    body = r.json()
    assert body["next_step"] == "upload"
    assert body["lead_time_is_default"] is True
    assert "shopee" in body["channels"]


def test_settings_operator_forbidden():
    app.dependency_overrides[get_identity] = lambda: _operator()
    r = client.post("/v1/me/settings", json={"lead_time_days": 7})
    assert r.status_code == 403


def test_settings_owner_updates():
    app.dependency_overrides[get_identity] = lambda: _owner()
    r = client.post("/v1/me/settings", json={"lead_time_days": 7, "service_level": 0.98})
    assert r.status_code == 200
    assert r.json()["applied"]["lead_time_days"] == 7


def test_settings_empty_body_rejected():
    app.dependency_overrides[get_identity] = lambda: _owner()
    r = client.post("/v1/me/settings", json={})
    assert r.status_code == 422


def test_channels_unknown_rejected():
    app.dependency_overrides[get_identity] = lambda: _owner()
    r = client.post("/v1/me/channels", json={"channels": ["shopee", "bukalapak"]})
    assert r.status_code == 422


def test_channels_ok():
    app.dependency_overrides[get_identity] = lambda: _owner()
    r = client.post("/v1/me/channels", json={"channels": ["shopee", "tiktok_shop"]})
    assert r.status_code == 200
    assert set(r.json()["channels"]) == {"shopee", "tiktok_shop"}
