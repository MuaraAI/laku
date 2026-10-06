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
        assert body["platform_metrics"]["total_sellers_active"] >= 3
        assert body["platform_metrics"]["total_products_monitored"] >= 10
        assert body["platform_metrics"]["total_orders_analyzed"] >= 50
        assert len(body["supported_channels"]) == 4
        assert body["engine_spec"]["pii_at_rest"] is False
        assert body["engine_spec"]["ai_hallucination_risk"] == "0%"
        assert "restock_health_summary" in body
