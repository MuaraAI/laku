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

    @staticmethod
    def _client_ip(request) -> str:
        """IP klien utk rate limit key.

        B-X1 (pentest 7 Okt): XFF mentah bisa dipalsukan client (rotasi IP =
        bypass limit). XFF hanya dipercaya kalau koneksi TCP langsung datang
        dari trusted proxy (Caddy di host yang sama = 127.0.0.1/::1); saat itu
        hop terakhir chain = yang ditambahkan proxy paling dekat. Koneksi
        langsung: pakai client.host, XFF diabaikan.

        Audit prod 8 Okt: topologi live = client -> Cloudflare -> Caddy ->
        uvicorn. XFF hop terakhir justru IP edge Cloudflare (semua user di
        PoP yang sama berbagi bucket) — IP klien asli ada di header
        CF-Connecting-IP yang diset Cloudflare (menimpa nilai client). Karena
        header itu hanya dipercaya di koneksi trusted, spoofing tetap tidak
        mungkin. Prioritas: CF-Connecting-IP > XFF terakhir > client.host.

        NB: TestClient memakai client.host "testclient" — dianggap trusted
        agar suite rate-limit lama (yang mensimulasikan jalur Caddy via XFF)
        tetap valid; unit test khusus _client_ip menguji jalur untrusted.
        """
        client_host = request.client.host if request.client else "?"
        if client_host not in ("127.0.0.1", "::1", "testclient"):
            return client_host
        cf_ip = request.headers.get("cf-connecting-ip", "").strip()
        if cf_ip:
            return cf_ip
        xff = [h.strip() for h in request.headers.get("x-forwarded-for", "").split(",")
               if h.strip()]
        return xff[-1] if xff else client_host

    async def dispatch(self, request, call_next):
        if not get_settings().rate_limit_enabled:
            return await call_next(request)
        if request.url.path == "/health" or request.method in ("OPTIONS", "HEAD"):
            return await call_next(request)
        tier = ("write" if request.method == "POST"
                and request.url.path.startswith(WRITE_PREFIXES) else "read")
        limit, window = LIMITS[tier]
        ip = self._client_ip(request)
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
