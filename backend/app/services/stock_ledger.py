"""Stock ledger — deterministic on_hand per produk (PRD A1, FR-11, FR-43).

Rumus (aturan mengikat #4 — hanya dari DB/formula):
  on_hand = opening_qty + receipts + adjustments − eligible_sales
  - eligible_sales = order_lines status completed|in_progress dengan
    sold_at >= opening_date (A9: cancelled/returned/unpaid TIDAK decrement;
    sale yang di-re-import jadi returned/cancelled otomatis restore stok).
  - receipts (+), writeoffs (−), adjustments (±) dari stock_movements.
  - on_hand < 0 → flag mismatch (FR-43 NEGATIVE), TIDAK pernah di-clamp.
"""
from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from datetime import date, datetime

from fastapi import HTTPException

# Status order yang mengurangi stok (A9 / FR-27)
ELIGIBLE_STATUS = ("completed", "in_progress")
MOVEMENT_TYPES = ("receipt", "adjustment", "writeoff")


def _today() -> date:
    return datetime.now().date()


def _sold_at_to_date(sold_at) -> date | None:
    if sold_at is None:
        return None
    if isinstance(sold_at, datetime):
        return sold_at.date()
    if isinstance(sold_at, date):
        return sold_at
    try:
        return datetime.fromisoformat(str(sold_at)).date()
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Errors (router translate ke HTTP)
# ---------------------------------------------------------------------------

def _safe_cell(s: str | None) -> str | None:
    """Neutralize formula injection (=,+,-,@ di awal sel) — lihat parsers/shopee.py."""
    if s and s[:1] in ("=", "+", "-", "@"):
        return "'" + s
    return s


class StockError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------

class StockStore(ABC):
    """Kontrak akses data stok. Semua method WAJIB terima seller_id (ADR-1)."""

    # products
    @abstractmethod
    def find_product_by_sku(self, seller_id: str, sku: str) -> dict | None: ...

    @abstractmethod
    def create_product(self, seller_id: str, product: dict) -> dict: ...

    @abstractmethod
    def update_product(self, seller_id: str, product_id: str, values: dict) -> None: ...

    @abstractmethod
    def get_product(self, seller_id: str, product_id: str) -> dict | None: ...

    @abstractmethod
    def list_products(self, seller_id: str) -> list[dict]: ...

    # stock_items
    @abstractmethod
    def get_stock_item(self, seller_id: str, product_id: str) -> dict | None: ...

    @abstractmethod
    def upsert_stock_item(self, seller_id: str, product_id: str, values: dict) -> None: ...

    # movements
    @abstractmethod
    def insert_movement(self, seller_id: str, movement: dict) -> dict: ...

    @abstractmethod
    def list_movements(self, seller_id: str, product_id: str) -> list[dict]: ...

    # sales (read view order_lines)
    @abstractmethod
    def fetch_eligible_sales(self, seller_id: str) -> list[dict]:
        """[{sku, qty, sold_at}] — hanya status completed|in_progress."""


