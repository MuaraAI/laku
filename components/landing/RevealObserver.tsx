"use client";

import { useEffect } from "react";
import { countUp, hasMotion, REVEAL_EVENT } from "@/lib/motion";

function reveal(el: HTMLElement) {
  el.classList.add("in");
  const counters = el.matches("[data-count]") ? [el] : Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
  counters.forEach((c) => countUp(c, Number(c.dataset.count), c.dataset.fmt === "id"));
  el.dispatchEvent(new CustomEvent(REVEAL_EVENT));
}

/** Adds `.in` to [data-reveal], [data-split] and crosshairs as they scroll into view. Mount once per page. */
export default function RevealObserver() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-split], .x"));
    if (!hasMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target as HTMLElement);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
