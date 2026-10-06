"use client";

import { useEffect } from "react";
import { hasMotion } from "@/lib/motion";

/** Adds `.in` to [data-reveal] / [data-split] blocks as they scroll into view. Mount once per page. */
export default function RevealObserver() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-split]"));
    const show = (el: Element) => el.classList.add("in");
    if (!hasMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          show(e.target);
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
