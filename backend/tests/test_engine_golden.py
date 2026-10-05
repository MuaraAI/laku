"""Golden tests B3 — engine restock HARUS exact sesuai PRD §9A + property tests.

Run: pytest backend/tests/test_engine_golden.py -v
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.engine import EngineInput, compute  # noqa: E402

# ---------- helper ----------

def mk(daily=None, history_days=90, on_hand=40, on_order=0, lt=5, r=7, c=14,
       sl=0.95, overstock=60, stockout_days=None, stock_set_up=True,
       lead_sd=0.0, channel_stale=False, opening_date=None):
    daily = daily if daily is not None else [10] * 30
    return EngineInput(
        daily_units=daily,
        history_days=history_days,
        on_hand=on_hand,
        on_order=on_order,
        lead_time_days=lt,
        review_days=r,
        cycle_days=c,
        overstock_days=overstock,
        service_level=sl,
        stockout_days=stockout_days or set(),
        stock_set_up=stock_set_up,
        lead_time_sd_days=lead_sd,
        channel_stale=channel_stale,
        opening_date=opening_date,
    )


# ================= GOLDEN WORKED EXAMPLE 1 (PRD §9A) =================
# μ=10, σ=4, LT=5, R=7 (P=12), z=1.65, C=14, on_hand=40, on_order=0
# SS = ceil(1.65 * sqrt(12*16)) = 23
# ROP = 10*12 + 23 = 143
# qty = ceil(10*(5+14) + 23 - 40) = 173
# cover = 40/10 = 4 <= LT(5) → CRITICAL

def test_golden_example_1():
    daily = [10] * 30  # σ akan 0 kalau flat... PRD pakai σ=4 → konstruksi seri eksplisit
    # seri dengan mean 10, sd pop 4: gunakan pola simetris
    daily = [6, 14, 10, 6, 14, 10, 6, 14, 10, 6, 14, 10, 6, 14, 10,
             6, 14, 10, 6, 14, 10, 6, 14, 10, 6, 14, 10, 6, 14, 10]
    # mean = 10 (sum 300/30); variance = ((16+16+0)*10)/30 = 10.67 → σ ≈ 3.265 — BUKAN 4!
    # Kita pakai jalur deterministik: engine menerima sigma implisit dari data.
    # Supaya EXACT sesuai golden PRD, kita feed σ=4 via seri:
    # 30 hari, mean 10, sd 4 → variasi [2,18] bergantian + sisanya 10 memberi sd 4.0?
    # 2,18 berulang 10x + 10 berulang 10x: mean=(2+18)*10/30+10*10/30=10; var=((64+64)*10 + 0*10)/30=42.67
    # → bukan 4. Solusi resmi: PRD menyebut σ=4 → kita set via daily pattern yang menghasilkan
    #   sd populasi persis 4: 30 nilai dgn sum sq dev = 30*16=480.
    # Konstruksi: 10 nilai 4, 10 nilai 10, 10 nilai 16 → mean 10, sq dev per triplet = 36+0+36=72*10=720 ≠ 480.
    # Gunakan: 15 nilai 6, 15 nilai 14 → mean 10, var = (16+16)/2 = 16 → σ=4 EXACT.
    daily = [6, 14] * 15  # mean 10, σ populasi = 4.0 exact
    rec = compute(mk(daily=daily, on_hand=40))
    assert rec.safety_stock == 23, f"SS: {rec.safety_stock}"
    assert rec.reorder_point == 143, f"ROP: {rec.reorder_point}"
    assert rec.suggested_qty == 173, f"qty: {rec.suggested_qty}"
    assert rec.state == "CRITICAL"
    assert rec.days_of_cover == 4.0
    # why-panel wajib mengekspos semua input
    for k in ("mu", "sigma", "lead_time_days", "review_days", "SS", "ROP", "on_hand", "on_order"):
        assert k in rec.inputs


# ================= GOLDEN WORKED EXAMPLE 2 (slow overstock) =================
# history 45 hari, 3 unit/30 hari, on_hand=120, O=60 → OVERSTOCK, rough, no qty

def test_golden_example_2():
    daily = [0] * 15 + [0, 1, 0, 0, 2, 0] + [0] * 9  # 3 unit dalam 30 hari, tersebar
    rec = compute(mk(daily=daily, history_days=45, on_hand=120))
    assert rec.state == "OVERSTOCK"
    assert rec.suggested_qty == 0
    assert rec.inputs.get("rough_estimate") is True


# ================= INSUFFICIENT DATA =================

def test_insufficient_data_short_history():
    daily = [5, 5, 5]  # 3 hari
    rec = compute(mk(daily=daily, history_days=3, on_hand=10))
    assert rec.state == "INSUFFICIENT_DATA"
    assert rec.suggested_qty is None


def test_insufficient_data_few_units():
    daily = [0, 1, 0, 2, 0] + [0] * 25  # 3 unit/30 hari, history cukup tapi unit kurang
    # NOTE: OVERSTOCK dicek dulu → pastikan stok kecil biar gak nyangkut OVERSTOCK
    rec = compute(mk(daily=daily, history_days=45, on_hand=3))
    # mu_obs = 3/30 = 0.1 → cover = 30 hari < 60 → gak OVERSTOCK
    assert rec.state == "INSUFFICIENT_DATA"
    assert rec.suggested_qty is None


# ================= DEAD =================

def test_dead():
    daily = [0] * 30
    rec = compute(mk(daily=daily, history_days=90, on_hand=35))
    assert rec.state == "DEAD"
    # baru 30 hari → belum boleh dibilang DEAD
    rec2 = compute(mk(daily=daily, history_days=30, on_hand=35))
    assert rec2.state != "DEAD"


def test_dead_requires_60d_history():
    daily = [0] * 30
    rec = compute(mk(daily=daily, history_days=45, on_hand=20))
    # 45 hari (<60): belum boleh DEAD; μ_obs=0 → cover tak terdefinisi → bukan OVERSTOCK jg
    assert rec.state == "INSUFFICIENT_DATA"


# ================= OVERSTOCK sebelum INSUFFICIENT =================

def test_overstock_beats_insufficient():
    """Slow item dengan stok gede tetap OVERSTOCK walaupun <5 unit/30 hari."""
    daily = [1, 0, 0, 1, 0] + [0] * 25  # 2 unit/30 hari
    rec = compute(mk(daily=daily, history_days=45, on_hand=300))
    assert rec.state == "OVERSTOCK"
    assert rec.suggested_qty == 0


# ================= STOCK SET UP flag =================

def test_stock_not_set_up():
    rec = compute(mk(on_hand=40, stock_set_up=False))
    assert rec.state == "INSUFFICIENT_DATA"
    assert "Set your stock" in rec.inputs.get("note", "")


# ================= NEGATIVE overlay =================

def test_negative_on_hand_no_qty():
    rec = compute(mk(on_hand=-6))
    assert "NEGATIVE" in rec.overlays
    assert rec.suggested_qty is None or rec.suggested_qty == 0


# ================= STALE overlay =================

def test_stale_overlay():
    rec = compute(mk(on_hand=200, channel_stale=True))
    assert "STALE" in rec.overlays


# ================= PROPERTY TESTS =================

def test_property_mu_up_qty_up():
    base_daily = [6, 14] * 15
    low = compute(mk(daily=[u // 2 for u in base_daily], on_hand=40))
    high = compute(mk(daily=base_daily, on_hand=40))
    assert high.suggested_qty >= low.suggested_qty


def test_property_lt_up_rop_up():
    r5 = compute(mk(on_hand=0, lt=5))
    r8 = compute(mk(on_hand=0, lt=8))
    assert r8.reorder_point > r5.reorder_point


def test_property_on_hand_up_qty_down():
    a = compute(mk(on_hand=0))
    b = compute(mk(on_hand=50))
    if a.suggested_qty is not None and b.suggested_qty is not None:
        assert a.suggested_qty >= b.suggested_qty


def test_qty_never_negative():
    rec = compute(mk(on_hand=500, lt=5, r=7))
    assert rec.suggested_qty in (None, 0)


def test_r_zero_reproduces_continuous_review():
    """R=0 → P=LT → perilaku v2.2 (continuous review)."""
    daily = [6, 14] * 15
    rec = compute(mk(daily=daily, on_hand=40, r=0))
    # P=5 → SS = ceil(1.65*sqrt(5*16)) = ceil(14.78) = 15
    assert rec.safety_stock == 15
    assert rec.reorder_point == 10 * 5 + 15  # = 65


def test_stockout_day_adjustment():
    """Hari stok habis di-exclude dari μ/σ kalau history stok ada (butuh opening_date)."""
    from datetime import date
    daily_full = [6, 14] * 15
    rec_no_adj = compute(mk(daily=daily_full, on_hand=40))
    rec_adj = compute(mk(daily=daily_full, on_hand=40, stockout_days={1, 3},
                         opening_date=date(2026, 9, 1)))  # exclude 2 hari bernilai 14
    assert rec_adj.inputs["stockout_days_excluded"] == 2
    # μ setelah exclude berubah (excluded dipilih agar mean bergeser)
    assert rec_adj.inputs["mu"] != rec_no_adj.inputs["mu"]
