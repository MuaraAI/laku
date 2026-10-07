"""Restock engine — deterministic core (PRD v3.1 §9A). GAK BOLEH ada angka karangan.

Semua keputusan (state, SS, ROP, qty) dari input yang dihitung dari data seller
atau default yang ditandai "asumsi". Data kurang → INSUFFICIENT_DATA, bukan tebakan.
"""
import math
from dataclasses import dataclass, field
from datetime import date, datetime

# ---- konstanta distribusi (z untuk service level, one-sided 95%/90%/98%) ----
Z_TABLE = {0.90: 1.28, 0.95: 1.65, 0.98: 2.05}


@dataclass
class EngineInput:
    """Input per produk — semuanya dihitung dari data seller / default 'asumsi'."""
    # demand (dari order_lines, eligible status only)
    daily_units: list[int]              # d_t per hari selama window W (0 kalau gak laku)
    history_days: int                   # hari sejak first sale / opening_date / stock template
    # stock
    on_hand: int | float                # computed dari ledger (boleh negatif → overlay NEGATIVE)
    on_order: int = 0                   # dari purchase-order-lite (0 kalau fitur belum dipakai)
    opening_date: date | None = None    # untuk stockout-day adjustment
    stockout_days: set[int] = field(default_factory=set)  # indeks hari dgn stok habis (kalau history ada)
    # params seller (default = "asumsi" sampai dikonfirmasi)
    lead_time_days: int = 5
    lead_time_sd_days: float = 0.0
    review_days: int = 7                # R — data datang mingguan
    cycle_days: int = 14                # C, harus >= R
    overstock_days: int = 60            # O
    service_level: float = 0.95
    # flags
    stock_set_up: bool = True           # False → tampil "set your stock", cuma velocity/ranking
    data_through: datetime | date | None = None  # newest sold_at kontributor
    channel_stale: bool = False         # ada kanal 7+ hari gak impor / belum pernah


@dataclass
class Recommendation:
    state: str                          # CRITICAL/REORDER/OK/OVERSTOCK/DEAD/INSUFFICIENT_DATA
    overlays: list[str]                 # STALE / NEGATIVE
    reorder_point: int | None = None
    safety_stock: int | None = None
    suggested_qty: int | None = None
    days_of_cover: float | None = None
    inputs: dict = field(default_factory=dict)   # untuk panel "mengapa"


def _z(service_level: float) -> float:
    if service_level in Z_TABLE:
        return Z_TABLE[service_level]
    # Fallback ke service level terdekat yang tersedia di Z_TABLE
    closest = min(Z_TABLE.keys(), key=lambda sl: abs(sl - service_level))
    return Z_TABLE[closest]


