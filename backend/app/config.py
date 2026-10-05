"""App-wide configuration via environment variables."""

import os


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
REDIS_URL = os.getenv("REDIS_URL", "")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

# Import constraints (A14, FR-1)
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_ROWS_PER_FILE = 20_000
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",  # fallback — browsers sometimes send this
}
