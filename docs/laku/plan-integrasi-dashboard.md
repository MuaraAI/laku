# Rencana Integrasi Dashboard → Next.js Root (Route Group `(dashboard)`)

Target: pindahkan `laku-dashboard/` (Vite SPA) ke dalam Next.js root sebagai
route group `app/(dashboard)/`, sehingga satu deploy Vercel melayani landing +
login + dashboard. Lalu hapus folder `laku-dashboard/`.

---

## Prinsip (ponytail)

- Dashboard = "app di dalam app": butuh **style isolation** karena punya
  design system sendiri (Space Grotesk/Inter, token --primary River Blue)
  yang berbeda dari landing (Google Sans Flex, monokrom+kuning).
- Jangan gabung CSS global — konflik (dua-duanya punya reset body/html).
  Solusi: CSS Modules per komponen ATAU scope semua selector dashboard di
  bawah wrapper `.dash` (satu file CSS diimpor di layout dashboard).
- Routing internal dashboard via `useState` (sudah begitu di App.tsx) —
  JANGAN diubah jadi Next router. Cukup 1 route: `/dashboard`.

---

## Langkah

### 1. Pindahkan aset & kode (tanpa mengubah logika)

```
app/(dashboard)/dashboard/page.tsx   ← baru: "use client" wrapper, render <DashboardApp/>
app/(dashboard)/dashboard.css        ← dari laku-dashboard/src/styles.css
                                       (scope: semua selector di-prefix .dash)
components/dashboard/App.tsx         ← dari laku-dashboard/src/App.tsx
components/dashboard/components.tsx  ← dari laku-dashboard/src/components.tsx
components/dashboard/icons.tsx       ← dari laku-dashboard/src/icons.tsx
components/dashboard/pages/*.tsx     ← 4 file halaman
public/fonts/*.woff2                 ← 3 font dashboard (self-hosted, aman)
```

### 2. Penyesuaian minimal

a. `App.tsx`: ganti `'./pages/X'` → `'./pages/X'` (tetap, karena ikut pindah
   bersama), hapus `useEffect` yang set `document.title/lang` (sudah di
   layout Next.js), hapus guard localStorage (optional keep).

b. `styles.css` → `dashboard.css`:
   - Semua selector top-level di-scope: `.app-shell` → `.dash .app-shell`, dst
     (cukup cari-replace: setiap selector di awal baris ditambah prefix `.dash `).
   - Hapus `@font-face` duplikat JetBrains Mono (sudah ada di root theme);
     Space Grotesk/Inter boleh tetap (font khusus dashboard).
   - Hapus reset `* {}`/`html {}`/`body {}` global (bentrok dengan landing) —
     pindahkan propertinya ke `.dash` root.

c. `page.tsx`:
```tsx
import "@/app/(dashboard)/dashboard.css";
import { DashboardApp } from "@/components/dashboard/App";

export const metadata = { title: "Dashboard — Laku" };

export default function DashboardPage() {
  return <DashboardApp />;
}
```

d. Middleware auth guard (opsional MVP): kalau sesi Supabase tidak ada,
   redirect ke `/login`. Untuk hackathon boleh dilewati (dashboard demo
   data-only), dicatat sebagai TODO.

### 3. Bersih-bersih

- `git rm -r laku-dashboard/` (termasuk dist/, cover.png, package-lock).
- Root `package.json`: tidak ada dependency baru (dashboard hanya butuh
  react/react-dom yang sudah ada — Vite/vitest hilang bersama folder).
- CI: hapus step "Build Frontend — laku-dashboard Vite" di `ci.yml`
  (build Next.js root sudah mencakup semuanya).

### 4. Verifikasi

- `npm run build` PASS — `/dashboard` muncul sebagai route.
- Landing `/`, `/login`, `/tos`, `/privacy` tidak berubah visual (CSS
  dashboard ter-scope).
- `/dashboard` render: onboarding → restock → penjualan → upload.
- Mobile 375px: bottom tabs tampil, no horizontal scroll.
- CI green, Vercel deploy completed.

---

## Estimasi: 1–2 jam kerja (kebanyakan prefix CSS + verifikasi visual).
## Urutan merge: sebelum freeze 7 Okt 18:00 (agar demo video pakai satu URL).
