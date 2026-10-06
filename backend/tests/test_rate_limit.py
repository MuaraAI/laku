"""Test RateLimitMiddleware (M9)."""
from fastapi.testclient import TestClient
from app.main import app
from app.deps.settings import get_settings

client = TestClient(app)


def test_rate_limit_blocks_after_threshold(monkeypatch):
    s = get_settings()
    monkeypatch.setattr(s, "rate_limit_enabled", True, raising=False)
    # Write tier limit is 10 requests per 60s
    for i in range(10):
        r = client.post("/v1/imports/fake/confirm", headers={"x-forwarded-for": "192.168.1.100"})
        # Might be 401/404/422, but not 429
        assert r.status_code != 429

    # 11th request should be 429 Too Many Requests
    r11 = client.post("/v1/imports/fake/confirm", headers={"x-forwarded-for": "192.168.1.100"})
    assert r11.status_code == 429
    assert r11.json()["error"]["code"] == "RATE_LIMITED"
