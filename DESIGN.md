---
version: alpha
name: Laku
description: MuaraAI Laku — light-first restock engine untuk seller UMKM. Keluarga warna sungai MuaraAI (River Current Blue di Estuary Canvas), angka tabular JetBrains Mono, state berwarna selalu bersama ikon dan label. Dark-ready via semantic tokens, dark values menyusul pasca Grand Final.
colors:
  primary: "#0369A1"
  secondary: "#072033"
  tertiary: "#DC2626"
  neutral: "#F7FAFC"
  surface: "#FFFFFF"
  text-primary: "#072033"
  text-secondary: "#42586E"
  text-muted: "#64748B"
  border: "#E2E8F0"
  state-critical: "#B91C1C"
  state-reorder: "#B45309"
  state-ok: "#047857"
  state-overstock: "#C2410C"
  state-dead: "#475569"
  state-insufficient: "#0369A1"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
  number-tabular:
    fontFamily: JetBrains Mono
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#075E85"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px
  badge-critical:
    backgroundColor: "#FEF2F2"
    textColor: "{colors.state-critical}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-reorder:
    backgroundColor: "#FFFBEB"
    textColor: "{colors.state-reorder}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-ok:
    backgroundColor: "#ECFDF5"
    textColor: "{colors.state-ok}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-overstock:
    backgroundColor: "#FFF7ED"
    textColor: "{colors.state-overstock}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-dead:
    backgroundColor: "#F1F5F9"
    textColor: "{colors.state-dead}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-insufficient:
    backgroundColor: "#F0F9FF"
    textColor: "{colors.state-insufficient}"
    rounded: "{rounded.full}"
    padding: 8px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: 24px
  caption-muted:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: 8px
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: 1px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Laku (`laku.muaraai.com`) adalah restock engine untuk seller UMKM: mayoritas pemakai membuka dashboard dari HP di ruang terang (rumah, warung, gudang), dan isinya dominan angka serta tabel padat. Karena itu identitas visualnya **light-first** — dan karena tim frontend hanya punya 4 hari, dark mode sengaja tidak dibuat sekarang. Sebagai gantinya seluruh komponen memakai **semantic tokens** (tiga lapis: primitive → semantic → component), sehingga dark mode kelak cukup menambah satu set nilai, tanpa refactor komponen.

Keluarga warna mewarisi identitas MuaraAI: Estuary Canvas sebagai kanvas terang, River Current Blue sebagai satu-satunya accent, Deep Riverbed Ink untuk teks. Satu accent per halaman, tanpa gradien dekoratif.

## Colors

- **Primary (#0369A1, River Current Blue):** satu-satunya warna interaksi — tombol utama, link, item aktif, focus ring. Warisan brand MuaraAI.
- **Secondary (#072033, Deep Riverbed Ink):** teks utama dan heading. Off-black, bukan `#000000`.
- **Neutral (#F7FAFC, Estuary Canvas):** latar halaman. Off-white, bukan `#FFFFFF`.
- **Surface (#FFFFFF):** kartu dan panel. Hierarki permukaan: canvas → surface → border `#E2E8F0`.
- **Warna status (semantic, bukan accent):** CRITICAL `#DC2626` · REORDER `#D97706` · OK `#059669` · OVERSTOCK `#EA580C` · DEAD `#64748B` · INSUFFICIENT_DATA `#0284C7`.

Aturan status (FR-8, mengikat): warna status **tidak pernah berdiri sendiri** — selalu berpasangan ikon + label Indonesia ("Segera pesan", "Aman", dst). Warna adalah penguat, bukan pembawa informasi.

## Typography

Tiga keluarga, self-hosted (liar dari font CDN):

- **Space Grotesk** — heading dan angka display (H1–H3). Karakter geometris ringan, nyambung ke identitas MuaraAI.
- **Inter** — body, label, UI text. `text-secondary #42586E` untuk body, `text-muted #64748B` hanya untuk caption.
- **JetBrains Mono** — semua angka bisnis (omzet, qty, ROP, persen) dengan `font-variant-numeric: tabular-nums`. Angka uang rata kanan.

Batas: tidak ada serif, tidak ada gradien text, heading tidak melebihi 2.25rem di dalam dashboard (landing page boleh lebih besar).

## Layout

- Spacing scale kelipatan 4: `4 / 8 / 16 / 24 / 32 / 48`. Jarak antar-section dashboard 24–32px.
- Konten dashboard dalam kontainer `max-w-[1400px]`, padding halaman 16px (mobile) / 24px (desktop).
- Radius konsisten: input & badge kecil 8px, tombol & kartu 12–16px, pill status full. Satu sistem, tanpa campuran.
- Desktop: sidebar kiri (±240px). Mobile <768px: bottom tab bar maksimal 5 tab, target sentuh minimal 44px.
- Kartu hanya untuk elevasi yang bermakna; kalau bisa, kelompokkan dengan `border-t` / spasi, bukan kotak di dalam kotak.

## Elevation

Shadow di-tint ke warna kanvas, tidak pernah hitam murni: `0 1px 2px rgba(7,32,51,0.06), 0 8px 24px rgba(7,32,51,0.08)` untuk kartu terangkat. Level: flat (border saja) → card (shadow di atas) → overlay/modal (shadow lebih dalam + `backdrop` `rgba(7,32,51,0.4)`).

## Components

- `button-primary` — satu aksi utama per layar. Hover: `#075E85`. `:active` turun 1px (`translate-y-[1px]`).
- `button-secondary` — outline biru di atas surface putih.
- `badge-*` — enam status engine, masing-masing bg tint + teks warna status + ikon + label. Label teks WAJIB, warna opsional bagi yang buta warna.
- `card` — surface putih, radius 16, padding 24. Isi angka memakai `number-tabular`.
- `input` — label DI ATAS input (bukan placeholder-sebagai-label), helper text di bawah, error merah `#DC2626` di bawahnya. Focus ring: 2px `#0369A1` offset 2px.

## Motion

Sprint 4 hari → motion fungsional minimal: transisi state (badge berganti) 150–200ms ease-out, `:active` push 1px, skeleton loader saat import berjalan. Tanpa animasi loop dekoratif. Semua animasi hormati `prefers-reduced-motion` (mati total).

## Voice and Tone

Bahasa Indonesia lugas khas seller: "Restock 40 unit", bukan "Optimalkan inventory pipeline". Angka selalu bisa dijelaskan asalnya (panel "mengapa"). Istilah teknis dilarang menggantikan istilah pasar: "stok" bukan "inventory", "laku" bukan "terjual dengan performa baik". Error message menyebut solusi, bukan hanya kode.

## Dos and Don'ts

- **Do:** komponen selalu pakai semantic token (`var(--surface)`), bukan hex langsung.
- **Do:** angka bisnis dalam JetBrains Mono tabular, rata kanan.
- **Do:** badge status = warna + ikon + label, tiga-tiganya.
- **Don't:** dark mode ad-hoc sebelum set nilai dark resmi ditulis (P1).
- **Don't:** accent kedua, gradien dekoratif, glow, `#000`/`#FFF` murni.
- **Don't:** emoji sebagai ikon UI — pakai Material Symbols Rounded (self-hosted), `aria-hidden` untuk dekoratif.
- **Don't:** placeholder tanpa label di atasnya; placeholder bukan label.
