"""Rate limit middleware — fixed-window in-process (M9, MVP).

ponytail: in-process state valid karena PM2 instances:1 fork; kalau pindah
multi-worker, ganti ke Redis token-bucket. Key = IP dari X-Forwarded-For
(wajib — di belakang Caddy, client.host = 127.0.0.1 untuk semua user).
"""
import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.deps.settings import get_settings

WRITE_PREFIXES = ("/v1/imports", "/v1/stock/opening", "/v1/stock/movements", "/v1/me")
LIMITS = {"write": (10, 60), "read": (120, 60)}  # (max_req, window_sec)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._hits: dict = defaultdict(deque)

    async def dispatch(self, request, call_next):
        if not get_settings().rate_limit_enabled:
            return await call_next(request)
        if request.url.path == "/health" or request.method in ("OPTIONS", "HEAD"):
            return await call_next(request)
        tier = ("write" if request.method == "POST"
                and request.url.path.startswith(WRITE_PREFIXES) else "read")
        limit, window = LIMITS[tier]
        # IP klien asli ditambahkan di akhir chain XFF oleh Caddy reverse proxy
        ip = (request.headers.get("x-forwarded-for", "").split(",")[-1].strip()
              or (request.client.host if request.client else "?"))
        key, now = (tier, ip), time.monotonic()
        hits = self._hits[key]
        while hits and hits[0] <= now - window:
            hits.popleft()
        if not hits and len(self._hits) > 1000:
            stale = [k for k, v in self._hits.items() if not v or v[-1] <= now - window]
            for k in stale:
                self._hits.pop(k, None)
            hits = self._hits[key]
        if len(hits) >= limit:
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(window)},
                content={"error": {"code": "RATE_LIMITED",
                                   "message": "Terlalu banyak permintaan. Coba lagi sebentar."}},
            )
        hits.append(now)
        return await call_next(request)
