"use client";

import "./globals.css";
import ErrorScreen from "@/components/errors/ErrorScreen";
import { errorPages } from "@/constants/id";

/** Jaring terakhir: error di layout root sendiri. Wajib merender <html>/<body> sendiri. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = errorPages.crash;
  return (
    <html lang="id">
      <body>
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
      </body>
    </html>
  );
}
