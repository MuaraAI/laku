"""Import pipeline — parse → staging → preview (diff) → confirm (upsert idempoten).

Deterministik: angka bisnis HANYA dari hasil parse + DB (aturan mengikat #4).
Idempoten: dedup key 6 kolom (seller_id, source_system, sales_channel, shop_id,
order_id, line_key) — file sama 2× = "0 new, 0 updated" (FR-3).
PII-safe: rows dari parser sudah tanpa nama/telepon/alamat (FR-29, ADR-2).
"""
from __future__ import annotations

import hashlib
import os
import uuid
from datetime import datetime, timezone

from app.config import MAX_ROWS_PER_FILE
from app.services.imports_store import ImportsStore
from app.services.parsers.shopee import parse_shopee, parse_shopee_xlsx

SUPPORTED_CHANNELS = {"shopee"}  # tiktok_shop menyusul (task terpisah)


class ImportPipelineError(Exception):
    """Error domain import — router translate ke HTTP 422."""

    def __init__(self, code: str, message: str, extra: dict | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.extra = extra or {}


def _parse_file(raw: bytes, ext: str, channel: str):
    """Parse raw bytes → ParseResult. Raise ImportPipelineError kalau channel/parse gagal."""
    if channel not in SUPPORTED_CHANNELS:
        raise ImportPipelineError(
            "UNSUPPORTED_CHANNEL",
            f"Channel '{channel}' belum didukung. Gunakan: {', '.join(sorted(SUPPORTED_CHANNELS))}.",
        )

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    config_path = os.path.join(base_dir, "configs", "channels", f"{channel}.yaml")
    if not os.path.exists(config_path):
        raise ImportPipelineError("CHANNEL_CONFIG_MISSING", f"Config channel '{channel}' tidak ditemukan.")

    from app.services.parsers.shopee import load_config

    config = load_config(config_path)

    try:
        if ext == ".csv":
            return parse_shopee(raw, config)
        if ext == ".xlsx":
            return parse_shopee_xlsx(raw, config)
        raise ImportPipelineError("INVALID_EXTENSION", f"Ekstensi '{ext}' tidak didukung.")
    except ValueError as e:
        # parser raise ValueError("MISSING_COLUMNS: [...]") untuk header wajib hilang
        msg = str(e)
        if msg.startswith("MISSING_COLUMNS"):
            cols = msg.split(":", 1)[1].strip(" []'\"")
            raise ImportPipelineError(
                "MISSING_COLUMNS",
                "Kolom wajib tidak ditemukan di file. Pastikan file export asli, tanpa diubah.",
                {"columns": [c.strip() for c in cols.split(",")]},
            )
        raise ImportPipelineError("PARSE_ERROR", msg)


def _compute_preview(store: ImportsStore, seller_id: str, batch_id: str) -> dict:
    """Bandingkan staging vs order_lines existing → payload preview (FR-7)."""
    rows, problems = store.get_staging(seller_id, batch_id)

    keys = [(r["order_id"], r["line_key"]) for r in rows]
    existing = store.fetch_lines_by_keys(seller_id, keys)
    existing_map = {(r["order_id"], r["line_key"]): r for r in existing}

    from app.services.imports_store import _line_diff

    new = updated = unchanged = 0
    seen: set[tuple] = set()
    new_products: set[str] = set()
    sku_seen = sku_filled = 0

    for r in rows:
        # SKU fill rate (FR-7): baris dengan SKU terisi / total baris
        sku_seen += 1
        if r.get("sku"):
            sku_filled += 1

        key = (r["order_id"], r["line_key"])
        if key in seen:
            # duplikat dalam 1 file: upsert nanti = unchanged — samakan semantik preview (H5)
            unchanged += 1
            continue
        seen.add(key)
        prev = existing_map.get((r["order_id"], r["line_key"]))
        if prev is None:
            new += 1
            new_products.add(r.get("sku") or r["order_id"])
        elif _line_diff(prev, r):
            updated += 1
        else:
            unchanged += 1

    rows_read = new + updated + unchanged + len(problems)
    return {
        "rows_read": rows_read,
        "new": new,
        "updated": updated,
        "unchanged": unchanged,
        "problem_rows": len(problems),
        "new_products": sorted(new_products)[:100],  # jangan bom UI; sisanya via /problems
        "sku_fill_rate": round(sku_filled / sku_seen, 4) if sku_seen else None,
        "data_from": min((r["sold_at"] for r in rows if r.get("sold_at")), default=None),
        "data_through": max((r["sold_at"] for r in rows if r.get("sold_at")), default=None),
    }


def upload_import(
    store: ImportsStore,
    seller_id: str,
    raw: bytes,
    ext: str,
    channel: str,
    source_system: str | None,
) -> dict:
    """POST /v1/imports — validate payload → parse → staging → return preview payload."""
    result = _parse_file(raw, ext, channel)

    if result.rows_read > MAX_ROWS_PER_FILE:
        # Defence-in-depth: validator router sudah nolong, ini guard terakhir.
        raise ImportPipelineError(
            "ROW_CAP_EXCEEDED",
            f"File berisi {result.rows_read:,} baris (maks {MAX_ROWS_PER_FILE:,}). "
            "Coba split file berdasarkan rentang tanggal.",
            {"cap": MAX_ROWS_PER_FILE, "hint": "split by date range"},
        )

    batch_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    batch = {
        "id": batch_id,
        "seller_id": seller_id,
        "channel": channel,
        "source_system": source_system or f"{channel}_seller_center",
        "file_hash": hashlib.sha256(raw).hexdigest(),
        "status": "preview",
        "created_at": now,
        "row_count": result.rows_read,
    }
    store.create_batch(seller_id, batch)
    store.stage_rows(seller_id, batch_id, result.rows, result.problems)

    preview = _compute_preview(store, seller_id, batch_id)
    # Map key preview → kolom import_batches (rows_new dst) — PostgREST menolak
    # kolom tak dikenal (C1: upload 500 setelah staging masuk kalau tidak dimap)
    store.update_batch(seller_id, batch_id, {
        "rows_read": preview.get("rows_read", 0),
        "rows_new": preview["new"],
        "rows_updated": preview["updated"],
        "rows_unchanged": preview["unchanged"],
        "rows_problem": preview["problem_rows"],
        "sku_fill_rate": preview.get("sku_fill_rate"),
        "data_from": preview.get("data_from"),
        "data_through": preview.get("data_through"),
    })

    return {
        "import_batch_id": batch_id,
        "status": "preview",
        "file_hash": batch["file_hash"],
        "channel": channel,
        "source_system": batch["source_system"],
        **preview,
    }


def get_preview(store: ImportsStore, seller_id: str, batch_id: str) -> dict:
    """GET /v1/imports/{id}/preview — payload preview dari batch."""
    batch = store.get_batch(seller_id, batch_id)
    if batch is None:
        raise ImportPipelineError("BATCH_NOT_FOUND", "Batch tidak ditemukan.")
    return {
        "batch_id": batch["id"],
        "status": batch["status"],
        "channel": batch["channel"],
        "rows_read": batch.get("rows_read", 0),
        "new": batch.get("rows_new", 0),
        "updated": batch.get("rows_updated", 0),
        "unchanged": batch.get("rows_unchanged", 0),
        "problem_rows": batch.get("rows_problem", 0),
        "new_products": batch.get("new_products", []),
        "sku_fill_rate": batch.get("sku_fill_rate"),
        "data_from": batch.get("data_from"),
        "data_through": batch.get("data_through"),
    }


def confirm_import(store: ImportsStore, seller_id: str, batch_id: str) -> dict:
    """POST /v1/imports/{id}/confirm — commit staging → order_lines (idempoten)."""
    batch = store.get_batch(seller_id, batch_id)
    if batch is None:
        raise ImportPipelineError("BATCH_NOT_FOUND", "Batch tidak ditemukan.")
    if batch["status"] == "committed":
        raise ImportPipelineError("ALREADY_COMMITTED", "Batch sudah diproses sebelumnya.")
    if batch["status"] != "preview":
        raise ImportPipelineError("INVALID_STATUS", f"Batch status '{batch['status']}' tidak bisa di-commit.")

    rows, problems = store.get_staging(seller_id, batch_id)
    # staging kosong = expired/purged — JANGAN commit "0 new" yang menimpa angka preview (C4)
    if not rows:
        raise ImportPipelineError("STAGING_EXPIRED", "Staging batch sudah kedaluwarsa. Upload ulang file.")

    existing_keys = [(r["order_id"], r["line_key"]) for r in rows]
    existing = store.fetch_lines_by_keys(seller_id, existing_keys)
    existing_map = {(r["order_id"], r["line_key"]): r for r in existing}

    from app.services.imports_store import _line_diff

    # change_log SEBELUM upsert — store memory mutasi in-place, diff harus diambil dulu
    change_log: list[dict] = []
    for r in rows:
        prev = existing_map.get((r["order_id"], r["line_key"]))
        if prev is not None:
            diff = _line_diff(prev, r)
            if diff:
                change_log.append({
                    "order_id": r["order_id"],
                    "line_key": r["line_key"],
                    "changed": diff,
                    "at": datetime.now(timezone.utc).isoformat(),
                })

    counts = store.upsert_lines(seller_id, batch_id, rows, change_log)

    counts["problem_rows"] = len(problems)
    counts["status"] = "committed"
    counts["batch_id"] = batch_id

    store.update_batch(seller_id, batch_id, {
        "status": "committed",
        "rows_new": counts["new"],
        "rows_updated": counts["updated"],
        "rows_unchanged": counts["unchanged"],
        "change_log": change_log,
        # problems ikut disimpan (row/column/reason — tanpa isi sel) supaya
        # tetap bisa di-download setelah staging di-purge (ADR-2 aman).
        "problems_at_commit": problems,
    })
    store.purge_staging(seller_id, batch_id)  # ADR-2: purge setelah commit
    return counts


def list_imports(store: ImportsStore, seller_id: str, limit: int = 50) -> list[dict]:
    """GET /v1/imports — riwayat import seller."""
    items = store.list_batches(seller_id, limit)
    return [
        {
            "import_batch_id": b["id"],
            "channel": b["channel"],
            "status": b["status"],
            "rows_read": b.get("rows_read", b.get("row_count", 0)),
            "new": b.get("rows_new", 0),
            "updated": b.get("rows_updated", 0),
            "unchanged": b.get("rows_unchanged", 0),
            "problem_rows": b.get("rows_problem", 0),
            "sku_fill_rate": b.get("sku_fill_rate"),
            "data_from": (b.get("data_from") or "")[:10] if b.get("data_from") else None,
            "data_through": (b.get("data_through") or "")[:10] if b.get("data_through") else None,
            "created_at": b.get("created_at"),
        }
        for b in items
    ]


def get_problems(store: ImportsStore, seller_id: str, batch_id: str) -> dict:
    """GET /v1/imports/{id}/problems — daftar masalah per baris (tanpa isi sel, PII rule)."""
    batch = store.get_batch(seller_id, batch_id)
    if batch is None:
        raise ImportPipelineError("BATCH_NOT_FOUND", "Batch tidak ditemukan.")
    _, problems = store.get_staging(seller_id, batch_id)
    if not problems and batch["status"] == "committed":
        problems = batch.get("problems_at_commit", [])
    return {
        "batch_id": batch_id,
        "total": len(problems),
        "problems": problems,  # {row, column, reason} — tanpa isi sel (api.md)
    }


def cancel_import(store: ImportsStore, seller_id: str, batch_id: str) -> None:
    """DELETE /v1/imports/{id} — batalkan + purge staging."""
    batch = store.get_batch(seller_id, batch_id)
    if batch is None:
        raise ImportPipelineError("BATCH_NOT_FOUND", "Batch tidak ditemukan.")
    store.update_batch(seller_id, batch_id, {"status": "expired"})
    store.purge_staging(seller_id, batch_id)
