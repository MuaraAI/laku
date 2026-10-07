"use client";

import { useEffect } from "react";
import { hasMotion } from "@/lib/motion";

const SELECTOR = "[data-reveal], [data-split]";

/**
 * Adds `.in` to [data-reveal] / [data-split] blocks as they scroll into view and drops it once they
 * have fully left the viewport, so the entrance replays whether the reader scrolls down or back up.
 * Blocks rendered later (dashboard pages after the setup wizard, rows after a search or filter, a new
 * period's chart) are picked up through a MutationObserver; without it they would stay at opacity 0.
 * Mount once per page.
 */
export default function RevealObserver() {
  useEffect(() => {
    const collect = (root: Element | Document) => {
      const found = root instanceof Element && root.matches(SELECTOR) ? [root] : [];
      return found.concat(Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)));
    };

    const motion = hasMotion() && "IntersectionObserver" in window;
    const io = motion
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting && e.intersectionRatio >= 0.12) e.target.classList.add("in");
              else if (!e.isIntersecting) e.target.classList.remove("in");
            });
          },
          { threshold: [0, 0.12] },
        )
      : null;
    const watch = (el: Element) => (io ? io.observe(el) : el.classList.add("in"));

    collect(document).forEach(watch);
    const mo = new MutationObserver((records) => {
      records.forEach((r) => {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) collect(n).forEach(watch);
        });
        // stop tracking rows that a filter or page switch removed
        if (io) r.removedNodes.forEach((n) => n instanceof Element && collect(n).forEach((el) => io.unobserve(el)));
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);
  return null;
}
