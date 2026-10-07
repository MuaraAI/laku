"""Recommendations service — engine §9A di atas data nyata (B7 integration).

Agregasi deterministik: daily_units per produk dari eligible sales
(completed|in_progress), on_hand dari stock ledger. Tanpa angka karangan.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

JAKARTA = timezone(timedelta(hours=7))  # WIB — fixed UTC+7, tanpa DST

from app.services.engine import EngineInput, Recommendation, compute
from app.services.stock_ledger import compute_stock
from app.services.wib import to_wib_date

STATE_ORDER = {"CRITICAL": 0, "REORDER": 1, "OK": 2, "OVERSTOCK": 3, "DEAD": 4, "INSUFFICIENT_DATA": 5}
STALE_DAYS = 7
DEFAULT_LEAD_TIME_DAYS = 5  # sama dengan default kolom sellers.lead_time_days → dianggap "asumsi"


def _engine_params(settings: dict) -> dict:
    """Pengaturan seller (tabel sellers) → argumen EngineInput; kosong = default engine."""
    out: dict = {}
    for key in ("review_days", "cycle_days", "overstock_days"):
        if settings.get(key) is not None:
            out[key] = int(settings[key])
    if settings.get("service_level") is not None:
        out["service_level"] = float(settings["service_level"])
    return out


def _price_and_channel(lines: list[dict], today: date) -> tuple[float | None, str | None]:
    """Harga jual rata-rata (30 hari terakhir, fallback semua) & kanal terbanyak — dari order_lines."""
    recent = [s for s in lines if (d := _to_date(s.get("sold_at"))) and 0 <= (today - d).days < 30]
    basis = recent or lines
    qty = sum(int(s.get("qty") or 0) for s in basis if s.get("unit_price") is not None)
    value = sum(int(s.get("qty") or 0) * float(s["unit_price"]) for s in basis if s.get("unit_price") is not None)
    price = round(value / qty) if qty > 0 else None
    channels: dict[str, int] = {}
    for s in lines:
        if s.get("sales_channel"):
            channels[s["sales_channel"]] = channels.get(s["sales_channel"], 0) + int(s.get("qty") or 0)
    channel = max(channels, key=channels.get) if channels else None
    return price, channel


def _to_date(v) -> date | None:
    # tanggal WIB, bukan tanggal UTC dari string DB (M13 lanjutan)
    return to_wib_date(v)


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
    # pengaturan seller (POST /v1/me/settings) dulu tidak pernah sampai ke engine — selalu default 5/7/14/60/0.95
    get_settings = getattr(store, "get_seller_settings", None)
    seller = (get_settings(seller_id) if callable(get_settings) else {}) or {}
    params = _engine_params(seller)
    seller_lead = seller.get("lead_time_days")

    items: list[dict] = []
    counts: dict[str, int] = {}
    for p in store.list_products(seller_id):
        stock = compute_stock(store, seller_id, p, sales=sales)

        # daily units 60 hari terakhir (evaluasi DEAD & window restock)
        daily = [0] * 60
        first_sale: date | None = None
        newest_sale: date | None = None
        product_sales = [s for s in sales if (s.get("sku") or "") == (p.get("sku") or "")]
        for s in product_sales:
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

        # lead time: override per produk > pengaturan seller > default (= asumsi, badge di UI)
        product_lead = stock.get("lead_time_days")
        lead_time = int(product_lead if product_lead is not None
                        else seller_lead if seller_lead is not None else DEFAULT_LEAD_TIME_DAYS)
        lead_assumed = product_lead is None and (seller_lead is None or int(seller_lead) == DEFAULT_LEAD_TIME_DAYS)

        stock_set_up = bool(stock.get("stock_set_up"))
        on_hand = int(stock["on_hand"]) if stock_set_up and stock.get("on_hand") is not None else 0
        has_sales = any(daily)
        stock_assumed = not stock_set_up

        rec: Recommendation = compute(EngineInput(
            lead_time_days=lead_time,
            **params,
            daily_units=daily,
            history_days=history_days,
            on_hand=on_hand,
            on_order=stock.get("on_order", 0),
            stock_set_up=True if (not stock_set_up and has_sales) else stock_set_up,
            channel_stale=stale,
            opening_date=_to_date(stock.get("opening_date")),
            data_through=newest_sale,
        ))
        if stock.get("mismatch") and "NEGATIVE" not in rec.overlays:
            rec.overlays.append("NEGATIVE")

        rec.inputs.setdefault("lead_time_days", lead_time)
        rec.inputs["lead_time_assumed"] = lead_assumed
        if stock_assumed and has_sales:
            rec.inputs["stock_assumed"] = True
            rec.inputs["note"] = "Stok fisik belum diatur — kuantitas restock dihitung dengan asumsi stok saat ini 0 unit"
        price, channel = _price_and_channel(product_sales, today)

        counts[rec.state] = counts.get(rec.state, 0) + 1
        items.append({
            "product_id": p["id"],
            "name": p.get("name"),
            "sku": p.get("sku"),
            "channel": channel,
            "price": price,
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
