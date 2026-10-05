"""Mock server — frontend dev tanpa backend jadi (M0-3 handoff)."""
from fastapi import FastAPI

app = FastAPI(title="Laku Mock API")

# Data dari docs/seed-narrative.md — 10 produk Warung Bu Rina, semua state terwakili
SEED_RECOMMENDATIONS = [
    {"sku": "BERAS-RAMOS-5KG",   "name": "Beras Ramos Premium 5kg",   "state": "CRITICAL",        "cover_days": 1.1,  "suggested_qty": 60},
    {"sku": "MINYAK-SANIA-2L",   "name": "Minyak Goreng Sania 2L",    "state": "REORDER",         "cover_days": 9.0,  "suggested_qty": 24},
    {"sku": "GULA-GULAKU-1KG",   "name": "Gula Pasir Gulaku 1kg",     "state": "OK",              "cover_days": 32.0, "suggested_qty": 0},
    {"sku": "TEH-SARIWANGI-50",  "name": "Teh Celup Sariwangi isi 50","state": "OVERSTOCK",       "cover_days": 1575, "suggested_qty": 0, "capital_tied": 630000},
    {"sku": "LAMPU-LED-AWAN",    "name": "Lampu Tidur LED Awan",      "state": "DEAD",            "cover_days": None, "suggested_qty": 0, "capital_tied": 175000},
    {"sku": "KOPI-KAPAL-165",    "name": "Kopi Kapal Api Blend 165g", "state": "INSUFFICIENT_DATA","cover_days": None, "suggested_qty": None},
    {"sku": "AIR-CLUB-1500",     "name": "Air Mineral Club 1500ml",   "state": "OK",              "cover_days": 11.0, "suggested_qty": 0, "overlay": "NEGATIVE"},
    {"sku": "GALON-ISI",         "name": "Galon Isi Ulang",           "state": "OK",              "cover_days": 6.0,  "suggested_qty": 0, "trend": "rising"},
    {"sku": "SABUN-COLEK",       "name": "Sabun Colek Batang",        "state": "OK",              "cover_days": 41.0, "suggested_qty": 0, "trend": "declining"},
    {"sku": "KOPI-SACHS-65",     "name": "Kopi Sachs 65g",            "state": "REORDER",         "cover_days": 8.0,  "suggested_qty": 12, "overlay": "STALE"},
]


@app.get("/health")
def health():
    return {"status": "ok", "service": "laku-mock"}


@app.get("/v1/recommendations")
def recommendations():
    return {"items": SEED_RECOMMENDATIONS, "generated_at": "2026-10-05T00:00:00+07:00"}
