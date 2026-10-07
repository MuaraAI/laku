"use client";

// Dashboard mode DEMO — data contoh tanpa login. Path terpisah dari /dashboard
// (Toko Saya / live) supaya kedua mode punya URL masing-masing.

import { useEffect } from "react";
import DashboardApp from "@/components/dashboard/App";
import "@/app/(dashboard)/dashboard.css";

export default function DemoDashboardPage() {
  // sinkronkan bahasa dokumen saat dashboard aktif (dashboard pakai bahasa Indonesia)
  useEffect(() => {
    document.documentElement.lang = "id";
  }, []);

  return (
    <div className="dash">
      <DashboardApp mode="demo" />
    </div>
  );
}
