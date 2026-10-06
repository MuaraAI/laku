"""Recommendations service — engine §9A di atas data nyata (B7 integration).

Agregasi deterministik: daily_units per produk dari eligible sales
(completed|in_progress), on_hand dari stock ledger. Tanpa angka karangan.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

JAKARTA = timezone(timedelta(hours=7))  # WIB — fixed UTC+7, tanpa DST

from app.services.engine import EngineInput, Recommendation, compute
from app.services.stock_ledger import compute_stock

STATE_ORDER = {"CRITICAL": 0, "REORDER": 1, "OK": 2, "OVERSTOCK": 3, "DEAD": 4, "INSUFFICIENT_DATA": 5}
STALE_DAYS = 7


def _to_date(v) -> date | None:
    if v is None:
        return None
    if isinstance(v, date):
        return v
    try:
        return datetime.fromisoformat(str(v).replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _stale(sales: list[dict], today: date) -> bool:
    """Kanal dianggap STALE kalau sale eligible terakhir > 7 hari (A12/overlay)."""
    dates = [d for s in sales if (d := _to_date(s.get("sold_at"))) is not None]
    newest = max(dates, default=None)
    return newest is None or (today - newest).days > STALE_DAYS


def build_recommendations(store, seller_id: str, today: date | None = None) -> dict:
    """Semua produk seller → list rekomendasi sorted urgensi (api.md MVP)."""
    # "hari ini" = WIB: kalau UTC, sale jam 00:00-06:59 WIB dapat age=-1 → hilang dari demand (M13)
    today = today or datetime.now(JAKARTA).date()
    sales = store.fetch_eligible_sales(seller_id)
    stale = _stale(sales, today)

    items: list[dict] = []
    counts: dict[str, int] = {}
    for p in store.list_products(seller_id):
        stock = compute_stock(store, seller_id, p, sales=sales)

        # daily units 60 hari terakhir (evaluasi DEAD & window restock)
        daily = [0] * 60
        first_sale: date | None = None
        newest_sale: date | None = None
        for s in sales:
            if (s.get("sku") or "") != (p.get("sku") or ""):
                continue
            d = _to_date(s.get("sold_at"))
            if d is None:
                continue
            first_sale = d if first_sale is None or d < first_sale else first_sale
            newest_sale = d if newest_sale is None or d > newest_sale else newest_sale
            age = (today - d).days
            if 0 <= age < 60:
                daily[age] += int(s.get("qty") or 0)

        history_days = (
            max((today - first_sale).days + 1, 1)
            if first_sale else (30 if any(daily) else 0)
        )

        rec: Recommendation = compute(EngineInput(
            daily_units=daily,
            history_days=history_days,
            on_hand=int(stock["on_hand"]) if stock.get("stock_set_up") and stock.get("on_hand") is not None else 0,
            on_order=stock.get("on_order", 0),
            stock_set_up=bool(stock.get("stock_set_up")),
            channel_stale=stale,
            opening_date=_to_date(stock.get("opening_date")),
            data_through=newest_sale,
        ))
        if stock.get("mismatch") and "NEGATIVE" not in rec.overlays:
            rec.overlays.append("NEGATIVE")

        counts[rec.state] = counts.get(rec.state, 0) + 1
        items.append({
            "product_id": p["id"],
            "name": p.get("name"),
            "sku": p.get("sku"),
            "state": rec.state,
            "overlays": rec.overlays,
            "reorder_point": rec.reorder_point,
            "safety_stock": rec.safety_stock,
            "suggested_qty": rec.suggested_qty,
            "days_of_cover": rec.days_of_cover,
            "why": rec.inputs,
        })

    items.sort(key=lambda x: STATE_ORDER.get(x["state"], 9))
    return {"items": items, "counts": counts, "generated_at": datetime.now(timezone.utc).isoformat()}