class StockMemoryStore(StockStore):
    """In-memory (dev/test). Sales dibaca dari ImportsMemoryStore (satu sumber data)."""

    def __init__(self, sales_source=None):
        self._products: dict[str, dict[str, dict]] = {}   # seller_id -> product_id -> product
        self._items: dict[str, dict[str, dict]] = {}      # seller_id -> product_id -> stock_item
        self._movements: dict[str, list[dict]] = {}       # seller_id -> [movement]
        self.sales_source = sales_source                  # ImportsMemoryStore

    # -- products ------------------------------------------------------
    def find_product_by_sku(self, seller_id: str, sku: str) -> dict | None:
        for p in self._products.get(seller_id, {}).values():
            if p.get("sku") and p["sku"] == sku:
                return dict(p)
        return None

    def create_product(self, seller_id: str, product: dict) -> dict:
        pid = product.get("id") or str(uuid.uuid4())
        row = {**product, "id": pid, "seller_id": seller_id}
        self._products.setdefault(seller_id, {})[pid] = row
        return dict(row)

    def update_product(self, seller_id: str, product_id: str, values: dict) -> None:
        p = self._products.get(seller_id, {}).get(product_id)
        if p is not None:
            p.update(values)

    def get_product(self, seller_id: str, product_id: str) -> dict | None:
        p = self._products.get(seller_id, {}).get(product_id)
        return dict(p) if p else None

    def list_products(self, seller_id: str) -> list[dict]:
        return [dict(p) for p in self._products.get(seller_id, {}).values()]

    # -- stock_items ---------------------------------------------------
    def get_stock_item(self, seller_id: str, product_id: str) -> dict | None:
        s = self._items.get(seller_id, {}).get(product_id)
        return dict(s) if s else None

    def upsert_stock_item(self, seller_id: str, product_id: str, values: dict) -> None:
        self._items.setdefault(seller_id, {})[product_id] = {
            **self._items.get(seller_id, {}).get(product_id, {}),
            **values,
            "product_id": product_id,
        }

    # -- movements -----------------------------------------------------
    def insert_movement(self, seller_id: str, movement: dict) -> dict:
        row = {**movement, "id": movement.get("id") or str(uuid.uuid4())}
        self._movements.setdefault(seller_id, []).append(row)
        return dict(row)

    def list_movements(self, seller_id: str, product_id: str) -> list[dict]:
        return [
            dict(m) for m in self._movements.get(seller_id, [])
            if m["product_id"] == product_id
        ]

    # -- sales ---------------------------------------------------------
    def fetch_eligible_sales(self, seller_id: str) -> list[dict]:
        if self.sales_source is None:
            return []
        out = []
        for key, line in self.sales_source._lines.get(seller_id, {}).items():
            if line.get("status") not in ELIGIBLE_STATUS:
                continue
            out.append({
                "sku": line.get("sku"),
                "qty": line.get("qty", 0),
                "sold_at": line.get("sold_at"),
            })
        return out


class StockSupabaseStore(StockStore):
    """Supabase (prod) — client per-user, RLS aktif."""

    def __init__(self, client):
        self.client = client

    def find_product_by_sku(self, seller_id: str, sku: str) -> dict | None:
        # SKU disimpan di product_links.sku_raw (per kanal); ambil produk pertama
        rows = (
            self.client.table("product_links")
            .select("product_id, products!inner(id, canonical_name)")
            .eq("seller_id", seller_id)
            .eq("sku_raw", sku)
            .limit(1)
            .execute()
            .data
        )
        if not rows:
            return None
        return {"id": rows[0]["product_id"],
                "name": rows[0]["products"]["canonical_name"], "sku": sku}

    def create_product(self, seller_id: str, product: dict) -> dict:
        row = {"canonical_name": product["name"], "match_state": "unmatched"}
        created = self.client.table("products").insert(row).execute().data[0]
        if product.get("sku"):
            self.client.table("product_links").insert({
                "seller_id": seller_id,
                "product_id": created["id"],
                "channel": "stock_template",
                "channel_product_key": f"stock:{product['sku']}",
                "sku_raw": product["sku"],
            }).execute()
        return {"id": created["id"], "name": created["canonical_name"],
                "sku": product.get("sku")}

    def update_product(self, seller_id: str, product_id: str, values: dict) -> None:
        payload = {}
        if "name" in values:
            payload["canonical_name"] = values["name"]
        if payload:
            self.client.table("products").update(payload).eq(
                "seller_id", seller_id).eq("id", product_id).execute()

    def get_product(self, seller_id: str, product_id: str) -> dict | None:
        rows = (
            self.client.table("products")
            .select("id, canonical_name")
            .eq("seller_id", seller_id)
            .eq("id", product_id)
            .limit(1)
            .execute()
            .data
        )
        if not rows:
            return None
        return {"id": rows[0]["id"], "name": rows[0]["canonical_name"]}

    def list_products(self, seller_id: str) -> list[dict]:
        rows = (
            self.client.table("products")
            .select("id, canonical_name, product_links(sku_raw)")
            .eq("seller_id", seller_id)
            .execute()
            .data
            or []
        )
        out = []
        for r in rows:
            links = r.get("product_links") or []
            out.append({"id": r["id"], "name": r["canonical_name"],
                        "sku": links[0]["sku_raw"] if links else None})
        return out

    def get_stock_item(self, seller_id: str, product_id: str) -> dict | None:
        rows = (
            self.client.table("stock_items")
            .select("*")
            .eq("product_id", product_id)
            .limit(1)
            .execute()
            .data
        )
        return rows[0] if rows else None

    def upsert_stock_item(self, seller_id: str, product_id: str, values: dict) -> None:
        payload = {**values, "product_id": product_id}
        self.client.table("stock_items").upsert(
            payload, on_conflict="product_id"
        ).execute()

    def insert_movement(self, seller_id: str, movement: dict) -> dict:
        return self.client.table("stock_movements").insert(movement).execute().data[0]

    def list_movements(self, seller_id: str, product_id: str) -> list[dict]:
        return (
            self.client.table("stock_movements")
            .select("*")
            .eq("product_id", product_id)
            .order("at", desc=False)
            .execute()
            .data
            or []
        )

    def fetch_eligible_sales(self, seller_id: str) -> list[dict]:
        rows = (
            self.client.table("order_lines")
            .select("sku, qty, sold_at")
            .eq("seller_id", seller_id)
            .in_("status", list(ELIGIBLE_STATUS))
            .execute()
            .data
            or []
        )
        return rows


