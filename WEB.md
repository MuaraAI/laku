# Laku Web

Next.js 15 App Router — landing page (`/`) dan dashboard seller (`/dashboard`).

> **NOTE SCAFFOLD:** `package.json` saat ini minimal placeholder struktur. Jalankan `npx create-next-app@latest . --typescript --tailwind --app` di root untuk generate full setup, lalu paste isi `theme.css` (dari PRD repo utama / DESIGN.md) ke `app/globals.css`.

## Halaman

| Route | Isi | Owner |
|---|---|---|
| `/` | Landing (hero, fitur, cara kerja, CTA) | Raken |
| `/login` | Google OAuth via Supabase | Jio |
| `/dashboard` | Restock home (ranking + badge state) | Jio |
| `/dashboard/upload` | Import CSV/XLSX + preview/confirm | Jio |
| `/dashboard/stok` | Ledger stok | Jio |
| `/dashboard/penjualan` | Recap + coverage banner | Raken + Jio |

## Konvensi (wajib — lihat ../AGENTS.md)

- Semantic token dari `theme.css` (`var(--surface)`), bukan hex.
- Copy UI Bahasa Indonesia di `constants/id.ts`.
- Angka bisnis: JetBrains Mono `tabular-nums`, rata kanan.
- Light mode only (MVP). Mobile: bottom tabs ≤5, touch ≥44px.

## Koneksi API

Frontend konsumsi mock server `backend/mock` selama backend asli dikembangkan:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8400
```
