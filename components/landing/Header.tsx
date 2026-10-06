"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav, routes } from "@/constants/id";
import { Icon, LakuMark } from "./primitives";

/**
 * Floating capsule nav (Linear / Vercel style): it tightens and lifts once the page scrolls,
 * a highlight pill glides between links on hover, and the link of the section in view stays marked.
 */
export default function Header() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const close = () => setSheetOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // scroll spy: the section crossing the upper third of the viewport owns the marker
  useEffect(() => {
    const ids = nav.links.map((l) => l.href.split("#")[1]);
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const movePill = (el: HTMLElement) => {
    const box = navRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (box) setPill({ x: r.left - box.left, w: r.width });
  };

  return (
    <>
      <header className={`site-hdr${scrolled ? " scrolled" : ""}${sheetOpen ? " open" : ""}`}>
        <div className="site-hdr-in">
          <Link className="brandlink" href={routes.home} aria-label={nav.home} onClick={close}>
            <LakuMark />
            <span className="logo-name">{nav.brandName}</span>
          </Link>
          <nav className="site-nav" aria-label={nav.ariaMain} ref={navRef} onMouseLeave={() => setPill(null)}>
            <span
              className={`nav-pill${pill ? " on" : ""}`}
              aria-hidden="true"
              style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w } : undefined}
            />
            {nav.links.map((l) => {
              const isActive = active === l.href.split("#")[1];
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={isActive ? "active" : undefined}
                  aria-current={isActive ? "location" : undefined}
                  onMouseEnter={(e) => movePill(e.currentTarget)}
                  onFocus={(e) => movePill(e.currentTarget)}
                  onBlur={() => setPill(null)}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
          <div className="site-actions">
            <Link className="site-login" href={routes.login}>
              {nav.login}
            </Link>
            <Link className="btn btn-primary site-cta" href={routes.login}>
              {nav.cta}
              <Icon name="arrow_forward" />
            </Link>
            <button
              className="site-menu"
              aria-expanded={sheetOpen}
              aria-controls="sheet"
              aria-label={sheetOpen ? nav.menuClose : nav.menuOpen}
              onClick={() => setSheetOpen((o) => !o)}
            >
              <Icon name={sheetOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>
      <div className={`sheet${sheetOpen ? " open" : ""}`} id="sheet">
        {nav.links.map((l) => (
          <a key={l.href} className="row" href={l.href} onClick={close}>
            {l.label}
            <Icon name="arrow_forward" />
          </a>
        ))}
        <Link className="btn btn-outline" href={routes.login} onClick={close}>
          {nav.loginGoogle}
        </Link>
      </div>
    </>
  );
}
