"""Laku API — entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.deps.settings import get_settings

app = FastAPI(
    title="Laku API",
    description="Demand-driven restock engine untuk seller multi-marketplace.",
    version="0.1.0",
)

# --- Routers ---
from app.routers.imports import router as imports_router  # noqa: E402
from app.routers.recap import router as recap_router  # noqa: E402

app.include_router(imports_router)
app.include_router(recap_router)

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
