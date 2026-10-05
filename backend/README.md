# Backend — Laku API

FastAPI service untuk deterministic restock engine. Deploy di VPS (PM2, port 8400, behind Caddy).

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn[standard] pandas openpyxl python-multipart supabase redis pyyaml pytest httpx
cp ../.env.example ../.env   # isi nilainya
uvicorn app.main:app --reload --port 8400
```

## Struktur

```
backend/
├── app/
│   ├── main.py             entry FastAPI + /health
│   ├── routers/            endpoint /v1/* (imports, analytics, products, stock, recap)
│   ├── services/           parsers/ (per-channel), engine.py, recap.py
│   ├── repositories/       satu-satunya lapisan akses DB (seller_id wajib)
│   └── deps/               JWT verify + require_role
├── supabase/migrations/    SQL schema + RLS policies
├── mock/                   mock server (frontend dev tanpa backend jadi)
├── configs/channels/       mapping kolom export per marketplace (YAML)
└── tests/                  pytest — golden tests, dedup, PII, isolation
```

## Aturan (ringkas — lengkap di ../AGENTS.md)

1. PII (nama/HP/alamat pembeli) tidak pernah persist — derive region lalu buang.
2. Raw file tidak disimpan — parse in-memory, staging purge ≤24 jam.
3. Semua query DB lewat repositories, `seller_id` wajib ada di parameter.
4. Golden tests (engine §9A, recap §9D) harus exact — jangan ubah formula tanpa ubah test-nya.

## Mock server (frontend dev)

```bash
uvicorn mock.main:app --port 8400
# GET /v1/recommendations → data seed 10 produk, semua state
```
