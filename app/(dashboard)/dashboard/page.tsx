"use client";

// Dashboard Laku — port dari laku-dashboard/ (Vite SPA) ke Next.js root.
// Routing internal via useState (tanpa router lib — YAGNI untuk MVP).
// CSS ter-scope di bawah wrapper .dash (lihat dashboard.css).

import { useEffect } from "react";
import DashboardApp from "@/components/dashboard/App";
import "@/app/(dashboard)/dashboard.css";

export default function DashboardPage() {
  // sinkronkan bahasa dokumen saat dashboard aktif (dashboard pakai bahasa Indonesia)
  useEffect(() => {
    document.documentElement.lang = "id";
  }, []);

  return (
    <div className="dash">
      <DashboardApp />
    </div>
  );
}
