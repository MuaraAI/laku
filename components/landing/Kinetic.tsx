"use client";

import { Fragment, useEffect, useRef } from "react";
import { kinetic } from "@/constants/id";
import { clamp, hasMotion, replayClass, useScrollFrame } from "@/lib/motion";

// characters live inside word wrappers so words never break across lines
function Chars({ text }: { text: string }) {
  return text.split(" ").map((w, wi) => (
    <Fragment key={wi}>
      {wi > 0 && " "}
      <span className="kw">
        {w.split("").map((c, ci) => (
          <span className="ch" key={ci}>
            {c}
          </span>
        ))}
      </span>
    </Fragment>
  ));
}

export default function Kinetic() {
  const wrapRef = useRef<HTMLParagraphElement>(null);
  const smileRef = useRef<HTMLSpanElement>(null);

  // fit the font so the longest line spans the container exactly
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

  // letters rise in one by one while the band enters; fully readable by mid-screen
  useScrollFrame(() => {
    const wrap = wrapRef.current, smile = smileRef.current;
    if (!wrap || !smile || !hasMotion()) return;
    const vh = innerHeight;
    const kp = clamp((vh - wrap.getBoundingClientRect().top) / (vh * 0.6), 0, 1);
    const off = Math.pow(1 - kp, 2) * Math.min(innerWidth * 0.08, 90);
    wrap.querySelectorAll<HTMLElement>("[data-kinetic]").forEach((el) => {
      el.style.transform = `translate3d(${(Number(el.dataset.kinetic) * off).toFixed(1)}px,0,0)`;
    });
    wrap.querySelectorAll<HTMLElement>("[data-chars]").forEach((line, li) => {
      const chars = line.querySelectorAll<HTMLElement>(".ch");
      const n = chars.length, base = li ? 0.3 : 0, span = li ? 0.45 : 0.55;
      chars.forEach((ch, i) => {
        const l = clamp((kp - base - (i / n) * span) / 0.3, 0, 1);
        const e = 1 - Math.pow(1 - l, 3);
        ch.style.opacity = e.toFixed(3);
        ch.style.transform = e >= 1 ? "" : `translate3d(0,${((1 - e) * 60).toFixed(1)}%,0) rotate(${((1 - e) * -12).toFixed(1)}deg)`;
      });
    });
    if (kp > 0.97) smile.classList.add("in");
    else if (kp < 0.2) smile.classList.remove("in");
  });

  return (
    <div className="kinetic">
      <p className="k-wrap" aria-label={kinetic.aria} ref={wrapRef}>
        <span className="k-line" data-kinetic="-1" aria-hidden="true">
          <span className="k-text" data-chars="">
            <Chars text={kinetic.line1} />
          </span>
        </span>
        <span className="k-line r" data-kinetic="1" aria-hidden="true">
          <span className="k-text">
            <span data-chars="">
              <Chars text={kinetic.line2} />
            </span>
            <span className="smile" ref={smileRef} onClick={(e) => replayClass(e.currentTarget, "in")}>
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
