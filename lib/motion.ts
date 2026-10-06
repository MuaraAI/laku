import { useEffect, useRef } from "react";

// Client-only helpers: import from "use client" components.

/** True unless the user prefers reduced motion (flag set in app/layout.tsx before paint). */
export const hasMotion = () => document.documentElement.classList.contains("js");

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Dispatched on an element when it scrolls into view (see RevealObserver). */
export const REVEAL_EVENT = "laku:reveal";

/** Restart a CSS animation that is driven by a class. */
export function replayClass(el: Element, cls: string) {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

export function countUp(el: HTMLElement, target: number, locale = false) {
  const show = (v: number) => {
    el.textContent = locale ? v.toLocaleString("id-ID") : String(v);
  };
  if (!hasMotion()) return show(target);
  const t0 = performance.now();
  const dur = 1300;
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / dur);
    show(Math.round(target * (1 - Math.pow(1 - t, 4))));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Calls `frame` once on mount and then at most once per animation frame on scroll/resize. */
export function useScrollFrame(frame: () => void) {
  const ref = useRef(frame);
  ref.current = frame;
  useEffect(() => {
    let ticking = false;
    const run = () => {
      ticking = false;
      ref.current();
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(run);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", run);
    run();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", run);
    };
  }, []);
}