# ---------------------------------------------------------------------------
# Core: on_hand computation
# ---------------------------------------------------------------------------

def compute_stock(store: StockStore, seller_id: str, product: dict) -> dict:
    """Hitung on_hand 1 produk dari ledger. Negatif → mismatch=True (jangan clamp)."""
    item = store.get_stock_item(seller_id, product["id"])
    if item is None:
        # belum set stok → ledger belum aktif utk produk ini
        return {
            "product_id": product["id"], "name": product.get("name"),
            "sku": product.get("sku"),
            "stock_set_up": False, "on_hand": None,
            "opening_qty": None, "opening_date": None,
            "receipts": 0, "adjustments": 0, "eligible_sales": 0,
            "mismatch": False, "on_order": 0,
        }

    opening_qty = int(item.get("opening_qty", 0))
    opening_date = item.get("opening_date")
    if isinstance(opening_date, str):
        opening_date = date.fromisoformat(opening_date)

    receipts = adjustments = 0
    for m in store.list_movements(seller_id, product["id"]):
        qty = int(m["qty"])
        if m["type"] == "receipt":
            receipts += qty
        elif m["type"] == "writeoff":
            adjustments -= qty
        else:  # adjustment (signed)
            adjustments += qty

    sales = 0
    for s in store.fetch_eligible_sales(seller_id):
        if (s.get("sku") or "") != (product.get("sku") or ""):
            continue  # bukan produk ini
        d = _sold_at_to_date(s.get("sold_at"))
        if d is None or opening_date is None or d < opening_date:
            continue  # sebelum opening_date → tidak mengurangi (FR-11)
        sales += int(s.get("qty", 0))

    on_hand = opening_qty + receipts + adjustments - sales
    return {
        "product_id": product["id"], "name": product.get("name"),
        "sku": product.get("sku"),
        "stock_set_up": True,
        "on_hand": on_hand,
        "opening_qty": opening_qty,
        "opening_date": opening_date.isoformat() if opening_date else None,
        "receipts": receipts,
        "adjustments": adjustments,
        "eligible_sales": sales,
        "mismatch": on_hand < 0,  # FR-43: tampil, jangan clamp
        "on_order": 0,  # P1 purchase-order-lite
    }


def list_stock(store: StockStore, seller_id: str) -> list[dict]:
    products = store.list_products(seller_id)
    return [compute_stock(store, seller_id, p) for p in products]


def get_stock_detail(store: StockStore, seller_id: str, product_id: str) -> dict | None:
    product = store.get_product(seller_id, product_id)
    if product is None:
        return None
    stock = compute_stock(store, seller_id, product)
    stock["movements"] = [
        {
            "id": m["id"], "type": m["type"], "qty": m["qty"],
            "at": m.get("at"), "note": m.get("note"),
        }
        for m in store.list_movements(seller_id, product_id)
    ]
    return stock


