"""File content validation — row counting, encoding detection, basic sanity checks.

Parses in-memory only; raw file never touches disk (ADR-2).
"""

from __future__ import annotations

import io
import csv


def _count_csv_rows(raw: bytes) -> dict:
    """Count data rows in a CSV (excluding header). Auto-detect encoding & delimiter."""

    # Try encodings in order
    text = None
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            text = raw.decode(enc)
            break
        except (UnicodeDecodeError, ValueError):
            continue

    if text is None:
        return {"error": {"code": "ENCODING_ERROR", "message": "Tidak bisa membaca encoding file. Gunakan UTF-8."}}

    # Auto-detect delimiter
    sniffer = csv.Sniffer()
    sample = text[:8192]
    try:
        dialect = sniffer.sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel  # fallback to comma

    reader = csv.reader(io.StringIO(text), dialect)

    # Skip header
    try:
        header = next(reader)
    except StopIteration:
        return {"error": {"code": "EMPTY_FILE", "message": "File kosong — tidak ada baris data."}}

    if not any(h.strip() for h in header):
        return {"error": {"code": "EMPTY_FILE", "message": "File kosong — header tidak ditemukan."}}

    row_count = 0
    for _ in reader:
        row_count += 1

    return {"row_count": row_count, "header": [h.strip() for h in header]}


def _count_xlsx_rows(raw: bytes) -> dict:
    """Count data rows in first sheet of an XLSX (read_only mode, in-memory)."""
    try:
        import openpyxl
    except ImportError:
        return {"error": {"code": "XLSX_UNSUPPORTED", "message": "Server tidak bisa membaca XLSX (openpyxl missing)."}}

    try:
        wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
    except Exception as e:
        return {"error": {"code": "XLSX_CORRUPT", "message": f"File XLSX rusak atau tidak bisa dibaca: {e}"}}

    ws = wb.active
    if ws is None:
        wb.close()
        return {"error": {"code": "EMPTY_FILE", "message": "File XLSX tidak memiliki sheet."}}

    row_count = 0
    header = None
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            header = [str(c).strip() if c is not None else "" for c in row]
            if not any(header):
                wb.close()
                return {"error": {"code": "EMPTY_FILE", "message": "File XLSX kosong — header tidak ditemukan."}}
            continue
        # Skip fully empty rows
        if all(c is None or (isinstance(c, str) and c.strip() == "") for c in row):
            continue
        row_count += 1

    wb.close()

    if header is None:
        return {"error": {"code": "EMPTY_FILE", "message": "File XLSX kosong."}}

    return {"row_count": row_count, "header": header}


def validate_uploaded_file(raw: bytes, ext: str, channel: str) -> dict:
    """Validate file contents: count rows, detect problems.

    Returns dict with 'row_count' on success or 'error' on failure.
    """
    if ext == ".csv":
        return _count_csv_rows(raw)
    elif ext == ".xlsx":
        return _count_xlsx_rows(raw)
    else:
        return {"error": {"code": "INVALID_EXTENSION", "message": f"Ekstensi '{ext}' tidak didukung."}}
