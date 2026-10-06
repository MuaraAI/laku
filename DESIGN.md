---
version: 1.0.0
name: Laku
description: MuaraAI Laku — light-first restock engine untuk seller UMKM. Keluarga warna sungai MuaraAI (River Current Blue di Estuary Canvas), arsitektur ledger rail & crosshairs, angka tabular JetBrains Mono, state berwarna selalu berpasangan ikon dan label. Dark-ready via semantic tokens.
colors:
  primary: "#0369A1"
  primary-hover: "#075E85"
  primary-soft: "#F0F9FF"
  primary-tint: "#E0F2FE"
  secondary: "#072033"
  neutral: "#F7FAFC"
  subtle: "#EEF3F7"
  surface: "#FFFFFF"
  surface-glass: "rgba(255, 255, 255, 0.88)"
  text-primary: "#072033"
  text-secondary: "#42586E"
  text-muted: "#64748B"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  state-critical: "#B91C1C"
  state-critical-bg: "#FEF2F2"
  state-reorder: "#B45309"
  state-reorder-bg: "#FFFBEB"
  state-ok: "#047857"
  state-ok-bg: "#ECFDF5"
  state-overstock: "#C2410C"
  state-overstock-bg: "#FFF7ED"
  state-dead: "#475569"
  state-dead-bg: "#F1F5F9"
  state-insufficient: "#0369A1"
  state-insufficient-bg: "#F0F9FF"
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
    padding: 12px 18px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px 18px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px 18px
  badge-critical:
    backgroundColor: "{colors.state-critical-bg}"
    textColor: "{colors.state-critical}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-reorder:
    backgroundColor: "{colors.state-reorder-bg}"
    textColor: "{colors.state-reorder}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-ok:
    backgroundColor: "{colors.state-ok-bg}"
    textColor: "{colors.state-ok}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-overstock:
    backgroundColor: "{colors.state-overstock-bg}"
    textColor: "{colors.state-overstock}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-dead:
    backgroundColor: "{colors.state-dead-bg}"
    textColor: "{colors.state-dead}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-insufficient:
    backgroundColor: "{colors.state-insufficient-bg}"
    textColor: "{colors.state-insufficient}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: 12px 14px
---

# Laku Design System Specification

## 1. Overview & Filosofi Desain
Laku (`laku.muaraai.com`) adalah restock engine untuk seller multi-marketplace (Shopee, TikTok Shop, Tokopedia). Sistem ini menggabungkan presisi operasional logistik dengan antarmuka modern bernuansa **Ledger-Grid Industrial & Anti-Slop**.

- **Light-First**: Mayoritas seller membuka dashboard dari layar HP di lingkungan kerja terang (warung, ruko, gudang).
- **Zero Hex di Komponen**: Komponen antarmuka 100% wajib memakai semantic CSS variable (`var(--surface)`, `var(--primary)`).
- **MuaraAI River Family**: Kanvas lembut *Estuary Canvas*, teks pekat *Deep Riverbed Ink*, dan satu aksen fungsional *River Current Blue*.
- **No AI Hallucination Slop**: Angka bisnis hanya berasal dari formula deterministik PRD §9A; antarmuka mencerminkan presisi kalkulasi tanpa grafik dekoratif palsu.

---

## 2. Color Palette & Semantics

### Base Surfaces & Ink
- **Canvas (`#F7FAFC`, Estuary Canvas)**: Latar belakang seluruh halaman, sejuk dan tidak menyilaukan.
- **Subtle (`#EEF3F7`)**: Permukaan recessed untuk pemisah section atau latar sekunder.
- **Surface (`#FFFFFF`)**: Kartu, modal dialog, dan panel formulir.
- **Surface Glass (`rgba(255, 255, 255, 0.88)`)**: Efek glassmorphism pada floating capsule header dengan `backdrop-filter: blur(14px)`.
- **Text Primary / Secondary (`#072033` / `#42586E`)**: Deep Riverbed Ink. Kontras tinggi WCAG AAA (>15:1).
- **Text Muted (`#64748B`)**: Keterangan sekunder, metadata baris, atau unit satuan.
- **Border (`#E2E8F0` / `#CBD5E1`)**: Garis batas kartu dan pemisah ledger rail.

### Interaction Accent
- **Primary (`#0369A1`, River Current Blue)**: Satu-satunya warna interaksi utama untuk CTA, tombol submit, link hover, focus ring, dan status aktif.
- **Primary Hover (`#075E85`)**: State hover tombol primer.
- **Primary Soft (`#F0F9FF`) & Tint (`#E0F2FE`)**: Latar belakang hover menu dan border pill navigasi.

