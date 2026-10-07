"""Parser Tokopedia Seller Center export (CSV/XLSX)."""
from __future__ import annotations

import csv
import io
import openpyxl

from app.services.parsers.shopee import (
    ParseResult,
    detect_delimiter,
    load_status_keys,
    parse_rows,
)


def parse_tokopedia(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export Tokopedia CSV → rows canonical + problems."""
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
    for cells in all_rows[1:]:
        if not any(c.strip() for c in cells):
            continue
        d = dict(zip(fieldnames, (c.strip() for c in cells)))
        rows.append(d)
    return parse_rows(rows, config, start_row=2, headers=fieldnames)


def parse_tokopedia_xlsx(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export Tokopedia XLSX → rows canonical + problems."""
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
    headers: list[str] = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else "" for c in row]
            continue
        if all(c is None or (isinstance(c, str) and c.strip() == "") for c in row):
            continue
        cells = {headers[j]: c for j, c in enumerate(row) if j < len(headers)}
        raw_rows.append({k: ("" if v is None else str(v).strip()) for k, v in cells.items()})
    wb.close()

    parsed = parse_rows(raw_rows, config, start_row=2, headers=headers)
    result.rows = parsed.rows
    result.problems = parsed.problems
    result.rows_read = parsed.rows_read
    result.skipped_columns = parsed.skipped_columns
    return result


__all__ = ["parse_tokopedia", "parse_tokopedia_xlsx", "load_status_keys", "ParseResult"]
