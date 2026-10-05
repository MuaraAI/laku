"""Repository base — satu-satunya lapisan akses DB (ADR-1).

ATURAN: semua fungsi query WAJIB terima `seller_id` eksplisit.
Tidak ada fungsi query tanpa scoping — fail closed by design.
"""
from typing import Any

from fastapi import HTTPException


class SellerRepository:
    """Base repository dengan scoping wajib per seller.

    Subclass meng-override `table_name`, lalu pakai helper di bawah.
    `client` = Supabase client dengan user context (bukan service key)
    agar RLS tetap dievaluasi — service key hanya untuk job admin.
    """

    table_name: str = ""

    def __init__(self, client: Any, seller_id: str):
        if not seller_id:
            # Fail closed: tanpa seller_id = tanpa query.
            raise HTTPException(500, "Repository requires seller_id (ADR-1)")
        self.client = client
        self.seller_id = seller_id

    def _table(self):
        if not self.table_name:
            raise NotImplementedError("Subclass must set table_name")
        return self.client.table(self.table_name)

    def list(self, *, order_by: str = "created_at", desc: bool = True, limit: int = 200) -> list[dict]:
        q = (
            self._table()
            .select("*")
            .eq("seller_id", self.seller_id)
            .order(order_by, desc=desc)
            .limit(limit)
        )
        return q.execute().data or []

    def get(self, row_id: str) -> dict | None:
        rows = (
            self._table()
            .select("*")
            .eq("seller_id", self.seller_id)
            .eq("id", row_id)
            .limit(1)
            .execute()
            .data
        )
        return rows[0] if rows else None

    def insert(self, values: dict) -> dict:
        values = {**values, "seller_id": self.seller_id}
        return self._table().insert(values).execute().data[0]

    def update(self, row_id: str, values: dict) -> dict | None:
        rows = (
            self._table()
            .update(values)
            .eq("seller_id", self.seller_id)
            .eq("id", row_id)
            .execute()
            .data
        )
        return rows[0] if rows else None

    def delete(self, row_id: str) -> int:
        rows = (
            self._table()
            .delete()
            .eq("seller_id", self.seller_id)
            .eq("id", row_id)
            .execute()
            .data
        )
        return len(rows or [])
