"""Parser Shopee — config-map deterministic (Tier 1), in-memory, PII-safe (FR-29).

Prinsip: kolom dipetakan dari YAML config; nilai di-transform regex deterministic;
PII diderive (region) lalu teks mentahnya dibuang; gak ada raw file at rest.
"""
import csv
import io
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import yaml

from app.config import MAX_ROWS_PER_FILE

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


def _parse_money(raw) -> float | None:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    s = str(raw).strip()
    if s in ("", "-"):
        return None
    s = MONEY_RE.sub("", s)
    if not s:
        return None
    if "." in s and "," in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    elif "." in s:
        parts = s.split(".")
        if len(parts) == 2 and len(parts[1]) != 3:
            pass  # decimal e.g. 50000.0 or 12.50
        else:
            s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


# B-X2 (pentest 7 Okt): format ribuan EN ("150,000" / "1,234,567") tadi dibaca
# sebagai desimal ID → 150.0 / None. Locale TIDAK bisa ditebak per sel
# ("1,234" ambigu) — tapi KONSISTEN dalam satu file export. Fungsi ini mendeteksi
# locale dari SEMUA nilai uang di file sekaligus: ada pola X.Y.Z (≥2 titik) atau
# X,YYY.Z (koma desimal + titik ribuan) → EN; ada X,YYY dengan koma di posisi
# ribuan tanpa titik → ID/EN-ribuan-koma... amannya: deteksi negasi.
def detect_money_locale(values: list[str]) -> str:
    """Return 'en' atau 'id' dari sampel sel uang file (majoritas + anchor kuat)."""
    en_score = id_score = 0
    for v in values:
        if not v:
            continue
        s = MONEY_RE.sub("", str(v).strip())
        if not s:
            continue
        has_dot, has_comma = "." in s, "," in s
        if has_dot and has_comma:
            # X,YYY.ZZ = EN (ribuan koma, desimal titik); X.YYY,ZZ = ID
            if s.rfind(",") > s.rfind("."):
                id_score += 3
            else:
                en_score += 3
        elif has_comma:
            parts = s.split(",")
            if len(parts) > 2:
                # ≥2 koma → pasti ribuan EN ("1,234,567"), anchor kuat
                en_score += 3
            elif len(parts[-1]) == 3 and len(parts[0]) <= 3:
                # 1 koma "1,234" ambigu (ribuan EN vs desimal ID): beri EN skor
                # kecil (statistik lebih sering ribuan), ID skor besar (default
                # produk = ID; butuh bukti kuat baru menyimpang dari ID)
                en_score += 1
                id_score += 2
            else:
                # grup terakhir ≠ 3 digit ("12,5") → desimal koma = ID
                id_score += 3
        elif has_dot:
            parts = s.split(".")
            # ≥2 titik / grup ribuan rapi → ribuan ID ("1.234.567")
            if len(parts) > 2 or (len(parts) == 2 and len(parts[1]) == 3 and len(parts[0]) <= 3):
                id_score += 3
            else:
                en_score += 1
                id_score += 1
    return "en" if en_score > id_score else "id"


