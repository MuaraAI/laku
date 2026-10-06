"""Test isolation — paksa memory store: tests tidak boleh menyentuh Supabase.

`.env` lokal (laptop lead: SUPABASE_URL + key terisi) tidak boleh mengubah
perilaku test. Fixture meniadakan field Supabase di singleton Settings
(lru_cached, jadi semua pemanggil get_settings() lihat nilai kosong) dan
mengembalikannya setelah test selesai.
"""

import pytest


@pytest.fixture(autouse=True)
def _force_memory_stores(monkeypatch):
    from app.deps.settings import get_settings

    s = get_settings()
    monkeypatch.setattr(s, "supabase_url", "", raising=False)
    monkeypatch.setattr(s, "supabase_anon_key", "", raising=False)
    monkeypatch.setattr(s, "supabase_service_key", "", raising=False)
    monkeypatch.setattr(s, "rate_limit_enabled", False, raising=False)
    yield
