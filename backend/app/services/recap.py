"""Consolidated sales recap engine (PRD v3.1 §9D, FR-39).

Deterministic calculations only — no fabricated numbers.
Formulas:
  line_gross = qty * list_price
    (or qty * paid_unit_price + discount_amount if price_basis == 'paid_price_after_discount')
  gross = sum(line_gross) for status in ('completed', 'in_progress', 'returned')
  returns = sum(line_gross) for status in ('returned')
  discounts = sum(discount_amount + allocated_discount) for status in ('completed', 'in_progress')
  net = gross - returns - discounts
  orders = count(distinct order_id) for status in ('completed', 'in_progress')
  aov = net / orders (or 0 if orders == 0)
  cancelled_info = sum(line_gross) for status in ('cancelled', 'unpaid')
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Any

from app.services.wib import to_wib_date


@dataclass
class RecapLine:
    order_id: str
    line_key: str
    channel: str
    status: str  # completed, in_progress, cancelled, returned, unpaid
    qty: int
    unit_price: float  # list price before discount (or paid price if basis is after_discount)
    paid_price: float | None = None
    discount_amount: float = 0.0  # seller-funded line discount
    allocated_discount: float = 0.0  # order-level voucher share allocated pro-rata
    sold_at: datetime | str | None = None
    price_basis: str = "list_price_before_discount"  # or "paid_price_after_discount"

    @property
    def line_gross(self) -> float:
        if self.price_basis == "paid_price_after_discount":
            # Paid price is already after line discount; derive gross:
            # gross = qty * paid_price + discount_amount
            base_paid = self.paid_price if self.paid_price is not None else self.unit_price
            return float(self.qty * base_paid + (self.discount_amount or 0.0))
        return float(self.qty * self.unit_price)

    @property
    def total_discount(self) -> float:
        return float((self.discount_amount or 0.0) + (self.allocated_discount or 0.0))


def allocate_order_voucher(lines: list[RecapLine], voucher_amount: float) -> list[RecapLine]:
    """Allocate an order-level seller voucher pro-rata across eligible lines by line_gross.
    Ensures sum(allocated_discount) == voucher_amount exactly (handles rounding diff).
    """
    if not lines or voucher_amount <= 0:
        return lines

    total_gross = sum(line.line_gross for line in lines)
    if total_gross <= 0:
        return lines

    allocated_sum = 0.0
    for line in lines:
        share = round(voucher_amount * (line.line_gross / total_gross), 2)
        line.allocated_discount = share
        allocated_sum += share

    # Rounding adjustment to largest line
    diff = round(voucher_amount - allocated_sum, 2)
    if diff != 0:
        largest = max(lines, key=lambda l: l.line_gross)
        largest.allocated_discount = round(largest.allocated_discount + diff, 2)

    return lines


@dataclass
class ChannelCoverage:
    channel: str
    data_from: str | None = None
    data_through: str | None = None
    imported_at: str | None = None
    stale: bool = False
    partial: bool = False
    note: str | None = None


def compute_recap(
    lines: list[RecapLine],
    *,
    period_days: int = 30,
    coverages: list[ChannelCoverage] | None = None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Compute consolidated sales recap according to PRD §9D."""

    now = now or datetime.now()

    eligible_sold = {"completed", "in_progress", "returned"}
    active_statuses = {"completed", "in_progress"}
    cancelled_statuses = {"cancelled", "unpaid"}

    # Separate lines
    sold_lines = [l for l in lines if l.status in eligible_sold]
    returned_lines = [l for l in lines if l.status == "returned"]
    active_lines = [l for l in lines if l.status in active_statuses]
    cancelled_lines = [l for l in lines if l.status in cancelled_statuses]

    # Metrics
    gross = sum(l.line_gross for l in sold_lines)
    returns = sum(l.line_gross for l in returned_lines)
    discounts = sum(l.total_discount for l in active_lines)
    net = gross - returns - discounts
    cancelled_info = sum(l.line_gross for l in cancelled_lines)

    # Order count: unique order_ids with >=1 completed or in_progress line
    active_order_ids = {l.order_id for l in active_lines}
    orders_count = len(active_order_ids)
    aov = (net / orders_count) if orders_count > 0 else 0.0

    # Per-channel split
    channels = sorted({l.channel for l in lines})
    per_channel = []
    coverage_map = {c.channel: c for c in (coverages or [])}

    for ch in channels:
        ch_lines = [l for l in lines if l.channel == ch]
        ch_sold = [l for l in ch_lines if l.status in eligible_sold]
        ch_returned = [l for l in ch_lines if l.status == "returned"]
        ch_active = [l for l in ch_lines if l.status in active_statuses]

        ch_gross = sum(l.line_gross for l in ch_sold)
        ch_returns = sum(l.line_gross for l in ch_returned)
        ch_discounts = sum(l.total_discount for l in ch_active)
        ch_net = ch_gross - ch_returns - ch_discounts

        cov = coverage_map.get(ch)
        cov_dict = {
            "data_from": cov.data_from if cov else None,
            "data_through": cov.data_through if cov else None,
            "imported_at": cov.imported_at if cov else None,
            "stale": cov.stale if cov else False,
            "partial": cov.partial if cov else False,
            "note": cov.note if cov else None,
        }

        per_channel.append({
            "channel": ch,
            "gross_rp": round(ch_gross),
            "returns_rp": round(ch_returns),
            "discounts_rp": round(ch_discounts),
            "net_rp": round(ch_net),
            "share": round(ch_net / net, 4) if net > 0 else 0.0,
            "coverage": cov_dict,
        })

    # Trend: aggregate active lines by day (YYYY-MM-DD)
    daily_net: dict[str, float] = {}
    for l in lines:
        if not l.sold_at:
            continue
        # bucket per tanggal WIB — string DB berakhiran +00:00, [:10] = tanggal UTC
        day = to_wib_date(l.sold_at)
        if day is None:
            continue
        day_key = day.isoformat()
        if l.status in active_statuses:
            daily_net[day_key] = daily_net.get(day_key, 0.0) + (l.line_gross - l.total_discount)

    trend = [
        {"date": d, "net_rp": round(val)}
        for d, val in sorted(daily_net.items())
    ]

    # Warnings from coverages
    warnings = []
    if coverages:
        for cov in coverages:
            if cov.stale:
                warnings.append({
                    "channel": cov.channel,
                    "type": "stale",
                    "message": f"{cov.channel.title()}: data belum diimpor >7 hari — impor ulang untuk angka terkini.",
                })
            if cov.partial:
                warnings.append({
                    "channel": cov.channel,
                    "type": "partial",
                    "message": f"{cov.channel.title()}: periode {period_days} hari memiliki rentang waktu yang belum tercover.",
                })

    return {
        "period": {"days": period_days},
        "totals": {
            "gross_rp": round(gross),
            "returns_rp": round(returns),
            "discounts_rp": round(discounts),
            "net_rp": round(net),
            "orders": orders_count,
            "aov_rp": round(aov),
            "cancelled_info_rp": round(cancelled_info),
        },
        "per_channel": per_channel,
        "trend": trend,
        "warnings": warnings,
        "sementara_last_days": 7,
    }


def get_metrics_help() -> dict[str, str]:
    """Static definitions for sales recap metrics."""
    return {
        "gross": "Omzet kotor = total nilai barang pesanan selesai, diproses, atau dikembalikan sebelum diskon penjual.",
        "returns": "Retur = total nilai barang pesanan yang dikembalikan pembeli.",
        "discounts": "Diskon penjual = potongan harga dan voucher yang dibiayai penjual. Voucher subsidi marketplace tidak mengurangi penjualan penjual.",
        "net": "Penjualan bersih = omzet kotor − retur − diskon penjual.",
        "orders": "Jumlah pesanan = total order unik berstatus selesai atau sedang diproses.",
        "aov": "Average Order Value (AOV) = penjualan bersih dibagi jumlah pesanan.",
        "cancelled_info": "Dibatalkan = total nilai pesanan yang batal atau belum dibayar. Ditampilkan terpisah sebagai informasi rekonsiliasi dan tidak pernah masuk total.",
    }