def compute(inp: EngineInput) -> Recommendation:
    """State machine first-match-wins (PRD §9A v3)."""
    overlays: list[str] = []
    if inp.channel_stale:
        overlays.append("STALE")

    units_30d = sum(inp.daily_units[:30]) if inp.daily_units else 0

    # ---- on_hand negatif → NEGATIVE overlay, no qty sampai stok dikonfirmasi ----
    if inp.on_hand < 0:
        overlays.append("NEGATIVE")
        return Recommendation(
            state="INSUFFICIENT_DATA" if not inp.stock_set_up else "CRITICAL",
            overlays=overlays,
            inputs={"on_hand": inp.on_hand, "note": "Cocokkan stok — stok buku negatif"},
        )

    # ---- gak set up stok → velocity/ranking doang ----
    if not inp.stock_set_up:
        return Recommendation(
            state="INSUFFICIENT_DATA",
            overlays=overlays,
            inputs={"note": "Set your stock untuk aktifkan kuantitas restock"},
        )

    # ---- μ, σ (dengan stockout-day adjustment kalau history stok ada) ----
    series = list(inp.daily_units)
    excluded = set()
    if inp.stockout_days and inp.opening_date is not None:
        excluded = inp.stockout_days
    usable = [u for i, u in enumerate(series[:30]) if i not in excluded]
    n = len(usable) or 1
    mu = sum(usable) / n
    mu_obs = units_30d / 30.0

    variance = sum((u - mu) ** 2 for u in usable) / n
    sigma = math.sqrt(variance)

    if not (math.isfinite(mu) and math.isfinite(sigma) and math.isfinite(inp.on_hand)):
        return Recommendation(
            state="INSUFFICIENT_DATA",
            overlays=overlays,
            inputs={"note": "Data input tidak valid (non-finite)"},
        )

    # ---- hitung history_days utk DEAD/OVERSTOCK ----
    history_days = inp.history_days

    # ---- 1. DEAD: stok > 0, 0 unit 60 hari, history >= 60 ----
    if inp.on_hand > 0 and units_30d == 0 and units_30d == sum(series[:60]) and history_days >= 60:
        return Recommendation(
            state="DEAD", overlays=overlays,
            days_of_cover=None,
            inputs={"history_days": history_days, "units_sold_60d": 0, "on_hand": inp.on_hand},
        )

    # ---- 2. OVERSTOCK: history >= 30 hari & cover > O (pakai μ_obs; rough jika <5 unit/30d) ----
    if history_days >= 30 and mu_obs > 0:
        cover_obs = inp.on_hand / mu_obs
        if cover_obs > inp.overstock_days:
            rough = units_30d < 5
            out = Recommendation(
                state="OVERSTOCK", overlays=overlays,
                days_of_cover=round(cover_obs, 1),
                suggested_qty=0,
                inputs={"mu_obs": round(mu_obs, 4), "on_hand": inp.on_hand,
                        "overstock_days": inp.overstock_days, "rough_estimate": rough},
            )
            return out

    # ---- 3. INSUFFICIENT_DATA: history < 14 hari ATAU < 5 unit dalam W ----
    if history_days < 14 or units_30d < 5:
        return Recommendation(
            state="INSUFFICIENT_DATA", overlays=overlays,
            suggested_qty=None,
            inputs={"history_days": history_days, "units_30d": units_30d,
                    "note": "Data belum cukup — raw sales ditampilkan"},
        )

    # ---- params engine ----
    LT = inp.lead_time_days
    R = inp.review_days
    P = LT + R
    C = inp.cycle_days
    z = _z(inp.service_level)
    sigma_LT = inp.lead_time_sd_days

    # ---- SS, ROP, qty (PRD §9A) ----
    SS = math.ceil(z * math.sqrt(P * sigma**2 + mu**2 * sigma_LT**2))
    ROP = math.ceil(mu * P + SS)
    IP = inp.on_hand + inp.on_order

    # ---- 4/5. CRITICAL (cover <= LT) / REORDER (IP <= ROP) / OK ----
    cover = (inp.on_hand / mu) if mu > 0 else float("inf")

    if cover <= LT:
        state = "CRITICAL"
        suggested_qty = max(0, math.ceil(mu * (LT + C) + SS - IP))
    elif IP <= ROP:
        state = "REORDER"
        suggested_qty = max(0, math.ceil(mu * (LT + C) + SS - IP))
    else:
        state = "OK"
        suggested_qty = 0

    return Recommendation(
        state=state,
        overlays=overlays,
        reorder_point=ROP,
        safety_stock=SS,
        suggested_qty=suggested_qty,
        days_of_cover=round(cover, 1) if mu > 0 else None,
        inputs={
            "mu": round(mu, 4), "sigma": round(sigma, 4),
            "lead_time_days": LT, "lead_time_sd_days": sigma_LT,
            "review_days": R, "cycle_days": C, "service_level": inp.service_level,
            "P": P, "z": z, "SS": SS, "ROP": ROP,
            "on_hand": inp.on_hand, "on_order": inp.on_order, "IP": IP,
            "units_30d": units_30d,
            "stockout_days_excluded": len(excluded),
        },
    )
