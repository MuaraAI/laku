// Client-only helpers: import from "use client" components.

/** True unless the user prefers reduced motion (flag set in app/layout.tsx before paint). */
export const hasMotion = () => document.documentElement.classList.contains("js");

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
