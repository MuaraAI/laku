"""Laku API — entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.deps.settings import get_settings

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

# --- Routers ---
from app.routers.imports import router as imports_router  # noqa: E402
from app.routers.me import router as me_router  # noqa: E402
from app.routers.recommendations import router as recommendations_router  # noqa: E402
from app.routers.recap import router as recap_router  # noqa: E402
from app.routers.stock import router as stock_router  # noqa: E402

app.include_router(imports_router)
app.include_router(me_router)
app.include_router(recommendations_router)
app.include_router(recap_router)
app.include_router(stock_router)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "laku-api",
        "version": "0.1.0",
        "demo_mode": settings.demo_mode,
    }
