"use client";

import { useEffect, useRef } from "react";
import { kinetic } from "@/constants/id";
import { clamp } from "@/lib/motion";

export default function Kinetic() {
  const wrapRef = useRef<HTMLParagraphElement>(null);

  // fit the font so the longest line spans the container exactly (layout only, no motion)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const fit = () => {
      const cs = getComputedStyle(wrap);
      const avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const lines = Array.from(wrap.querySelectorAll<HTMLElement>(".k-line"));
      const texts = Array.from(wrap.querySelectorAll<HTMLElement>(".k-text"));
      const widest = () => Math.max(...texts.map((t) => t.offsetWidth));
      lines.forEach((l) => (l.style.fontSize = "100px"));
      let size = clamp((100 * avail) / widest(), 26, 220);
      lines.forEach((l) => (l.style.fontSize = ""));
      wrap.style.setProperty("--kfs", `${size.toFixed(1)}px`);
      // second pass: optical sizing changes glyph widths at large sizes
      size = clamp((size * avail) / widest(), 26, 220);
      wrap.style.setProperty("--kfs", `${size.toFixed(1)}px`);
    };
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  return (
    <div className="kinetic">
      <p className="k-wrap" aria-label={kinetic.aria} ref={wrapRef}>
        <span className="k-line" aria-hidden="true">
          <span className="k-text">{kinetic.line1}</span>
        </span>
        <span className="k-line r" aria-hidden="true">
          <span className="k-text">
            {kinetic.line2}
            <span className="smile">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" />
                <ellipse className="eye" cx="35" cy="40" rx="5.5" ry="8" />
                <ellipse className="eye" cx="65" cy="40" rx="5.5" ry="8" />
                <path className="mouth" d="M29 58 Q50 80 71 58" />
              </svg>
            </span>
          </span>
        </span>
      </p>
    </div>
  );
}
