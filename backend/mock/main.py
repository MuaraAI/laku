"""Mock server Laku — frontend dev tanpa backend asli (M0-3 / Y2).

Jalankan: uvicorn mock.main:app --port 8400
Semua data dari mock/fixtures/ (docs/seed-narrative.md) — tanpa DB.
"""
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str) -> dict:
    with open(FIXTURES / f"{name}.json", encoding="utf-8") as f:
        return json.load(f)


app = FastAPI(title="Laku Mock API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://laku.muaraai.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "laku-mock", "version": "0.1.0"}


@app.get("/v1/recommendations")
def recommendations(state: str | None = None, overlays: str | None = None):
    data = _load("recommendations")
    items = data["recommendations"]
    if state:
        items = [i for i in items if i["state"] == state.upper()]
    if overlays:
        wanted = set(overlays.split(","))
        items = [i for i in items if wanted & set(i.get("overlays", []))]
    return {"items": items, "counts": data["counts"], "generated_at": data["generated_at"]}


@app.get("/v1/recap")
def recap(days: int = 30):
    data = _load("recap")
    if days != 30:
        # Mock hanya punya dataset 30 hari — kembalikan apa adanya dengan catatan.
        data = {**data, "period": {**data["period"], "days": days},
                "warnings": data["warnings"] + [{"type": "mock", "message": f"Mock: periode {days} hari memakai dataset 30 hari"}]}
    return data


@app.get("/v1/analytics/ranking")
def ranking(by: str = "units"):
    recs = _load("recommendations")["recommendations"]
    items = [
        {"rank": i + 1, "product_id": r["product_id"], "name": r["name"],
         "units_30d": [86, 41, 39, 33, 24, 4, 18, 3, 12, 9][i % 10],
         "state": r["state"]}
        for i, r in enumerate(recs)
    ]
    items.sort(key=lambda x: -x["units_30d"])
    return {"by": by, "items": [{**it, "rank": i + 1} for i, it in enumerate(items)]}


@app.get("/v1/analytics/summary")
def summary():
    return {
        "omzet_30d_rp": 17120000,
        "sku_aktif": 10,
        "urgent": 4,
        "stop_buying": 2,
        "coverage": [
            {"channel": "shopee", "data_through": "2026-09-30", "stale": False},
            {"channel": "tiktok_shop", "data_through": "2026-09-25", "stale": True},
        ],
    }
