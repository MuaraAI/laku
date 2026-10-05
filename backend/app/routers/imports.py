"""Import router — upload, preview, confirm, history, problems (R1: skeleton + file validation)."""

from __future__ import annotations

import hashlib
import os
import uuid
from pathlib import PurePosixPath

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status

from app.config import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    MAX_ROWS_PER_FILE,
    MAX_UPLOAD_SIZE_BYTES,
)
from app.services.file_validator import validate_uploaded_file

router = APIRouter(prefix="/v1/imports", tags=["imports"])


# ---------------------------------------------------------------------------
# In-memory batch store (placeholder until DB integration in B2)
# ---------------------------------------------------------------------------
_batches: dict[str, dict] = {}


def _get_batch(batch_id: str) -> dict:
    batch = _batches.get(batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


# ---------------------------------------------------------------------------
# POST /v1/imports  — upload file, validate, create batch (status=preview)
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_import(
    file: UploadFile = File(...),
    channel: str = Form(...),
    source_system: str | None = Form(None),
):
    """Validate and register an import file. Returns batch id + status preview."""

    # --- Layer 1: extension check ---
    filename = file.filename or ""
    ext = PurePosixPath(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": {
                    "code": "INVALID_EXTENSION",
                    "message": f"Ekstensi file tidak didukung: '{ext}'. Gunakan .csv atau .xlsx",
                    "allowed": list(ALLOWED_EXTENSIONS),
                }
            },
        )

    # --- Layer 1b: MIME type check ---
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": {
                    "code": "INVALID_MIME_TYPE",
                    "message": f"Tipe file tidak didukung: '{content_type}'.",
                }
            },
        )

    # --- Layer 2: size check (read into memory, never to disk) ---
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error": {
                    "code": "FILE_TOO_LARGE",
                    "message": f"Ukuran file ({len(raw_bytes):,} bytes) melebihi batas {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
                    "max_bytes": MAX_UPLOAD_SIZE_BYTES,
                }
            },
        )

    # --- Layer 3: row cap + content validation ---
    validation_result = validate_uploaded_file(raw_bytes, ext, channel)

    if validation_result.get("error"):
        err = validation_result["error"]
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": err},
        )

    row_count = validation_result["row_count"]
    if row_count > MAX_ROWS_PER_FILE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": {
                    "code": "ROW_CAP_EXCEEDED",
                    "message": (
                        f"File berisi {row_count:,} baris (maks {MAX_ROWS_PER_FILE:,}). "
                        "Coba split file berdasarkan rentang tanggal."
                    ),
                    "cap": MAX_ROWS_PER_FILE,
                    "hint": "split by date range",
                }
            },
        )

    # --- Create batch ---
    file_hash = hashlib.sha256(raw_bytes).hexdigest()
    batch_id = str(uuid.uuid4())

    batch = {
        "id": batch_id,
        "channel": channel,
        "source_system": source_system or f"{channel}_seller_center",
        "file_hash": file_hash,
        "status": "preview",
        "rows_read": row_count,
        "rows_new": 0,
        "rows_updated": 0,
        "rows_unchanged": 0,
        "rows_problem": 0,
        "data_from": None,
        "data_through": None,
        "sku_fill_rate": None,
    }
    _batches[batch_id] = batch

    return {
        "import_batch_id": batch_id,
        "status": "preview",
        "rows_read": row_count,
        "file_hash": file_hash,
        "channel": channel,
    }


# ---------------------------------------------------------------------------
# GET /v1/imports/{id}/preview  — preview data (placeholder for B2)
# ---------------------------------------------------------------------------
@router.get("/{batch_id}/preview")
async def preview_import(batch_id: str):
    batch = _get_batch(batch_id)
    return {
        "batch_id": batch["id"],
        "status": batch["status"],
        "rows_read": batch["rows_read"],
        "new": batch["rows_new"],
        "updated": batch["rows_updated"],
        "unchanged": batch["rows_unchanged"],
        "problem_rows": batch["rows_problem"],
        "new_products": [],
        "sku_fill_rate": batch["sku_fill_rate"],
    }


# ---------------------------------------------------------------------------
# POST /v1/imports/{id}/confirm  — commit (placeholder for B2)
# ---------------------------------------------------------------------------
@router.post("/{batch_id}/confirm")
async def confirm_import(batch_id: str):
    batch = _get_batch(batch_id)
    if batch["status"] != "preview":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ALREADY_COMMITTED", "message": "Batch sudah diproses."}},
        )
    batch["status"] = "committed"
    return {"batch_id": batch_id, "status": "committed"}


# ---------------------------------------------------------------------------
# DELETE /v1/imports/{id}  — cancel / purge staging
# ---------------------------------------------------------------------------
@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_import(batch_id: str):
    batch = _get_batch(batch_id)
    batch["status"] = "expired"
    return None


# ---------------------------------------------------------------------------
# GET /v1/imports  — import history
# ---------------------------------------------------------------------------
@router.get("")
async def list_imports():
    return {"items": list(_batches.values())}


# ---------------------------------------------------------------------------
# GET /v1/imports/{id}/problems  — problem rows (placeholder)
# ---------------------------------------------------------------------------
@router.get("/{batch_id}/problems")
async def get_problems(batch_id: str):
    _get_batch(batch_id)
    return {"batch_id": batch_id, "problems": []}