# ---------------------------------------------------------------------------
# Mutations
# ---------------------------------------------------------------------------

def record_movement(store: StockStore, seller_id: str, product_id: str,
                    mtype: str, qty: int, note: str | None = None,
                    by_user: str | None = None) -> dict:
    """POST /v1/stock/movements — receipt(+), writeoff(−), adjustment(±)."""
    product = store.get_product(seller_id, product_id)
    if product is None:
        raise StockError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.")
    if mtype not in MOVEMENT_TYPES:
        raise StockError("INVALID_TYPE", f"Tipe mutasi '{mtype}' tidak valid. Gunakan: {', '.join(MOVEMENT_TYPES)}.")
    if qty == 0 or (mtype in ("receipt", "writeoff") and qty <= 0):
        raise StockError("INVALID_QTY", "Qty mutasi harus tidak nol (receipt/writeoff positif, adjustment bisa negatif).")

    movement = {
        "product_id": product_id,
        "type": mtype,
        "qty": qty,
        "at": datetime.now().isoformat(),
        "note": note,
        "by_user": by_user,
    }
    store.insert_movement(seller_id, movement)
    stock = compute_stock(store, seller_id, product)
    # NOTE: invalidate cache Redis di sini saat deploy B6 (saat ini dev tanpa cache)
    return stock


def set_opening(store: StockStore, seller_id: str, *,
                name: str, sku: str, qty: int,
                cost_price: float | None = None,
                lead_time_days: int | None = None,
                opening_date: date | str | None = None) -> dict:
    """POST /v1/stock/opening (single) — create-or-update produk + saldo awal (FR-26)."""
    if not name or not sku:
        raise StockError("MISSING_FIELDS", "Nama dan SKU wajib diisi.")
    if qty < 0:
        raise StockError("INVALID_QTY", "Saldo awal tidak boleh negatif.")

    if isinstance(opening_date, str):
        try:
            opening_date = date.fromisoformat(opening_date)
        except ValueError:
            raise StockError("INVALID_DATE", "opening_date harus format YYYY-MM-DD.")

    product = store.find_product_by_sku(seller_id, sku)
    created = False
    if product is None:
        product = store.create_product(seller_id, {"name": name, "sku": sku})
        created = True
    else:
        store.update_product(seller_id, product["id"], {"name": name})

    store.upsert_stock_item(seller_id, product["id"], {
        "opening_qty": qty,
        "opening_date": (opening_date or _today()).isoformat(),
        "cost_price": cost_price,
        "lead_time_days": lead_time_days,
    })
    stock = compute_stock(store, seller_id, product)
    return {"created": created, **stock}


def import_template(store: StockStore, seller_id: str, raw: bytes, ext: str) -> dict:
    """POST /v1/stock/opening (template CSV/XLSX) — FR-26/A10.

    Kolom: Nama Produk, SKU, Qty/Stok, Harga Modal (opsional), Lead Time (opsional).
    Produk yang belum pernah laku IKUT terbentuk (A10).
    """
    rows, problems = _parse_template(raw, ext)

    created = updated = 0
    for i, row in enumerate(rows, start=2):
        name = _safe_cell((row.get("name") or "").strip())
        sku = _safe_cell((row.get("sku") or "").strip())
        qty_raw = (row.get("qty") or "").strip()
        if not name or not sku or not qty_raw.isdigit():
            problems.append({"row": i, "reason": "nama/sku/qty wajib & valid"})
            continue
        cost = _to_float(row.get("cost"))
        lead = _to_int(row.get("lead_time"))
        result = set_opening(
            store, seller_id,
            name=name, sku=sku, qty=int(qty_raw),
            cost_price=cost, lead_time_days=lead,
        )
        if result["created"]:
            created += 1
        else:
            updated += 1

    return {"created": created, "updated": updated, "skipped": problems}


# ---------------------------------------------------------------------------
# Template parsing (CSV/XLSX, in-memory — PII-safe by design, kolomnya bukan PII)
# ---------------------------------------------------------------------------