def _parse_money_locale(raw, locale: str = "id") -> float | None:
    """_parse_money dengan locale eksplisit (dari detect_money_locale)."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    s = MONEY_RE.sub("", str(raw).strip())
    if not s or s == "-":
        return None
    has_dot, has_comma = "." in s, "," in s
    if locale == "en":
        # ribuan koma/titik, desimal titik
        if has_dot and has_comma:
            s = s.replace(",", "")
        elif has_comma:
            parts = s.split(",")
            s = s.replace(",", "") if len(parts[-1]) == 3 else s.replace(",", ".")
        # titik-only: biarkan _parse_money semantik (ribuan ID vs desimal sudah benar utk EN dot-decimal)
    else:
        if has_dot and has_comma:
            s = s.replace(".", "").replace(",", ".")
        elif has_comma:
            s = s.replace(",", ".")
        elif has_dot:
            parts = s.split(".")
            if len(parts) == 2 and len(parts[1]) != 3:
                pass  # desimal "12.50"
            else:
                s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def _parse_int(raw) -> int | None:
    if raw is None:
        return None
    if isinstance(raw, int):
        return raw
    if isinstance(raw, float):
        return int(raw)
    s = str(raw).strip()
    if not s:
        return None
    try:
        return int(float(s.replace(",", ".")))
    except ValueError:
        digits = NUM_RE.sub("", s)
        return int(digits) if digits else None


def _parse_dt(raw: str, tz: str) -> datetime | None:
    """Waktu di file export = jam lokal toko (config `tz`, mis. Asia/Jakarta).

    Hasilnya WAJIB timezone-aware: string naive yang masuk ke kolom timestamptz
    dibaca Postgres sebagai UTC, sehingga 23:30 WIB tersimpan sebagai 06:30 WIB
    hari berikutnya (demand & rekap bergeser 7 jam / 1 hari).
    """
    s = str(raw or "").strip()
    if not s:
        return None
    try:
        zone = ZoneInfo(tz or "Asia/Jakarta")
    except (ZoneInfoNotFoundError, ValueError):
        zone = ZoneInfo("Asia/Jakarta")
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
    ):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=zone)
        except ValueError:
            continue
    return None


def parse_rows(
    rows: list[dict],
    config: dict,
    *,
    start_row: int = 2,
    row_flags: dict[int, set[str]] | None = None,
    headers: list[str] | None = None,
) -> ParseResult:
    """Map raw string rows → canonical rows + problems (dipakai CSV & XLSX).

    row_flags: {index_dalam_rows: {"numeric_order_id"|"numeric_sku"}} — guard
    Excel yang menyimpan ID/SKU sebagai angka (notasi ilmiah / leading-zero hilang).
    headers: daftar kolom eksplisit (wajib kalau rows bisa kosong, mis. file
    header-only — kolom wajib tetap divalidasi).
    """
    result = ParseResult()
    flags = row_flags or {}

    # --- mapping header → field via config (skip kolom kosong) ---
    headers = headers if headers is not None else (list(rows[0].keys()) if rows else [])
    colmap: dict[str, str] = {}
    for field_name, spec in config["columns"].items():
        pattern = re.compile(f"^{spec['match']}$", re.IGNORECASE)
        for header in headers:
            if not header or not header.strip():
                continue
            if pattern.match(header.strip()):
                colmap[field_name] = header
                break

    missing = [f for f, spec in config["columns"].items() if spec.get("required") and f not in colmap]
    if missing:
        raise ValueError(f"MISSING_COLUMNS: {missing}")

    result.skipped_columns = [
        h for h in headers
        if h and h.strip() and h not in colmap.values()
    ]

    status_map = config["columns"]["status"].get("map", {})
    tz = config["columns"]["sold_at"].get("tz", "Asia/Jakarta")

    # B-X2 (pentest 7 Okt): deteksi locale uang SEKALI per file (konsisten dalam
    # satu export), lalu semua parse uang pakai locale itu.
    money_fields = [colmap[f] for f in ("list_price", "paid_price", "seller_discount")
                    if f in colmap]
    money_sample = [str(r.get(h, "") or "") for r in rows for h in money_fields]
    money_locale = detect_money_locale(money_sample)

    for i, raw_row in enumerate(rows, start=start_row):
        result.rows_read += 1
        row_problems: list[str] = []

        def val(field_name: str) -> str:
            header = colmap.get(field_name)
            return str(raw_row.get(header, "") or "").strip() if header else ""

        # --- id_long guard: notasi ilmiah Excel ---
        order_id = val("order_id")
        flags_i = flags.get(i - start_row, set())  # flags di-key 0-based (index rows)
        if not order_id:
            row_problems.append("order_id kosong")
        elif SCIENTIFIC_ID.match(order_id):
            # PII rule: JANGAN echo isi sel ke reason (bisa berisi data pembeli
            # kalau kolom geser) — cukup sebut kolom & saran.
            row_problems.append("order_id dalam notasi ilmiah Excel — export ulang dengan format teks")
        elif "numeric_order_id" in flags_i:
            row_problems.append(
                "order_id tersimpan sebagai angka di Excel — berisiko notasi ilmiah / digit hilang; "
                "export ulang dengan format teks"
            )

        sku_raw = val("sku")
        if sku_raw and "numeric_sku" in flags_i:
            row_problems.append(
                "SKU tersimpan sebagai angka di Excel — leading-zero kemungkinan hilang; "
                "export ulang dengan format teks"
            )

        qty = _parse_int(val("qty"))
        if qty is None or qty <= 0:
            row_problems.append("qty tidak valid")

        # status map — normalisasi case: export asli pakai Title Case ("Selesai")
        status_raw = val("status")
        status = status_map.get(status_raw.strip().upper()) or status_map.get(status_raw.strip())
        if status_raw and status is None:
            # PII rule: tanpa echo nilai (kolom bisa geser → isi sel = data pembeli)
            row_problems.append("status tak dikenal")

        list_price = _parse_money_locale(val("list_price"), money_locale)
        # Export asli Shopee mengosongkan kolom harga utk order dibatalkan —
        # baris tsb gak masuk demand, jadi cukup di-skip (bukan problem).
        if list_price is None and status not in ("cancelled", "unpaid"):
            row_problems.append("harga awal tidak terbaca")

        # tanggal — kolom DB sold_at NOT NULL; kalau disediakan tapi invalid → problem (C1).
        # kalau tidak ada di file → default sekarang (WIB/UTC) agar tidak fail diam-diam.
        sold_at_raw = val("sold_at")
        if sold_at_raw:
            sold_at = _parse_dt(sold_at_raw, tz)
            if sold_at is None:
                row_problems.append("waktu pesanan tidak terbaca")
        else:
            sold_at = datetime.now(timezone.utc)

        # --- PII: derive region lalu JANGAN simpan teks mentah ---
        # B1 (pentest 7 Okt): region juga teks bebas dari file — sanitasi sama
        # seperti sku, supaya sel berawalan =,+,-,@ tidak pernah tersimpan
        # verbatim (pedang dua mata saat fitur export Excel dibangun).
        kab = _safe_cell(val("buyer_kabupaten")) or None
        prov = _safe_cell(val("buyer_province")) or None
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
            "sku": _safe_cell(val("sku")) or None,
            "status": status,
            "qty": qty,
            "list_price": list_price,
            "paid_price": _parse_money_locale(val("paid_price"), money_locale) or list_price,
            "seller_discount": _parse_money_locale(val("seller_discount"), money_locale) or 0,
            "sold_at": sold_at.isoformat() if sold_at else None,
            "buyer_kabupaten": kab,
            "buyer_province": prov,
            # Tidak ada: buyer_name, phone, address (FR-29)
        })

    return result


def _safe_cell(s: str | None) -> str | None:
    """Neutralize formula injection (=,+,-,@ di awal sel → prefix apostrophe).

    Excel/LibreOffice mengeksekusi sel seperti itu saat seller export/opens
    data kita. Disimpan verbatim = pedang dua mata begitu fitur export ada.
    """
    if s and s[:1] in ("=", "+", "-", "@"):
        return "'" + s
    return s


def load_status_keys(config: dict) -> list[str]:
    """Kunci status map (untuk validasi alignment baris ragged)."""
    return list(config["columns"]["status"].get("map", {}).keys())


def parse_shopee(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export Shopee CSV → rows canonical + problems. In-memory, PII dibuang."""
    # decode dulu untuk ambil fieldnames (header) — DictReader perlu untuk rows
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
    status_upper = {k.strip().upper() for k in load_status_keys(config)}
    rows: list[dict] = []
    result_problems: list[dict] = []  # B2: baris ragged tak terselamatkan heuristic
    for row_idx, cells in enumerate(all_rows[1:], start=2):
        problem_row_no = row_idx  # nomor baris fisik di file (1-based, header = 1)
        if not any(c.strip() for c in cells):
            continue
        if len(cells) != len(fieldnames):
            # Export asli Shopee: baris cancelled punya sel kosong ekstra di
            # tengah (kolom SKU/Resi tidak konsisten) — bukan shift murni.
            # Skor tiap kemungkinan buang-1-sel-kosong (posisi i) + shift kiri/
            # kanan: status dikenal, harga & qty numerik. Pilih skor tertinggi.
            import re as _re

            def _score(v: list[str]) -> int:
                if len(v) != len(fieldnames):
                    return -1
                d = dict(zip(fieldnames, (c.strip() for c in v)))
                s = 0
                if d.get("Status Pesanan", "").strip().upper() in status_upper:
                    s += 4
                for col, pat in (("Harga Awal", r"^\d+([.,]\d+)?$"),
                                 ("Harga Setelah Diskon", r"^\d+([.,]\d+)?$"),
                                 ("Jumlah", r"^\d+$")):
                    if _re.match(pat, d.get(col, "")):
                        s += 2
                if d.get("No. Pesanan", "").strip():
                    s += 1
                return s

            # M5 guard: kalau jumlah sel liar (>> header), skip heuristic —
            # export asli cuma offset 1-2 sel; kasus liar = file jahat.
            if len(cells) <= 2 * len(fieldnames):
                variants = [cells] + [
                    cells[:i] + cells[i + 1:]                      # buang 1 sel kosong
                    for i, c in enumerate(cells) if c.strip() == ""
                ] + [cells[1:], cells[:-1]]                        # shift kiri/kanan
                best = max(variants, key=_score)
                # B2 (pentest 7 Okt): heuristic hanya boleh menyelamatkan baris
                # yang meyakinkan (status dikenal ATAU harga numerik = skor >= 4).
                # Selain itu → problem-row, bukan dipaksa masuk dengan kolom
                # tergeser diam-diam (SKU bisa terisi potongan payload).
                if _score(best) >= 4:
                    cells = best
                else:
                    result_problems.append({
                        "row": problem_row_no,
                        "column": "-",
                        "reason": ("jumlah kolom tidak cocok dengan header — "
                                   "file kemungkinan bukan export asli marketplace; "
                                   "export ulang tanpa mengubah struktur kolom"),
                    })
                    continue
            else:
                result_problems.append({
                    "row": problem_row_no,
                    "column": "-",
                    "reason": ("struktur baris menyimpang terlalu jauh dari header — "
                               "file kemungkinan bukan export asli marketplace"),
                })
                continue
        rows.append(dict(zip(fieldnames, (c.strip() for c in cells))))
    result = parse_rows(rows, config, start_row=2, headers=fieldnames)
    result.problems = result_problems + result.problems
    return result


