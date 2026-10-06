"use client";

import { useRef, useState } from "react";
import { nav } from "@/constants/id";
import { clamp, useScrollFrame } from "@/lib/motion";
import { BrandButton } from "./BrandDialog";
import { Icon, LakuMark } from "./primitives";

export default function Header() {
  const progressRef = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useScrollFrame(() => {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progressRef.current?.style.setProperty("--p", String(max > 0 ? clamp(scrollY / max, 0, 1) : 0));
    let cur: string | null = null;
    nav.links.forEach(({ spy }) => {
      const s = document.getElementById(spy);
      if (s && s.getBoundingClientRect().top < vh * 0.4) cur = spy;
    });
    setCurrent(cur);
  });

  return (
    <>
      <header className="hdr">
        <div className="rail">
          <BrandButton className="cell logo">
            <LakuMark />
            <span className="logo-name">{nav.brandName}</span>
            <span className="sr-only">{nav.brandHintSr}</span>
          </BrandButton>
          <nav className="nav" aria-label={nav.ariaMain}>
            {nav.links.map((l) => (
              <a key={l.spy} className="cell" href={l.href} aria-current={current === l.spy ? "true" : undefined}>
                {l.label}
                <sup>{l.no}</sup>
              </a>
            ))}
          </nav>
          <span className="grow" aria-hidden="true" />
          <a className="cell login" href="#masuk">
            {nav.login}
          </a>
          <a className="cell cta" href="#coba">
            {nav.cta}
            <Icon name="arrow_forward" />
          </a>
          <button
            className="cell menu"
            aria-expanded={sheetOpen}
            aria-controls="sheet"
            aria-label={sheetOpen ? nav.menuClose : nav.menuOpen}
            onClick={() => setSheetOpen((o) => !o)}
          >
            <Icon name={sheetOpen ? "close" : "menu"} />
          </button>
        </div>
        <span className="progress" aria-hidden="true" ref={progressRef} />
      </header>
      <div className={`sheet${sheetOpen ? " open" : ""}`} id="sheet">
        {nav.links.map((l) => (
          <a key={l.spy} className="row" href={l.href} onClick={() => setSheetOpen(false)}>
            {l.label} <sup>{l.no}</sup>
          </a>
        ))}
        <a className="btn btn-outline" href="#masuk" onClick={() => setSheetOpen(false)}>
          {nav.loginGoogle}
        </a>
      </div>
    </>
  );
}