### Status Deterministik Engine (§9A / FR-8)
Warna status tidak pernah berdiri sendiri — **wajib berpasangan: Warna + Ikon Material Symbols + Label Teks**:
- **CRITICAL** (`#B91C1C` / bg `#FEF2F2` / ikon `error`): Stok habis atau di bawah safety stock.
- **REORDER** (`#B45309` / bg `#FFFBEB` / ikon `warning`): Capai Reorder Point (ROP).
- **OK** (`#047857` / bg `#ECFDF5` / ikon `check_circle`): Kuantitas stok aman.
- **OVERSTOCK** (`#C2410C` / bg `#FFF7ED` / ikon `inventory_2`): Stok berlebih > 60 hari.
- **DEAD** (`#475569` / bg `#F1F5F9` / ikon `hourglass_disabled`): Tidak ada penjualan > 60 hari.
- **INSUFFICIENT** (`#0369A1` / bg `#F0F9FF` / ikon `help`): Riwayat penjualan < 30 hari.

---

## 3. Tipografi & Hierarki
Pemuatan font self-hosted via `next/font` (zero external font CDN request):
1. **Space Grotesk** (`--font-display`): Digunakan untuk Heading (`h1`, `h2`, `h3`), wordmark, dan judul fitur. Berkarakter geometris, modern, dan operasional.
2. **Inter** (`--font`): Digunakan untuk body copy, label input, dialog explanation, dan navigasi.
3. **JetBrains Mono** (`--mono`): Wajib untuk semua angka bisnis, rupiah, kuantitas, rumus ROP, dan tanggal dengan atribut `tabular-nums` dan rata kanan (`text-right`).

---

## 4. Sistem Layout: Ledger Rail & Crosshairs

- **Ledger Rail (`.rail`)**:
  - Kontainer utama dengan batas maksimal `max-width: 1280px` diapit garis vertikal kiri dan kanan (`border-inline: 1px solid var(--border)`).
  - Memberi kesan lembar pembukuan atau continuous receipt fisik.
- **Technical Crosshairs (`.x`)**:
  - Tanda silang teknis ukuran 11×11px (`.x.tl`, `.x.tr`) di setiap perpotongan sudut section untuk estetika blueprint teknik presisi.
- **Fluid Spacing Scale**:
  - `--pad: clamp(16px, 3.6vw, 48px)`: Padding fleksibel yang menyesuaikan proporsional dari mobile 360px ke layar lebar.

---

## 5. Komponen Khas (Component Patterns)

### Floating Capsule Header (`Header.tsx`)
- Tampil lebar penuh di posisi atas layar (`scrollY = 0`).
- Saat di-scroll > 8px, mengecil menjadi kapsul mengambang (`max-width: 980px`) dengan `backdrop-filter: blur(14px)`.
- Dilengkapi **gliding hover pill** (`.nav-pill`) yang meluncur mengikuti posisi kursor antar menu navigasi.
- Mobile: Kapsul auto-hide saat di-scroll ke bawah dan muncul kembali saat di-scroll ke atas.

### Interactive Button Flood (`.btn-flood`)
- Tombol sekunder interaktif: memiliki badge lingkaran berpanah di sisi kanan.
- Saat di-hover, lingkaran membesar eksponensial (`transform: scale(24)`) membanjiri seluruh tombol dengan warna primer, sementara panah berputar/bergulir vertikal (`.go-win`).

### Data Pipeline Visualizer (`Features.tsx`)
- Menggunakan diagram alur SVG real-time yang memvisualisasikan bagaimana file Shopee, TikTok, dan Tokopedia masuk, dibersihkan dari PII, dan diproses oleh core deterministik.
- Paket data bergerak dinamis menggunakan animasi SMIL sinkron, nonaktif otomatis jika OS mengaktifkan `prefers-reduced-motion`.

### Brand Anatomy Exploder (`BrandDialog.tsx`)
- Dialog interaktif yang membedah simbol Laku: sudut oktagonal luar, bracket rak huruf L, kotak stok gudang, dan kotak bayangan incoming supply.

---

## 6. Elevasi & Shadow
- Shadow selalu diwarnai rona tinta kanvas, bukan hitam pekat:
  - Card Shadow: `0 1px 2px rgba(7, 32, 51, 0.06), 0 8px 24px rgba(7, 32, 51, 0.08)`
  - Raised / Modal Shadow: `0 2px 4px rgba(7, 32, 51, 0.06), 0 16px 40px rgba(7, 32, 51, 0.12)`
  - Scrim Backdrop: `rgba(7, 32, 51, 0.4)`

---

## 7. Motion & Accessibility Standards

- **Motion Curves**:
  - Standard ease: `cubic-bezier(.2, 0, 0, 1)`
  - Out deceleration: `cubic-bezier(.16, 1, .3, 1)`
  - Emphasized entrance: `cubic-bezier(.05, .7, .1, 1)`
- **Reduced Motion First**:
  - Skrip inline `motionFlag` dieksekusi sebelum first-paint di `app/layout.tsx`. Jika pengguna mengaktifkan preferensi reduced motion di sistem operasi, seluruh animasi transisi dinonaktifkan tanpa visual flash.
- **Anti-Emoji Rule**:
  - Dilarang keras menggunakan emoji sebagai ikon UI. Seluruh ikon menggunakan font *Material Symbols Rounded* (`.ms`).
- **Touch Target**:
  - Target sentuh tombol dan baris menu interaktif minimal 44×44px di mobile viewport.