def parse_shopee_xlsx(raw_bytes: bytes, config: dict) -> ParseResult:
    """Parse export Shopee XLSX → rows canonical + problems.

    Guard Excel (FR-7): cell ID/SKU yang tersimpan sebagai angka → problem-row
    (rawan notasi ilmiah 1.23E+15 / leading-zero hilang).
    """
    import openpyxl

    result = ParseResult()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), read_only=True, data_only=True)
    except Exception as e:
        result.problems.append({"row": 0, "column": "-", "reason": "file XLSX rusak/tidak terbaca"})
        return result

    # Multi-sheet aware (format B): workbook bisa berisi sheet README/Stock/
    # Settlement — hanya sheet yang kolomnya match config order yang diparse.
    order_col = re.compile(f"^{config['columns']['order_id']['match']}$", re.IGNORECASE)
    candidate_sheets = []
    for ws in wb.worksheets:
        it = ws.iter_rows(max_row=1, values_only=True)
        try:
            first = next(it, None)
        except Exception:
            first = None
        headers0 = [str(c).strip() if c is not None else "" for c in (first or [])]
        if any(order_col.match(h) for h in headers0):
            candidate_sheets.append(ws)
    if not candidate_sheets:
        candidate_sheets = [wb.active] if wb.active is not None else []

    if not candidate_sheets:
        wb.close()
        result.problems.append({"row": 0, "column": "-", "reason": "file XLSX tidak memiliki sheet"})
        return result

    last_val_err: ValueError | None = None
    for ws in candidate_sheets:
        raw_rows: list[dict] = []
        row_flags: dict[int, set[str]] = {}
        headers: list[str] = []
        for i, row in enumerate(ws.iter_rows(values_only=True)):
            if i == 0:
                headers = [str(c).strip() if c is not None else "" for c in row]
                continue
            if all(c is None or (isinstance(c, str) and c.strip() == "") for c in row):
                continue  # baris kosong — bukan data, bukan problem
            # DoS guard: stop baca sheet di row cap — file jahat bisa 500k baris
            # dari zip 1MB; tanpa ini CPU & memori meledak sebelum cap dicek.
            if len(raw_rows) > MAX_ROWS_PER_FILE:
                result.problems.append({"row": i, "column": "-", "reason": "file melebihi batas baris (20.000)"})
                break
            cells = {headers[j]: c for j, c in enumerate(row) if j < len(headers)}
            flags: set[str] = set()
            for col in ("Nomor Pesanan", "Nomor SKU", "No. Pesanan"):
                v = cells.get(col)
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    flags.add("numeric_order_id" if "esanan" in col else "numeric_sku")
            if flags:
                row_flags[len(raw_rows)] = flags
            raw_rows.append({k: ("" if v is None else str(v).strip()) for k, v in cells.items()})
        try:
            parsed = parse_rows(raw_rows, config, start_row=2, row_flags=row_flags,
                                headers=headers)
        except ValueError as err:
            last_val_err = err
            continue  # sheet bukan format order — skip
        result.rows.extend(parsed.rows)
        result.problems.extend(parsed.problems)
        result.rows_read += parsed.rows_read
        result.skipped_columns.extend(parsed.skipped_columns)
    wb.close()
    if not result.rows and last_val_err is not None:
        raise last_val_err
    return result
