"""App-wide configuration via environment variables."""

from app.deps.settings import get_settings

_settings = get_settings()

SUPABASE_URL = _settings.supabase_url
SUPABASE_ANON_KEY = _settings.supabase_anon_key
SUPABASE_SERVICE_KEY = _settings.supabase_service_key
REDIS_URL = _settings.redis_url
DEMO_MODE = _settings.demo_mode

# Import constraints (A14, FR-1)
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_ROWS_PER_FILE = 20_000
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",  # fallback — browsers sometimes send this
    # varian CSV yang dikirim browser/OS nyata (Windows tanpa Excel, Safari, Firefox lama):
    # tanpa ini file CSV asli ditolak INVALID_MIME_TYPE. Isi tetap divalidasi parser.
    "application/csv",
    "application/x-csv",
    "text/x-csv",
    "text/comma-separated-values",
    "text/plain",
}
