"""Tanggal bisnis Laku = tanggal WIB (UTC+7, tanpa DST).

Postgres mengembalikan `sold_at` sebagai UTC ("...T17:30:00+00:00"). Memotong
string itu ke 10 karakter atau memanggil `.date()` tanpa konversi menaruh order
00:00–06:59 WIB di hari sebelumnya — demand harian, ledger stok (opening_date)
dan tren rekap jadi meleset satu hari.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

JAKARTA = timezone(timedelta(hours=7))


def today_wib() -> date:
    return datetime.now(JAKARTA).date()


def to_wib_date(value) -> date | None:
    """datetime/str ISO/date → tanggal WIB. Naive dianggap sudah jam lokal WIB."""
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, date):
        return value
    else:
        s = str(value).strip()
        if not s:
            return None
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            try:
                return date.fromisoformat(s[:10])
            except ValueError:
                return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(JAKARTA)
    return dt.date()
