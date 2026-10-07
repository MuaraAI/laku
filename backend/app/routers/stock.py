"""Stock router — ledger gudang (B4): list, detail, movements, opening (FR-11/FR-26)."""

from __future__ import annotations

from pathlib import PurePosixPath

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, ValidationError, field_validator
from starlette.concurrency import run_in_threadpool

from app.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES
from app.deps.auth import Identity, get_identity, require_owner, require_seller_member
from app.services import stock_ledger
from app.services.stock_ledger import StockError, StockMemoryStore

router = APIRouter(prefix="/v1/stock", tags=["stock"])

# Store singleton in-memory (dev/test); prod pakai Supabase via factory.
_memory_store = None


def _get_store():
    global _memory_store
    # Lazy wiring: kalau B2 (imports pipeline) sudah merge, sales dibaca dari
    # order_lines memory store yang sama; kalau belum, ledger jalan tanpa sales.
    from app.routers import imports as _imports_mod  # ImportError di sini = bug nyata, biarkan raise
    _imports_memory = getattr(_imports_mod, "_memory_store", None)

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
    # batasan di sini = batasan kolom DB (CHECK opening_qty/cost_price >= 0) → 422 jelas, bukan 500
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=100)
    qty: int = Field(ge=0, le=10_000_000)
    cost_price: float | None = Field(default=None, ge=0)
    lead_time_days: int | None = Field(default=None, ge=1, le=60)
    opening_date: str | None = None  # ISO date, default hari ini (WIB)

    @field_validator("name", "sku")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("tidak boleh kosong")
        return v

    @field_validator("opening_date")
    @classmethod
    def _iso_date(cls, v: str | None) -> str | None:
        if v is None:
            return v
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError("format tanggal harus YYYY-MM-DD")
        return v


class MovementIn(BaseModel):
    product_id: str = Field(min_length=1)
    type: Literal["receipt", "adjustment", "writeoff"]
    qty: int = Field(ge=-10_000_000, le=10_000_000)
    note: str | None = Field(default=None, max_length=500)


@router.get("")
def list_stock(identity: Identity = Depends(get_identity)):
    """Stok semua produk: on_hand, opening, mismatch indicator (api.md MVP)."""
    seller_id = require_seller_member(identity).seller_id or ""
    store = _get_store()
    items = stock_ledger.list_stock(store, seller_id)
    return {
        "items": items,
        "mismatch_count": sum(1 for i in items if i.get("mismatch")),
        "not_set_up_count": sum(1 for i in items if not i.get("stock_set_up")),
    }


@router.get("/{product_id}")
def stock_detail(product_id: str, identity: Identity = Depends(get_identity)):
    """Riwayat mutasi + breakdown on_hand 1 produk."""
    seller_id = require_seller_member(identity).seller_id or ""
    detail = stock_ledger.get_stock_detail(_get_store(), seller_id, product_id)
    if detail is None:
        raise HTTPException(status_code=404, detail={
            "error": {"code": "PRODUCT_NOT_FOUND", "message": "Produk tidak ditemukan."}
        })
    return detail


@router.post("/movements")
def record_movement(body: MovementIn, identity: Identity = Depends(get_identity)):
    """Catat mutasi: receipt (+), writeoff (−), adjustment (±). on_hand recompute."""
    seller_id = require_seller_member(identity).seller_id or ""
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
        declared = request.headers.get("content-length")
        if declared and declared.isdigit() and int(declared) > MAX_UPLOAD_SIZE_BYTES + 64 * 1024:
            raise HTTPException(status_code=413, detail={
                "error": {"code": "FILE_TOO_LARGE",
                          "message": f"Ukuran file melebihi {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB."}
            })
        raw = await file.read()
        if len(raw) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(status_code=413, detail={
                "error": {"code": "FILE_TOO_LARGE",
                          "message": f"Ukuran file melebihi {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB."}
            })
        try:
            return await run_in_threadpool(stock_ledger.import_template, store, seller_id, raw, ext)
        except StockError as e:
            raise _err(e)

    # --- Mode single produk (JSON) ---
    try:
        payload = await request.json()
    except Exception:
        payload = None
    if not isinstance(payload, dict):
        raise HTTPException(status_code=422, detail={
            "error": {"code": "EMPTY_REQUEST",
                      "message": "Kirim JSON {name, sku, qty} atau multipart file template."}
        })
    try:
        body = OpeningSingle(**payload)
    except ValidationError as ve:
        # sebut field yang salah (dulu semua error jadi "Kirim JSON {name, sku, qty}")
        first = ve.errors()[0]
        field = ".".join(str(p) for p in first.get("loc", ()))
        raise HTTPException(status_code=422, detail={
            "error": {"code": "VALIDATION_ERROR", "message": f"{field}: {first.get('msg', 'tidak valid')}",
                      "field": field}
        })
    try:
        return await run_in_threadpool(
            lambda: stock_ledger.set_opening(
                store, seller_id,
                name=body.name, sku=body.sku, qty=body.qty,
                cost_price=body.cost_price, lead_time_days=body.lead_time_days,
                opening_date=body.opening_date,
            )
        )
    except StockError as e:
        raise _err(e)
