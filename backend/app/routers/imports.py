"""Import router — upload, preview, confirm, history, problems (B2: pipeline penuh)."""

from __future__ import annotations

import uuid
from pathlib import PurePosixPath

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File, Form, status

from app.config import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    MAX_ROWS_PER_FILE,
    MAX_UPLOAD_SIZE_BYTES,
)
from app.deps.auth import Identity, get_identity, require_owner
from app.services import import_pipeline
from app.services.file_validator import validate_uploaded_file
from app.services.import_pipeline import ImportPipelineError
from app.services.imports_store import ImportsMemoryStore, ImportsStore, get_imports_store

router = APIRouter(prefix="/v1/imports", tags=["imports"])

# ---------------------------------------------------------------------------
# Store singleton (in-memory di dev/test; Supabase di prod via get_imports_store)
# ---------------------------------------------------------------------------
_memory_store = ImportsMemoryStore()


def _get_store() -> ImportsStore:
    from app.deps.settings import get_settings

    s = get_settings()
    if s.supabase_url:
        return get_imports_store()
    return _memory_store


def _err(e: ImportPipelineError) -> HTTPException:
    detail: dict = {"error": {"code": e.code, "message": e.message}}
    if e.extra:
        detail["error"].update(e.extra)
    return HTTPException(status_code=422, detail=detail)


def _batch_not_found() -> HTTPException:
    return HTTPException(status_code=404, detail={"error": {"code": "BATCH_NOT_FOUND",
                                                            "message": "Batch tidak ditemukan."}})


# ---------------------------------------------------------------------------
# POST /v1/imports — upload, validate 3 lapis, parse, staging, preview
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_import(
    request: Request,
    file: UploadFile = File(...),
    channel: str = Form(...),
    source_system: str | None = Form(None),
    identity: Identity = Depends(get_identity),
):
    seller_id = require_owner(identity).seller_id or ""
    store = _get_store()

    # --- Layer 0: content-length pre-check (M4) — tolak SEBELUM baca body ke RAM
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > MAX_UPLOAD_SIZE_BYTES + 64 * 1024:
        raise HTTPException(status_code=413, detail={
            "error": {
                "code": "FILE_TOO_LARGE",
                "message": f"Ukuran file melebihi batas {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
                "max_bytes": MAX_UPLOAD_SIZE_BYTES,
            }
        })

    # --- Layer 1: extension + MIME ---
    filename = file.filename or ""
    ext = PurePosixPath(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail={
            "error": {
                "code": "INVALID_EXTENSION",
                "message": f"Ekstensi file tidak didukung: '{ext}'. Gunakan .csv atau .xlsx",
                "allowed": list(ALLOWED_EXTENSIONS),
            }
        })

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=422, detail={
            "error": {
                "code": "INVALID_MIME_TYPE",
                "message": f"Tipe file tidak didukung: '{content_type}'.",
            }
        })

    # --- Layer 2: size (in-memory, tidak pernah ke disk — ADR-2) ---
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail={
            "error": {
                "code": "FILE_TOO_LARGE",
                "message": (f"Ukuran file ({len(raw_bytes):,} bytes) melebihi batas "
                            f"{MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB."),
                "max_bytes": MAX_UPLOAD_SIZE_BYTES,
            }
        })

    # --- Layer 3: row cap + konten ---
    validation = validate_uploaded_file(raw_bytes, ext, channel)
    if validation.get("error"):
        raise HTTPException(status_code=422,
                            detail={"error": validation["error"]})

    row_count = validation["row_count"]
    if row_count > MAX_ROWS_PER_FILE:
        raise HTTPException(status_code=422, detail={
            "error": {
                "code": "ROW_CAP_EXCEEDED",
                "message": (f"File berisi {row_count:,} baris (maks {MAX_ROWS_PER_FILE:,}). "
                            "Coba split file berdasarkan rentang tanggal."),
                "cap": MAX_ROWS_PER_FILE,
                "hint": "split by date range",
            }
        })

    # --- Parse + staging + preview (pipeline B2) ---
    try:
        return import_pipeline.upload_import(store, seller_id, raw_bytes, ext, channel, source_system)
    except ImportPipelineError as e:
        raise _err(e)


# ---------------------------------------------------------------------------
# GET /v1/imports — riwayat import
# ---------------------------------------------------------------------------
@router.get("")
def list_imports(limit: int = Query(50, ge=1, le=200), identity: Identity = Depends(get_identity)):
    seller_id = require_owner(identity).seller_id or ""
    return {"items": import_pipeline.list_imports(_get_store(), seller_id, limit)}


# ---------------------------------------------------------------------------
# GET /v1/imports/{id}/preview
# ---------------------------------------------------------------------------
@router.get("/{batch_id}/preview")
def preview_import(batch_id: str, identity: Identity = Depends(get_identity)):
    seller_id = require_owner(identity).seller_id or ""
    try:
        return import_pipeline.get_preview(_get_store(), seller_id, batch_id)
    except ImportPipelineError as e:
        if e.code == "BATCH_NOT_FOUND":
            raise _batch_not_found()
        raise _err(e)


# ---------------------------------------------------------------------------
# POST /v1/imports/{id}/confirm — commit staging → order_lines
# ---------------------------------------------------------------------------
@router.post("/{batch_id}/confirm")
def confirm_import(batch_id: str, identity: Identity = Depends(get_identity)):
    seller_id = require_owner(identity).seller_id or ""
    try:
        return import_pipeline.confirm_import(_get_store(), seller_id, batch_id)
    except ImportPipelineError as e:
        if e.code == "BATCH_NOT_FOUND":
            raise _batch_not_found()
        if e.code == "ALREADY_COMMITTED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={
                "error": {"code": "ALREADY_COMMITTED", "message": e.message}
            })
        raise _err(e)


# ---------------------------------------------------------------------------
# DELETE /v1/imports/{id} — cancel + purge staging
# ---------------------------------------------------------------------------
@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_import(batch_id: str, identity: Identity = Depends(get_identity)):
    seller_id = require_owner(identity).seller_id or ""
    try:
        import_pipeline.cancel_import(_get_store(), seller_id, batch_id)
    except ImportPipelineError as e:
        if e.code == "BATCH_NOT_FOUND":
            raise _batch_not_found()
        raise _err(e)
    return None


# ---------------------------------------------------------------------------
# GET /v1/imports/{id}/problems
# ---------------------------------------------------------------------------
@router.get("/{batch_id}/problems")
def get_problems(batch_id: str, identity: Identity = Depends(get_identity)):
    seller_id = require_owner(identity).seller_id or ""
    try:
        return import_pipeline.get_problems(_get_store(), seller_id, batch_id)
    except ImportPipelineError as e:
        if e.code == "BATCH_NOT_FOUND":
            raise _batch_not_found()
        raise _err(e)
