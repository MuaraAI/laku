"""Stock router — ledger gudang (B4): list, detail, movements, opening (FR-11/FR-26)."""

from __future__ import annotations

from pathlib import PurePosixPath

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES
from app.deps.auth import Identity, get_identity, require_owner
from app.services import stock_ledger
from app.services.stock_ledger import StockError, StockMemoryStore

router = APIRouter(prefix="/v1/stock", tags=["stock"])

# Store singleton in-memory (dev/test); prod pakai Supabase via factory.
_memory_store = None


def _get_store():
    global _memory_store
    # Lazy wiring: kalau B2 (imports pipeline) sudah merge, sales dibaca dari
    # order_lines memory store yang sama; kalau belum, ledger jalan tanpa sales.
    try:
        from app.routers.imports import _memory_store as _imports_memory
    except ImportError:
        _imports_memory = None

    from app.deps.settings import get_settings
    if get_settings().supabase_url:
        return stock_ledger.get_stock_store(imports_memory_store=_imports_memory)

    if _memory_store is None:
        _memory_store = StockMemoryStore(sales_source=_imports_memory)
    return _memory_store


def _err(e: StockError) -> HTTPException:
    code_status = {
        "PRODUCT_NOT_FOUND": 404,
        "INVALID_TYPE": 422,
        "INVALID_QTY": 422,
        "MISSING_FIELDS": 422,
        "MISSING_COLUMNS": 422,
        "ENCODING_ERROR": 422,
        "XLSX_CORRUPT": 422,
        "EMPTY_FILE": 422,
        "INVALID_EXTENSION": 422,
    }.get(e.code, 422)
    return HTTPException(status_code=code_status, detail={
        "error": {"code": e.code, "message": e.message}
    })


class OpeningSingle(BaseModel):
    name: str
    sku: str
    qty: int
    cost_price: float | None = None
    lead_time_days: int | None = None
    opening_date: str | None = None  # ISO date, default hari ini


class MovementIn(BaseModel):
    product_id: str
    type: str  # receipt | adjustment | writeoff
    qty: int
    note: str | None = None


@router.get("")
async def list_stock(identity: Identity = Depends(get_identity)):
    """Stok semua produk: on_hand, opening, mismatch indicator (api.md MVP)."""
    seller_id = require_owner(identity).seller_id or ""
    store = _get_store()
    items = stock_ledger.list_stock(store, seller_id)
    return {
        "items": items,
        "mismatch_count": sum(1 for i in items if i.get("mismatch")),
        "not_set_up_count": sum(1 for i in items if not i.get("stock_set_up")),
    }


@router.get("/{product_id}")
async def stock_detail(product_id: str, identity: Identity = Depends(get_identity)):
    """Riwayat mutasi + breakdown on_hand 1 produk."""
    seller_id = require_owner(identity).seller_id or ""
    detail = stock_ledger.get_stock_detail(_get_store(), seller_id, product_id)
    if detail is None:
        raise HTTPException(status_code=404, detail={
            "error": {"code": "PRODUCT_NOT_FOUND", "message": "Produk tidak ditemukan."}
        })
    return detail


@router.post("/movements")
async def record_movement(body: MovementIn, identity: Identity = Depends(get_identity)):
    """Catat mutasi: receipt (+), writeoff (−), adjustment (±). on_hand recompute."""
    seller_id = require_owner(identity).seller_id or ""
    try:
        stock = stock_ledger.record_movement(
            _get_store(), seller_id, body.product_id,
            body.type, body.qty, body.note, by_user=identity.user_id,
        )
    except StockError as e:
        raise _err(e)
    return stock


@router.post("/opening")
async def set_opening_endpoint(
    request: Request,
    identity: Identity = Depends(get_identity),
):
    """Set saldo awal: single produk (JSON) atau template CSV/XLSX (multipart)."""
    seller_id = require_owner(identity).seller_id or ""
    store = _get_store()
    content_type = (request.headers.get("content-type") or "").lower()

    # --- Mode template upload (multipart) ---
    if "multipart/form-data" in content_type:
        form = await request.form()
        file = form.get("file")
        if file is None or isinstance(file, str):
            raise HTTPException(status_code=422, detail={
                "error": {"code": "MISSING_FILE",
                          "message": "Field 'file' (CSV/XLSX) wajib ada."}
            })
        filename = file.filename or ""
        ext = PurePosixPath(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=422, detail={
                "error": {"code": "INVALID_EXTENSION",
                          "message": "Ekstensi tidak didukung. Gunakan .csv atau .xlsx"}
            })
        raw = await file.read()
        if len(raw) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(status_code=413, detail={
                "error": {"code": "FILE_TOO_LARGE",
                          "message": f"Ukuran file melebihi {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB."}
            })
        try:
            return stock_ledger.import_template(store, seller_id, raw, ext)
        except StockError as e:
            raise _err(e)

    # --- Mode single produk (JSON) ---
    try:
        body = OpeningSingle(**await request.json())
    except Exception:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "EMPTY_REQUEST",
                      "message": "Kirim JSON {name, sku, qty} atau multipart file template."}
        })
    try:
        return stock_ledger.set_opening(
            store, seller_id,
            name=body.name, sku=body.sku, qty=body.qty,
            cost_price=body.cost_price, lead_time_days=body.lead_time_days,
            opening_date=body.opening_date,
        )
    except StockError as e:
        raise _err(e)
