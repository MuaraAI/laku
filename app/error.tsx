"use client";

import { useEffect } from "react";
import ErrorScreen from "@/components/errors/ErrorScreen";
import { errorPages } from "@/constants/id";

/** Error render di halaman mana pun (di dalam layout root). `reset` merender ulang segmen tanpa reload. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // digest = id error di log server Next; pesan lengkap tidak ditampilkan ke pengguna
    console.error("Laku route error", error.digest ?? error.name);
  }, [error]);
  const t = errorPages.crash;
  return (
    <ErrorScreen
      code={t.code}
      title={t.title}
      body={t.body}
      showSupport
      actions={
        <button className="btn btn-primary" type="button" onClick={reset}>
          {t.retry}
        </button>
      }
    />
  );
}
