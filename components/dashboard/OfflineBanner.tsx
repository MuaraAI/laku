"use client";

import { useEffect, useState } from "react";
import { errorPages } from "@/constants/id";
import { IconWarning } from "./icons";

/** Banner koneksi: offline → peringatan tetap; kembali online → info singkat 4 detik. */
export default function OfflineBanner() {
  const [state, setState] = useState<"online" | "offline" | "back">("online");

  useEffect(() => {
    let timer: number | undefined;
    const goOffline = () => {
      window.clearTimeout(timer);
      setState("offline");
    };
    const goOnline = () => {
      setState("back");
      timer = window.setTimeout(() => setState("online"), 4000);
    };
    if (!navigator.onLine) setState("offline");
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (state === "online") return null;
  return (
    <div className={`net-banner ${state === "offline" ? "is-off" : "is-back"}`} role={state === "offline" ? "alert" : "status"}>
      <IconWarning size={16} />
      <span>{state === "offline" ? errorPages.offline : errorPages.backOnline}</span>
    </div>
  );
}
