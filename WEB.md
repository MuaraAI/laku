# Laku Web

Next.js 15 App Router — landing page (`/`) dan dashboard seller (`/dashboard`).

Stack: Next.js 15.5 · React 19 · TypeScript · Tailwind CSS v4.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # wajib lulus sebelum PR
```

## Struktur

```
app/
  layout.tsx            root: font, metadata, flag motion (.js)
  globals.css           Tailwind + base + tombol/badge bersama
  theme.css             semantic tokens (satu-satunya tempat hex)
  icon.svg              favicon (mark Laku)
  (marketing)/          landing page `/` + landing.css
components/landing/     section landing (client hanya yang interaktif)
constants/id.ts         semua copy UI Bahasa Indonesia
lib/                    helper motion (client) & css
```

Token juga tersedia sebagai utility Tailwind: `bg-paper`, `text-ink`, `bg-critical-bg`, `font-mono`, dst.

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
