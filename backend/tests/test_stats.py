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


def test_stats_cache_reuses_rpc_result(monkeypatch):
    """Audit prod 8 Okt: cache TTL — RPC tidak dipanggil ulang dalam window."""
    import app.routers.stats as stats
    from app.deps.settings import get_settings

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "https://lsyaxstligdshxbzmzeu.supabase.co", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "x" * 300, raising=False)
    monkeypatch.setattr(s, "demo_mode", False, raising=False)
    stats._stats_cache = None
    stats._stats_cache_at = 0.0
    calls = {"n": 0}

    class FakeClient:
        def rpc(self, name):
            assert name == "get_platform_stats"
            calls["n"] += 1

            class R:
                data = {
                    "total_sellers_active": 7,
                    "total_products_monitored": 42,
                    "total_orders_analyzed": 363,
                    "urgency_distribution": {"critical": 1, "reorder": 2, "ok": 3, "overstock": 0, "dead": 0},
                }

            class _Exec:
                def execute(self):
                    return R()

            return _Exec()

    monkeypatch.setattr(stats, "_create_stats_client", lambda cc, s: FakeClient())
    # pemanggil pertama -> RPC jalan
    s1 = stats._get_live_platform_data()
    assert calls["n"] == 1
    assert s1[0] == 7 and s1[4] is False
    # pemanggil kedua dalam TTL -> dari cache, RPC tidak dipanggil
    s2 = stats._get_live_platform_data()
    assert calls["n"] == 1
    assert s2[0] == 7 and s2[4] is False
    stats._stats_cache = None  # reset untuk test lain


def test_stats_rpc_failure_falls_back_to_stale_cache(monkeypatch):
    """RPC gagal + cache ada -> angka cache (sah), bukan 0-degraded."""
    import app.routers.stats as stats
    from app.deps.settings import get_settings

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "https://lsyaxstligdshxbzmzeu.supabase.co", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "x" * 300, raising=False)
    monkeypatch.setattr(s, "demo_mode", False, raising=False)
    stats._stats_cache = {"sellers": 7, "products": 42, "orders": 363,
                          "urgency": {"critical": 1, "reorder": 2, "ok": 3, "overstock": 0, "dead": 0}}
    stats._stats_cache_at = 0.0  # kedaluwarsa

    def boom_client(cc, s):
        raise ConnectionError("supabase down")

    monkeypatch.setattr(stats, "_create_stats_client", boom_client)
    s = stats._get_live_platform_data()
    assert s[0] == 7 and s[4] is False  # data cache, bukan degraded
    stats._stats_cache = None