_NAME_MATCH = r"Nama Produk|Nama|Name"
_SKU_MATCH = r"SKU|Nomor SKU"
_QTY_MATCH = r"Qty|Jumlah|Stok|Stock|Saldo"
_COST_MATCH = r"Harga Modal|Cost Price|Cost|Modal"
_LEAD_MATCH = r"Lead.?Time"


def _match_col(headers: list[str], pattern: str) -> str | None:
    import re
    p = re.compile(f"^{pattern}$", re.IGNORECASE)
    for h in headers:
        if h and p.match(h.strip()):
            return h
    return None


def _to_float(v) -> float | None:
    s = str(v or "").strip().replace(".", "").replace(",", ".")
    try:
        return float(s) if s else None
    except ValueError:
        return None


def _to_int(v) -> int | None:
    s = str(v or "").strip()
    digits = "".join(ch for ch in s if ch.isdigit())
    return int(digits) if digits else None


def _parse_template(raw: bytes, ext: str) -> tuple[list[dict], list[dict]]:
    """Template → list dict {name, sku, qty, cost, lead_time} + problems."""
    if ext == ".csv":
        import csv
        import io
        text = None
        for enc in ("utf-8-sig", "utf-8", "cp1252"):
            try:
                text = raw.decode(enc)
                break
            except (UnicodeDecodeError, LookupError):
                continue
        if text is None:
            raise StockError("ENCODING_ERROR", "Tidak bisa membaca encoding file. Gunakan UTF-8.")
        reader = csv.DictReader(io.StringIO(text))
        headers = list(reader.fieldnames or [])
        raw_rows = list(reader)
    elif ext == ".xlsx":
        import openpyxl
        import io
        try:
            wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        except Exception as e:
            raise StockError("XLSX_CORRUPT", f"File XLSX rusak/tidak terbaca: {e}")
        ws = wb.active
        if ws is None:
            raise StockError("EMPTY_FILE", "File XLSX tidak memiliki sheet.")
        raw_rows = []
        headers = []
        for i, row in enumerate(ws.iter_rows(values_only=True)):
            if i == 0:
                headers = [str(c).strip() if c is not None else "" for c in row]
                continue
            if all(c is None or (isinstance(c, str) and c.strip() == "") for c in row):
                continue
            raw_rows.append({headers[j]: c for j, c in enumerate(row) if j < len(headers)})
        wb.close()
    else:
        raise StockError("INVALID_EXTENSION", f"Ekstensi '{ext}' tidak didukung.")

    col = {
        "name": _match_col(headers, _NAME_MATCH),
        "sku": _match_col(headers, _SKU_MATCH),
        "qty": _match_col(headers, _QTY_MATCH),
        "cost": _match_col(headers, _COST_MATCH),
        "lead_time": _match_col(headers, _LEAD_MATCH),
    }
    if col["name"] is None or col["sku"] is None or col["qty"] is None:
        raise StockError(
            "MISSING_COLUMNS",
            "Template wajib punya kolom: Nama Produk, SKU, Qty/Stok.",
        )

    rows = [
        {
            "name": _cell(r, col["name"]),
            "sku": _cell(r, col["sku"]),
            "qty": _cell(r, col["qty"]),
            "cost": _cell(r, col["cost"]),
            "lead_time": _cell(r, col["lead_time"]),
        }
        for r in raw_rows
    ]
    return rows, []


def _cell(row: dict, header: str | None) -> str:
    if header is None:
        return ""
    v = row.get(header)
    return "" if v is None else str(v).strip()


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_stock_store(imports_memory_store=None):
    """Supabase kalau configured, else memory (sales dari imports memory store)."""
    from app.deps.settings import get_settings

    s = get_settings()
    if s.supabase_url:
        from supabase import create_client

        if not s.supabase_service_key:
            raise RuntimeError("SUPABASE_URL terisi tapi SUPABASE_SERVICE_KEY kosong — config rusak")
        client = create_client(s.supabase_url, s.supabase_service_key)
        return StockSupabaseStore(client)
    return StockMemoryStore(sales_source=imports_memory_store)
