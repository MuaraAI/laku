"""Laku API — entry point."""
import logging
import traceback
from http import HTTPStatus
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.deps.settings import get_settings
from app.middleware.rate_limit import RateLimitMiddleware

_dev_docs = get_settings().env == "dev"

app = FastAPI(
    title="Laku API",
    description="Demand-driven restock engine untuk seller multi-marketplace.",
    version="0.1.0",
    # Docs/openapi hanya di dev — produksi tidak expose skema API ke publik.
    docs_url="/docs" if _dev_docs else None,
    redoc_url="/redoc" if _dev_docs else None,
    openapi_url="/openapi.json" if _dev_docs else None,
)

def _status_code_name(code: int) -> str:
    try:
        return HTTPStatus(code).name
    except ValueError:
        return "HTTP_ERROR"


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    headers = getattr(exc, "headers", None)
    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        error_payload = detail.get("error") if isinstance(detail.get("error"), dict) else {"code": "ERROR", "message": str(detail.get("error"))}
        detail_payload = detail
    elif isinstance(detail, dict):
        error_payload = {
            "code": detail.get("code", _status_code_name(exc.status_code)),
            "message": detail.get("message", "Terjadi kesalahan."),
            **{k: v for k, v in detail.items() if k not in ("code", "message")},
        }
        detail_payload = detail
    else:
        error_payload = {
            "code": _status_code_name(exc.status_code),
            "message": str(detail),
        }
        detail_payload = str(detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_payload, "detail": detail_payload},
        headers=headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # sebut field pertama yang salah supaya pesan di UI bisa ditindaklanjuti
    first = errors[0] if errors else {}
    field = ".".join(str(p) for p in first.get("loc", ()) if p not in ("body", "query", "path"))
    message = f"Validasi input gagal: {field} — {first.get('msg', '')}".strip(" —") if field else "Validasi input gagal."
    error_payload = {
        "code": "VALIDATION_ERROR",
        "message": message,
        "details": errors,
    }
    return JSONResponse(
        status_code=422,
        content={"error": error_payload, "detail": exc.errors()},
    )

# --- Routers ---
from app.routers.imports import router as imports_router  # noqa: E402
from app.routers.me import router as me_router  # noqa: E402
from app.routers.recommendations import router as recommendations_router  # noqa: E402
from app.routers.recap import router as recap_router  # noqa: E402
from app.routers.stats import router as stats_router  # noqa: E402
from app.routers.stock import router as stock_router  # noqa: E402

app.include_router(imports_router)
app.include_router(me_router)
app.include_router(recommendations_router)
app.include_router(recap_router)
app.include_router(stats_router)
app.include_router(stock_router)

settings = get_settings()

_log = logging.getLogger("laku.api")


class UnhandledErrorMiddleware(BaseHTTPMiddleware):
    """Error tak tertangkap → JSON {error:{code,message}} standar, DI DALAM CORS.

    Tanpa ini Starlette membalas teks "Internal Server Error" dari ServerErrorMiddleware
    (lapisan terluar, tanpa header CORS) → browser cuma lihat "Failed to fetch".
    Log hanya tipe + path + lokasi kode: pesan exception bisa memuat isi sel file
    seller (PII, aturan #1), jadi tidak ikut dicatat.
    """

    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:  # noqa: BLE001 — jaring terakhir
            frame = traceback.extract_tb(exc.__traceback__)[-1] if exc.__traceback__ else None
            where = f"{frame.filename.rsplit('/', 1)[-1]}:{frame.lineno}" if frame else "?"
            _log.error("unhandled %s on %s %s at %s", type(exc).__name__, request.method, request.url.path, where)
            return JSONResponse(
                status_code=500,
                content={"error": {"code": "INTERNAL_ERROR",
                                   "message": "Terjadi kesalahan di server. Coba lagi sebentar."}},
            )


# urutan: middleware terakhir = terluar. CORS membungkus semuanya, termasuk respons 500 & 429.
app.add_middleware(UnhandledErrorMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Retry-After bukan header CORS-safelisted: tanpa expose, web tidak bisa bilang "coba lagi dalam 60 detik"
    expose_headers=["Retry-After"],
)


@app.get("/health")
def health():
    # Tanpa detail internal (demo_mode dll) — cukup liveness untuk uptime monitor.
    return {"status": "ok", "service": "laku-api", "version": "0.1.0"}
