"use client";

import { useEffect } from "react";
import { hasMotion } from "@/lib/motion";

/**
 * Adds `.in` to [data-reveal] / [data-split] blocks as they scroll into view and drops it once they
 * have fully left the viewport, so the entrance replays whether the reader scrolls down or back up.
 * Mount once per page.
 */
export default function RevealObserver() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-split]"));
    if (!hasMotion() || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.12) e.target.classList.add("in");
          else if (!e.isIntersecting) e.target.classList.remove("in");
        });
      },
      { threshold: [0, 0.12] },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
