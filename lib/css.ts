import type { CSSProperties } from "react";

/** Typed helper for CSS custom properties in `style`. */
export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;
