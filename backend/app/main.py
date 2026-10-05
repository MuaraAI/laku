"""Laku API — entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Laku API",
    description="Demand-driven restock engine untuk seller multi-marketplace.",
    version="0.1.0",
)

# --- Routers ---
from app.routers.imports import router as imports_router  # noqa: E402

app.include_router(imports_router)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "laku-api",
        "version": "0.1.0",
        "demo_mode": DEMO_MODE,
    }
