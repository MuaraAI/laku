"""Parser TikTok Shop — config-map deterministic (FR-2), UNVERIFIED sampai sample asli.

Struktur yang sama dengan parser Shopee (parse_rows generik); config YAML
(configs/channels/tiktok_shop.yaml) yang menentukan mapping kolom, status map,
dan price_basis. Kalau sample asli beda → ubah YAML, bukan file ini.
"""
from __future__ import annotations

import csv
import io
import re

from app.services.parsers.shopee import (
    ParseResult,
    detect_delimiter,
    load_status_keys,
    parse_rows,
)

# Kolom Excel yang rawan tersimpan sebagai angka (guard FR-7)
_NUMERIC_FLAG_COLS = ("ID Pesanan", "Nomor Pesanan", "Nomor SKU", "SKU")


def parse_tiktok(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export TikTok Shop CSV → rows canonical + problems. In-memory, PII dibuang."""
    text = None
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            text = raw_bytes.decode(enc)
            break
        except (UnicodeDecodeError, LookupError):
            continue
    if text is None:
        result = ParseResult()
        result.problems.append({"row": 0, "column": "-", "reason": "encoding tidak dikenali"})
        return result

    delimiter = detect_delimiter(text[:2000])
    reader = csv.reader(io.StringIO(text), delimiter=delimiter)
    all_rows = list(reader)
    if not all_rows:
        result = ParseResult()
        result.problems.append({"row": 0, "column": "-", "reason": "file kosong"})
        return result

    fieldnames = [h.strip() for h in all_rows[0]]
    rows: list[dict] = []
    row_flags: dict[int, set[str]] = {}
    for cells in all_rows[1:]:
        if not any(c.strip() for c in cells):
            continue
        d = dict(zip(fieldnames, (c.strip() for c in cells)))
        flags: set[str] = set()
        for col in _NUMERIC_FLAG_COLS:
            v = d.get(col)
            if v and re.match(r"^\d+(\.0+)?$", v):
                flags.add("numeric_order_id" if "esanan" in col or "Pesanan" in col
                          else "numeric_sku")
        if flags:
            row_flags[len(rows)] = flags
        rows.append(d)
    return parse_rows(rows, config, start_row=2, row_flags=row_flags,
                      headers=fieldnames)


def parse_tiktok_xlsx(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export TikTok Shop XLSX → rows canonical + problems (guard FR-7)."""
    import openpyxl

    result = ParseResult()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), read_only=True, data_only=True)
    except Exception:
        result.problems.append({"row": 0, "column": "-", "reason": "file XLSX rusak/tidak terbaca"})
        return result

    ws = wb.active
    if ws is None:
        wb.close()
        result.problems.append({"row": 0, "column": "-", "reason": "file XLSX tidak memiliki sheet"})
        return result

    raw_rows: list[dict] = []
    row_flags: dict[int, set[str]] = {}
    headers: list[str] = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else "" for c in row]
            continue
        if all(c is None or (isinstance(c, str) and c.strip() == "") for c in row):
            continue
        cells = {headers[j]: c for j, c in enumerate(row) if j < len(headers)}
        flags: set[str] = set()
        for col in _NUMERIC_FLAG_COLS:
            v = cells.get(col)
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                flags.add("numeric_order_id" if "esanan" in col or "Pesanan" in col
                          else "numeric_sku")
        if flags:
            row_flags[len(raw_rows)] = flags
        raw_rows.append({k: ("" if v is None else str(v).strip()) for k, v in cells.items()})
    wb.close()

    parsed = parse_rows(raw_rows, config, start_row=2, row_flags=row_flags,
                        headers=headers)
    result.rows = parsed.rows
    result.problems = parsed.problems
    result.rows_read = parsed.rows_read
    result.skipped_columns = parsed.skipped_columns
    return result


# re-export agar import_pipeline bisa dispatch generik
__all__ = ["parse_tiktok", "parse_tiktok_xlsx", "load_status_keys", "ParseResult"]
