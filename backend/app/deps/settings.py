"""Settings — load dari .env di root repo (backend/../.env) atau backend/.env."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    redis_url: str = ""
    muaraai_gateway_key: str = ""
    demo_mode: bool = False
    env: str = "prod"  # "dev" | "prod" — dev saja yang expose /docs & openapi
    sentry_dsn: str = ""
    allowed_origins: str = "http://localhost:3000,https://laku.muaraai.com"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
