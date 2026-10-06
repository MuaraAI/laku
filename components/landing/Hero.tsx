"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/constants/id";
import { cssVars } from "@/lib/css";
import { hasMotion, REVEAL_EVENT, replayClass } from "@/lib/motion";
import { AssumptionBadge, Icon, SplitText, StatusBadge } from "./primitives";

export default function Hero() {
  const panelRef = useRef<HTMLElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);

  // the yellow box travels from supplier to warehouse
  const ship = () => {
    const route = routeRef.current, from = fromRef.current, to = toRef.current;
    if (!hasMotion() || !route || !from || !to) return;
    route.style.setProperty("--from", `${from.offsetLeft + from.offsetWidth + 6}px`);
    route.style.setProperty("--to", `${to.offsetLeft - 18}px`);
    replayClass(route, "run");
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onReveal = () => {
      routeRef.current?.classList.add("drawn");
      if (hasMotion()) timer = setTimeout(ship, 1100);
    };
    panel.addEventListener(REVEAL_EVENT, onReveal);
    return () => {
      panel.removeEventListener(REVEAL_EVENT, onReveal);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="rail">
      <section className="hero" aria-labelledby="hero-title">
        <article className="panel" aria-label={hero.panelAria} data-reveal="" ref={panelRef}>
          <div className="panel-bar">
            <span className="live">
              {hero.panelLive}
              <span className="long">{hero.panelLiveLong}</span>
            </span>
            <span>{hero.panelSource}</span>
          </div>
          <div className="panel-body">
            <div className="sc-title">{hero.title}</div>
            <p className="tb-hint">{hero.hint}</p>
            <div className="tb">
              <div className="tb-head" aria-hidden="true">
                {hero.cols.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <ul className="tb-list">
                {hero.rows.map((r, i) => (
                  <li
                    key={r.name}
                    className={`tb-row${r.hot ? " hot" : ""}`}
                    style={cssVars({ "--r": i })}
                    onMouseEnter={r.hot ? ship : undefined}
                  >
                    <span className="tb-name">{r.name}</span>
                    <span className="tb-num">{r.stock}</span>
                    <span className="tb-num tb-days">{r.days}</span>
                    <StatusBadge kind={r.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="sc-foot">
              <Icon name="local_shipping" />
              <div className="sum">
                <span className="k">{hero.footKey}</span>
                <span className="v">
                  {hero.footProduct}
                  <span className="num">{hero.footQty}</span>
                  {hero.footUnit}
                </span>
              </div>
              <a className="btn btn-outline btn-sm" href="#mengapa">
                {hero.footWhy}
              </a>
            </div>
          </div>
        </article>

        <div className="hero-copy">
          <span className="tag" data-reveal="fade">
            <b>00</b> {hero.tag}
          </span>
          <SplitText as="h1" id="hero-title" parts={hero.headline} />
          <p className="sub" data-reveal="" style={cssVars({ "--d": "350ms" })}>
            {hero.sub}
          </p>
          <div className="route" aria-hidden="true" ref={routeRef}>
            <span className="pin from" ref={fromRef}>
              <span className="ms">factory</span>
              <span>
                {hero.routeFrom}
                <span className="long">{hero.routeFromLong}</span>
              </span>
            </span>
            <span className="lt">
              <span>
                <span className="long">{hero.routeLeadLong}</span>
                {hero.routeLead}
              </span>{" "}
              <AssumptionBadge />
            </span>
            <span className="pin to" ref={toRef}>
              <span className="ms fill">warehouse</span>
              <span>
                {hero.routeTo}
                <span className="long">{hero.routeToLong}</span>
              </span>
            </span>
            <span className="packet" />
          </div>
          <p className="route-cap" data-reveal="" style={cssVars({ "--d": "600ms" })}>
            {hero.routeCap}
          </p>
        </div>

        <div className="hero-cta" data-reveal="" style={cssVars({ "--d": "200ms" })}>
          <a className="btn btn-primary" href="#coba">
            {hero.ctaPrimary}
          </a>
          <a className="btn btn-outline" href="#cara-kerja">
            {hero.ctaSecondary}
            <span className="go">
              <Icon name="arrow_forward" />
            </span>
          </a>
        </div>
        <div className="hero-note" data-reveal="fade" style={cssVars({ "--d": "300ms" })}>
          {hero.notes.map((n) => (
            <span key={n}>
              <Icon name="check" />
              {n}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
