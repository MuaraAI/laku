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
  (marketing)/          landing `/`, `/tos`, `/privacy` + landing.css
  (auth)/login/         login Google OAuth & Email Magic Link / OTP (Supabase)
  auth/callback/        tukar kode OAuth / token_hash OTP → cookie sesi, lalu ke `/dashboard`
  (dashboard)/          dashboard terpadu (/dashboard) dengan mode Demo & Live
components/dashboard/  komponen dashboard (Restock, Penjualan, Upload, Setup)
components/landing/    section landing (client hanya yang interaktif)
constants/id.ts        seluruh copy UI Bahasa Indonesia terpusat (Single Source of Truth)
lib/supabase/           client browser/server Supabase (@supabase/ssr)
lib/motion.ts           helper client kecil
```

Login butuh `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (lihat `.env.local.example`). Di Supabase → Authentication → URL Configuration, tambahkan Redirect URL `http://localhost:3000/auth/callback` dan `https://laku.muaraai.com/auth/callback`.

Motion landing sengaja minim: satu fade-up per blok, tanpa animasi loop atau yang ikut scroll; semua mati saat `prefers-reduced-motion`.

Token juga tersedia sebagai utility Tailwind: `bg-paper`, `text-ink`, `bg-critical-bg`, `font-mono`, dst.

## Halaman

| Route | Isi | Fitur Utama |
|---|---|---|
| `/` | Landing (hero, fitur, cara kerja, harga, CTA) | SupplyMap, Rute Logistik, Value Props |
| `/login` | Login Google OAuth & Email OTP 6-digit | Zero-scroll 100dvh desktop, Resend SMTP |
| `/tos`, `/privacy` | Syarat & Ketentuan, Kebijakan Privasi | Kepatuhan UU PDP No. 27/2022, Pontianak |
| `/dashboard` | Dashboard Multi-Marketplace Terpadu | Mode Demo (Bu Rina) vs Live Toko Saya |

## Konvensi (wajib — lihat ../AGENTS.md)

- Semantic token dari `theme.css` (`var(--surface)`), bukan hex.
- Copy UI Bahasa Indonesia terpusat di `constants/id.ts`.
- Angka bisnis: JetBrains Mono `tabular-nums`, rata kanan.
- Light mode only (MVP). Mobile: touch target ≥44px.

## Koneksi API

Frontend terhubung ke backend FastAPI produksi di VPS Caddy:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.muaraai.com
# Lokal dev:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8400
```
