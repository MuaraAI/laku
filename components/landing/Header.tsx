"use client";

import Link from "next/link";
import { useState } from "react";
import { nav, routes } from "@/constants/id";
import { Icon, LakuMark } from "./primitives";

export default function Header() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const close = () => setSheetOpen(false);

  return (
    <>
      <header className="site-hdr">
        <div className="site-hdr-in">
          <Link className="brandlink" href={routes.home} aria-label={nav.home} onClick={close}>
            <LakuMark />
            <span className="logo-name">{nav.brandName}</span>
          </Link>
          <nav className="site-nav" aria-label={nav.ariaMain}>
            {nav.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="site-actions">
            <Link className="site-login" href={routes.login}>
              {nav.login}
            </Link>
            <Link className="btn btn-primary" href={routes.login}>
              {nav.cta}
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
          </a>
        ))}
        <Link className="btn btn-outline" href={routes.login} onClick={close}>
          {nav.loginGoogle}
        </Link>
      </div>
    </>
  );
}
