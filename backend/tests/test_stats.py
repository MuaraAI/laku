"""Test public stats endpoint."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_public_stats_accessible_without_auth():
    for path in ("/stats", "/v1/stats"):
        r = client.get(path)
        assert r.status_code == 200
        body = r.json()
        assert body["service"] == "laku-engine"
        assert body["status"] == "operational"
        assert "platform_metrics" in body
        assert body["platform_metrics"]["total_sellers_active"] >= 0
        assert body["platform_metrics"]["total_products_monitored"] >= 0
        assert body["platform_metrics"]["total_orders_analyzed"] >= 0
        assert len(body["supported_channels"]) == 3
        assert [c["id"] for c in body["supported_channels"]] == ["shopee", "tiktok_shop", "tokopedia"]
        assert body["engine_spec"]["pii_at_rest"] is False
        assert body["engine_spec"]["ai_hallucination_risk"] == "0%"
        assert "restock_health_summary" in body
