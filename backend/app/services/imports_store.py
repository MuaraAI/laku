"""Store layer untuk import pipeline (ADR-1: semua query ter-scope seller).

Dua implementasi dengan perilaku sama:
- ImportsMemoryStore  : in-memory (dev/test/demo) — dict per seller, tanpa DB.
- ImportsSupabaseStore: Supabase PostgREST (prod) — RLS tetap jalan karena
  client per-user; staging purge + upsert ON CONFLICT via RPC.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone

UPSERT_CONFLICT_KEY = "seller_id,source_system,sales_channel,shop_id,order_id,line_key"
STAGING_TTL_HOURS = 24  # ADR-2: staging purge ≤ 24 jam
UPSERT_RPC = "upsert_order_lines"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# field canonical yang di-upsert saat re-import (status upsert, FR-27)
_LINE_FIELDS = ("status", "qty", "list_price", "paid_price", "seller_discount", "sold_at")


def _line_diff(existing: dict, incoming: dict) -> dict:
    """Field yang beda antara line lama & baru — untuk DO UPDATE + change_log."""
    diff = {}
    field_map = {
        "status": lambda d: d.get("status"),
        "qty": lambda d: int(d["qty"]) if d.get("qty") is not None else None,
        "list_price": lambda d: float(d.get("list_price") if d.get("list_price") is not None else d.get("unit_price") or 0),
        "seller_discount": lambda d: float(d.get("seller_discount") if d.get("seller_discount") is not None else d.get("discount_amount") or 0),
    }
    for f, getter in field_map.items():
        new_v = getter(incoming)
        old_v = getter(existing)
        if new_v is not None and old_v is not None and new_v != old_v:
            diff[f] = incoming.get(f, new_v)
    return diff


class ImportsStore(ABC):
    """Kontrak store import. Semua method WAJIB terima seller_id eksplisit."""

    # -- batches -------------------------------------------------------
    @abstractmethod
    def create_batch(self, seller_id: str, batch: dict) -> dict: ...

    @abstractmethod
    def get_batch(self, seller_id: str, batch_id: str) -> dict | None: ...

    @abstractmethod
    def list_batches(self, seller_id: str, limit: int = 50) -> list[dict]: ...

    @abstractmethod
    def update_batch(self, seller_id: str, batch_id: str, values: dict) -> None: ...

    # -- staging -------------------------------------------------------
    @abstractmethod
    def stage_rows(self, seller_id: str, batch_id: str, rows: list[dict],
                   problems: list[dict]) -> None: ...

    @abstractmethod
    def get_staging(self, seller_id: str, batch_id: str) -> tuple[list[dict], list[dict]]: ...

    @abstractmethod
    def purge_staging(self, seller_id: str, batch_id: str) -> None: ...

    @abstractmethod
    def purge_expired(self, max_age_hours: int = STAGING_TTL_HOURS) -> int: ...

    # -- order_lines ---------------------------------------------------
    @abstractmethod
    def fetch_lines_by_keys(self, seller_id: str, keys: list[tuple]) -> list[dict]: ...

    @abstractmethod
    def upsert_lines(self, seller_id: str, batch_id: str,
                     rows: list[dict], change_log: list[dict]) -> dict: ...


# ---------------------------------------------------------------------------
# In-memory (dev/test/demo)
# ---------------------------------------------------------------------------

class ImportsMemoryStore(ImportsStore):
    """In-memory store. Perilaku scoping setara RLS: seller lain nggak bisa lihat."""

    def __init__(self) -> None:
        # seller_id -> batch_id -> batch
        self._batches: dict[str, dict[str, dict]] = {}
        # batch_id -> {"rows": [...], "problems": [...], "created_at": dt}
        self._staging: dict[str, dict] = {}
        # seller_id -> {(seller_id, source_system, channel, shop_id, order_id, line_key): line}
        self._lines: dict[str, dict[tuple, dict]] = {}

    # -- batches -------------------------------------------------------
    def create_batch(self, seller_id: str, batch: dict) -> dict:
        self._batches.setdefault(seller_id, {})[batch["id"]] = dict(batch)
        return dict(batch)

    def get_batch(self, seller_id: str, batch_id: str) -> dict | None:
        self.purge_expired()
        b = self._batches.get(seller_id, {}).get(batch_id)
        return dict(b) if b else None

    def list_batches(self, seller_id: str, limit: int = 50) -> list[dict]:
        self.purge_expired()
        items = sorted(
            self._batches.get(seller_id, {}).values(),
            key=lambda b: b.get("created_at", ""),
            reverse=True,
        )
        return [dict(b) for b in items[:limit]]

    def update_batch(self, seller_id: str, batch_id: str, values: dict) -> None:
        b = self._batches.get(seller_id, {}).get(batch_id)
        if b is not None:
            b.update(values)

    # -- staging -------------------------------------------------------
    def stage_rows(self, seller_id: str, batch_id: str, rows: list[dict],
                   problems: list[dict]) -> None:
        self._staging[batch_id] = {
            "rows": rows,
            "problems": problems,
            "seller_id": seller_id,
            "created_at": _utcnow(),
        }

    def get_staging(self, seller_id: str, batch_id: str) -> tuple[list[dict], list[dict]]:
        self.purge_expired()
        s = self._staging.get(batch_id)
        if not s or s["seller_id"] != seller_id:
            return [], []
        return list(s["rows"]), list(s["problems"])

    def purge_staging(self, seller_id: str, batch_id: str) -> None:
        self._staging.pop(batch_id, None)

    def purge_expired(self, max_age_hours: int = STAGING_TTL_HOURS) -> int:
        """Buang staging > TTL. Return jumlah yang dibuang (audit, isi PII 0 by design)."""
        cutoff = _utcnow() - timedelta(hours=max_age_hours)
        expired = [
            bid for bid, s in self._staging.items()
            if s["created_at"] < cutoff
        ]
        for bid in expired:
            del self._staging[bid]
        return len(expired)

    # -- order_lines ---------------------------------------------------
    def fetch_lines_by_keys(self, seller_id: str, keys: list[tuple]) -> list[dict]:
        keyset = {tuple(k) for k in keys}
        table = self._lines.get(seller_id, {})
        return [
            r for k, r in table.items()
            if (k[4], k[5]) in keyset
        ]

    def upsert_lines(self, seller_id: str, batch_id: str,
                     rows: list[dict], change_log: list[dict]) -> dict:
        """Idempoten: key 6 kolom → insert kalau baru, DO UPDATE kalau beda nilai."""
        table = self._lines.setdefault(seller_id, {})
        new = updated = unchanged = 0
        for row in rows:
            key = (
                seller_id, row["source_system"], row["sales_channel"], row.get("shop_id"),
                row["order_id"], row["line_key"],
            )
            existing = table.get(key)
            if existing is None:
                stored = {**row, "seller_id": seller_id,
                          "unit_price": row["list_price"],
                          "discount_amount": row["seller_discount"]}
                table[key] = stored
                new += 1
            else:
                diff = _line_diff(existing, row)
                if diff:
                    existing.update(diff)
                    updated += 1
                else:
                    unchanged += 1
        return {"new": new, "updated": updated, "unchanged": unchanged}


# ---------------------------------------------------------------------------
# Supabase (prod)
# ---------------------------------------------------------------------------

class ImportsSupabaseStore(ImportsStore):
    """Supabase via PostgREST. `client` = client per-user (RLS aktif)."""

    def __init__(self, client) -> None:
        self.client = client

    # -- batches -------------------------------------------------------
    def create_batch(self, seller_id: str, batch: dict) -> dict:
        row = self.client.table("import_batches").insert(batch).execute().data[0]
        return row

    def get_batch(self, seller_id: str, batch_id: str) -> dict | None:
        rows = (
            self.client.table("import_batches")
            .select("*")
            .eq("seller_id", seller_id)
            .eq("id", batch_id)
            .limit(1)
            .execute()
            .data
        )
        return rows[0] if rows else None

    def list_batches(self, seller_id: str, limit: int = 50) -> list[dict]:
        return (
            self.client.table("import_batches")
            .select("*")
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
            .data
            or []
        )

    def update_batch(self, seller_id: str, batch_id: str, values: dict) -> None:
        self.client.table("import_batches").update(values).eq(
            "seller_id", seller_id
        ).eq("id", batch_id).execute()

    # -- staging -------------------------------------------------------
    def stage_rows(self, seller_id: str, batch_id: str, rows: list[dict],
                   problems: list[dict]) -> None:
        # payload = hasil parse yang sudah PII-safe; problems ikut di-stage
        # supaya endpoint /problems bisa baca tanpa simpan file mentah (ADR-2).
        payload = {"rows": rows, "problems": problems}
        inserts = [
            {"batch_id": batch_id, "payload": r, "line_key": r.get("line_key")}
            for r in rows
        ]
        if problems:
            inserts.append({"batch_id": batch_id, "payload": {"__problems__": problems},
                            "line_key": "__problems__"})
        if inserts:
            self.client.table("import_staging").insert(inserts).execute()
        _ = payload  # payload hanya in-memory; raw file tidak pernah disimpan (ADR-2)

    def get_staging(self, seller_id: str, batch_id: str) -> tuple[list[dict], list[dict]]:
        rows: list[dict] = []
        problems: list[dict] = []
        # Defence-in-depth: batch HARUS milik seller ini (RLS bisa salah/berubah).
        owned = (
            self.client.table("import_batches")
            .select("id")
            .eq("seller_id", seller_id)
            .eq("id", batch_id)
            .limit(1)
            .execute()
            .data
            or []
        )
        if not owned:
            return rows, problems
        resp = (
            self.client.table("import_staging")
            .select("payload")
            .eq("batch_id", batch_id)
            .order("created_at", desc=False)
            .execute()
        )
        for item in resp.data or []:
            payload = item["payload"]
            if isinstance(payload, dict) and "__problems__" in payload:
                problems = payload["__problems__"]
            else:
                rows.append(payload)
        return rows, problems

    def purge_staging(self, seller_id: str, batch_id: str) -> None:
        owned = (
            self.client.table("import_batches")
            .select("id")
            .eq("seller_id", seller_id)
            .eq("id", batch_id)
            .limit(1)
            .execute()
            .data
            or []
        )
        if not owned:
            return
        self.client.table("import_staging").delete().eq("batch_id", batch_id).execute()

    def purge_expired(self, max_age_hours: int = STAGING_TTL_HOURS) -> int:
        # Butuh RPC server-side (service role); dijalankan scheduled job di VPS.
        # Di request path kita purge by batch via trigger DB — return 0 di sini.
        return 0

    # -- order_lines ---------------------------------------------------
    def fetch_lines_by_keys(self, seller_id: str, keys: list[tuple]) -> list[dict]:
        # PostgREST `in` untuk kombinasi kolom: chunk per 100 kunci agar tidak
        # melebihi batas panjang URL (HTTP 414 URI Too Long pada file besar).
        if not keys:
            return []
        keyset = {(k[0], k[1]) for k in keys}
        out = []
        chunk_size = 100
        for i in range(0, len(keys), chunk_size):
            chunk = keys[i:i + chunk_size]
            or_expr = ",".join(
                f"and(order_id.eq.{_q(o)},line_key.eq.{_q(lk)})"
                for o, lk in chunk
            )
            resp = (
                self.client.table("order_lines")
                .select("*")
                .eq("seller_id", seller_id)  # eksplisit — jangan andalkan RLS saja
                .or_(or_expr)
                .execute()
            )
            out.extend([r for r in (resp.data or []) if (r["order_id"], r["line_key"]) in keyset])
        return out

    @staticmethod
    def _to_rpc_row(r: dict) -> dict:
        """Translate field parser → kolom tabel order_lines (schema drift C1).

        Parser canonical: list_price/paid_price/seller_discount;
        kolom DB & RPC: unit_price/discount_amount/allocated_discount.
        """
        return {
            **r,
            "sku": r.get("sku") or "",
            "unit_price": r.get("unit_price") if r.get("unit_price") is not None else r.get("list_price") or 0,
            "discount_amount": r.get("discount_amount") if r.get("discount_amount") is not None else r.get("seller_discount") or 0,
            "allocated_discount": r.get("allocated_discount") or 0,
            "shop_id": r.get("shop_id") or "",
        }

    def upsert_lines(self, seller_id: str, batch_id: str,
                     rows: list[dict], change_log: list[dict]) -> dict:
        rpc_rows = [self._to_rpc_row(r) for r in rows if r.get("sold_at")]
        resp = (
            self.client.rpc(
                UPSERT_RPC,
                {
                    "p_seller_id": seller_id,
                    "p_batch_id": batch_id,
                    "p_rows": rpc_rows,
                    "p_change_log": change_log,
                },
            ).execute()
        )
        data = resp.data or {}
        return {
            "new": data.get("new", 0),
            "updated": data.get("updated", 0),
            "unchanged": data.get("unchanged", 0),
        }


def _q(v: str) -> str:
    """Quote nilai untuk ekspresi `or` PostgREST."""
    s = str(v).replace('"', '""')
    return f'"{s}"'


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_imports_store(identity=None) -> ImportsStore:
    """Pilih store sesuai setting: Supabase kalau configured, else in-memory.

    identity: Identity dari deps.auth — seller scoping diambil dari sini (ADR-1).
    """
    from app.deps.settings import get_settings

    s = get_settings()
    if s.supabase_service_key or s.supabase_url:
        from supabase import create_client  # noqa: no stubs for supabase-py

        if not s.supabase_service_key:
            # L4: jangan pakai URL sebagai key (error samar) — fail loud.
            raise RuntimeError("SUPABASE_URL terisi tapi SUPABASE_SERVICE_KEY kosong — config rusak")
        client = create_client(s.supabase_url, s.supabase_service_key)
        return ImportsSupabaseStore(client)
    return ImportsMemoryStore()


__all__ = [
    "ImportsStore",
    "ImportsMemoryStore",
    "ImportsSupabaseStore",
    "get_imports_store",
    "UPSERT_CONFLICT_KEY",
    "STAGING_TTL_HOURS",
]
