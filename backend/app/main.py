"""Laku API — entry point."""
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
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

_STATUS_DEFAULT_CODES = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    413: "FILE_TOO_LARGE",
    422: "UNPROCESSABLE_CONTENT",
    429: "RATE_LIMITED",
    500: "INTERNAL_SERVER_ERROR",
    503: "SERVICE_UNAVAILABLE",
}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    headers = getattr(exc, "headers", None)
    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        error_payload = detail.get("error") if isinstance(detail.get("error"), dict) else {"code": "ERROR", "message": str(detail.get("error"))}
        detail_payload = detail
    elif isinstance(detail, dict):
        error_payload = {
            "code": detail.get("code", _STATUS_DEFAULT_CODES.get(exc.status_code, "HTTP_ERROR")),
            "message": detail.get("message", "Terjadi kesalahan."),
            **{k: v for k, v in detail.items() if k not in ("code", "message")},
        }
        detail_payload = detail
    else:
        error_payload = {
            "code": _STATUS_DEFAULT_CODES.get(exc.status_code, "HTTP_ERROR"),
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
    error_payload = {
        "code": "VALIDATION_ERROR",
        "message": "Validasi input gagal.",
        "details": exc.errors(),
    }
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
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

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    # Tanpa detail internal (demo_mode dll) — cukup liveness untuk uptime monitor.
    return {"status": "ok", "service": "laku-api", "version": "0.1.0"}
