"""Parser Shopee — config-map deterministic (Tier 1), in-memory, PII-safe (FR-29).

Prinsip: kolom dipetakan dari YAML config; nilai di-transform regex deterministic;
PII diderive (region) lalu teks mentahnya dibuang; gak ada raw file at rest.
"""
import csv
import io
import re
from dataclasses import dataclass, field
from datetime import datetime

import yaml

MONEY_RE = re.compile(r"[^\d.,-]")
NUM_RE = re.compile(r"[^\d]")
SCIENTIFIC_ID = re.compile(r"^\d\.?\d*[eE]\+\d+$")


@dataclass
class ParseResult:
    rows: list[dict] = field(default_factory=list)
    problems: list[dict] = field(default_factory=list)   # {row, column, reason}
    rows_read: int = 0
    skipped_columns: list[str] = field(default_factory=list)


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def detect_delimiter(sample: str) -> str:
    for d in (",", ";", "\t"):
        if sample.count(d) >= sample.count("\n"):
            return d
    return ","


def _parse_money(raw: str) -> float | None:
    if raw is None or str(raw).strip() in ("", "-"):
        return None
    s = MONEY_RE.sub("", str(raw)).replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _parse_int(raw: str) -> int | None:
    digits = NUM_RE.sub("", str(raw or ""))
    return int(digits) if digits else None


def _parse_dt(raw: str, tz: str) -> datetime | None:
    s = str(raw or "").strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M", "%d-%m-%Y %H:%M",
                "%Y-%m-%d %H:%M:%S", "%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def parse_shopee(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export Shopee (CSV) → rows canonical + problems. In-memory, PII dibuang."""
    result = ParseResult()

    # deteksi encoding
    text = None
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            text = raw_bytes.decode(enc)
            break
        except (UnicodeDecodeError, LookupError):
            continue
    if text is None:
        result.problems.append({"row": 0, "column": "-", "reason": "encoding tidak dikenali"})
        return result

    # XLSX gak lewat sini (ditangani openpyxl di import_pipeline); CSV dulu untuk B1.
    delimiter = detect_delimiter(text[:2000])
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)

    # --- mapping header → field via config (skip kolom kosong) ---
    colmap: dict[str, str] = {}
    for field_name, spec in config["columns"].items():
        pattern = re.compile(f"^{spec['match']}$", re.IGNORECASE)
        for header in reader.fieldnames or []:
            if not header.strip():
                continue
            if pattern.match(header.strip()):
                colmap[field_name] = header
                break

    missing = [f for f, spec in config["columns"].items() if spec.get("required") and f not in colmap]
    if missing:
        raise ValueError(f"MISSING_COLUMNS: {missing}")

    result.skipped_columns = [
        h for h in (reader.fieldnames or [])
        if h.strip() and h not in colmap.values()
    ]

    status_map = config["columns"]["status"].get("map", {})
    tz = config["columns"]["sold_at"].get("tz", "Asia/Jakarta")

    for i, raw_row in enumerate(reader, start=2):  # baris Excel: header = 1
        result.rows_read += 1
        row_problems: list[str] = []

        def val(field_name: str) -> str:
            header = colmap.get(field_name)
            return str(raw_row.get(header, "") or "").strip() if header else ""

        # --- id_long guard: notasi ilmiah Excel ---
        order_id = val("order_id")
        if not order_id:
            row_problems.append("order_id kosong")
        elif SCIENTIFIC_ID.match(order_id):
            row_problems.append(f"order_id dalam notasi ilmiah Excel ({order_id}) — export ulang dengan format teks")

        qty = _parse_int(val("qty"))
        if qty is None or qty <= 0:
            row_problems.append(f"qty tidak valid ({val('qty')!r})")

        list_price = _parse_money(val("list_price"))
        if list_price is None:
            row_problems.append("harga awal tidak terbaca")

        # status map
        status_raw = val("status")
        status = status_map.get(status_raw.strip())
        if status_raw and status is None:
            row_problems.append(f"status tak dikenal: {status_raw!r}")

        # tanggal
        sold_at = _parse_dt(val("sold_at"), tz)

        # --- PII: derive region lalu JANGAN simpan teks mentah ---
        kab = val("buyer_kabupaten") or None
        prov = val("buyer_province") or None
        # nama/telepon/alamat: TIDAK dibaca sama sekali — allowlist by design.

        if row_problems:
            for p in row_problems:
                result.problems.append({"row": i, "column": "-", "reason": p})
            continue

        result.rows.append({
            "source_system": config["source_system"],
            "sales_channel": config["channel"],
            "order_id": order_id,
            "line_key": f"{order_id}:{(val('sku') or val('product_name'))[:80]}",
            "status": status,
            "qty": qty,
            "list_price": list_price,
            "paid_price": _parse_money(val("paid_price")) or list_price,
            "seller_discount": _parse_money(val("seller_discount")) or 0,
            "sold_at": sold_at.isoformat() if sold_at else None,
            "buyer_kabupaten": kab,
            "buyer_province": prov,
            # Tidak ada: buyer_name, phone, address (FR-29)
        })

    return result
