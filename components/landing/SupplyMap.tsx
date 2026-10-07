"use client";

import { useEffect, useState } from "react";
import { Icon } from "./primitives";
import { supplyMap as copy } from "@/constants/id";
import { hasMotion } from "@/lib/motion";
import { INDONESIA_PATH, MAP_H, MAP_POINTS, MAP_W, NEIGHBOURS_PATH } from "./indonesia-map";

type SourceKey = keyof typeof copy.sources;
// label side relative to the city dot: below, right, left
const SOURCES: { key: SourceKey; pos: "b" | "r" | "l" }[] = [
  { key: "sumatra", pos: "b" },
  { key: "jawa", pos: "b" },
  { key: "bali", pos: "r" },
  { key: "sulawesi", pos: "r" },
  { key: "papua", pos: "l" },
];

const [HX, HY] = MAP_POINTS.hub;
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(2)}%`;

/** Quadratic arc from a city to the hub, bowed "north" so the routes read as flight paths. */
function arc([x, y]: readonly [number, number]) {
  const mx = (x + HX) / 2, my = (y + HY) / 2;
  const dx = HX - x, dy = HY - y;
  const len = Math.hypot(dx, dy);
  // unit normal, flipped if needed so it points up (negative y)
  const flip = dx / len > 0 ? -1 : 1;
  const nx = (-dy / len) * flip, ny = (dx / len) * flip;
  const k = len * 0.22;
  return `M${x} ${y} Q${(mx + nx * k).toFixed(1)} ${(my + ny * k).toFixed(1)} ${HX} ${HY}`;
}

const ROUTES = SOURCES.map((s) => ({ ...s, d: arc(MAP_POINTS[s.key]) }));
const CYCLE = 3.5; // seconds per trip; trips are staggered so a parcel lands every CYCLE / routes
const BEAT = CYCLE / ROUTES.length;

/**
 * Indonesia with supplier routes converging on one warehouse. Parcels (SMIL) ride the arcs in turn and the
 * hub pulses as they land. SMIL ignores CSS reduced-motion, so the moving parts mount only when motion is allowed;
 * without it the map, routes and labels still render as a still picture.
 */
export default function SupplyMap({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const [live, setLive] = useState(false);
  useEffect(() => setLive(hasMotion()), []);

  return (
    <figure className={`smap smap-${tone} ${className}`} role="img" aria-label={copy.aria}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
        <path className="smap-ctx" d={NEIGHBOURS_PATH} />
        <path className="smap-land" d={INDONESIA_PATH} />
        {ROUTES.map((r, i) => (
          <path key={r.key} className="smap-route" d={r.d} pathLength={1} style={{ ["--i" as string]: i }} />
        ))}
        {live && (
          <>
            {ROUTES.map((r, i) =>
              [0, 0.09].map((lag, j) => (
                <circle key={`${r.key}-${j}`} className={j ? "smap-trail" : "smap-parcel"} r={j ? 2.4 : 3.6} opacity="0">
                  <animateMotion
                    path={r.d}
                    dur={`${CYCLE}s`}
                    begin={`${(i * BEAT + lag).toFixed(2)}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    keySplines=".45 0 .25 1"
                  />
                  <animate
                    attributeName="opacity"
                    dur={`${CYCLE}s`}
                    begin={`${(i * BEAT + lag).toFixed(2)}s`}
                    repeatCount="indefinite"
                    values="0;1;1;0"
                    keyTimes="0;.12;.86;1"
                  />
                </circle>
              )),
            )}
            {/* two rings alternate so the hub pulses on every arrival (first parcel lands at CYCLE) */}
            {[0, BEAT].map((b) => (
              <circle key={b} className="smap-ring" cx={HX} cy={HY} r="6" opacity="0">
                <animate attributeName="r" values="6;24" dur={`${(BEAT * 2).toFixed(2)}s`} begin={`${(CYCLE + b).toFixed(2)}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values=".75;0" dur={`${(BEAT * 2).toFixed(2)}s`} begin={`${(CYCLE + b).toFixed(2)}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </>
        )}
        {SOURCES.map((s) => (
          <circle key={s.key} className="smap-city" cx={MAP_POINTS[s.key][0]} cy={MAP_POINTS[s.key][1]} r="3.2" />
        ))}
        <circle className="smap-hub" cx={HX} cy={HY} r="6" />
      </svg>

      {SOURCES.map((s) => (
        <span
          key={s.key}
          className={`smap-label pos-${s.pos}`}
          style={{ left: pct(MAP_POINTS[s.key][0], MAP_W), top: pct(MAP_POINTS[s.key][1], MAP_H) }}
          aria-hidden="true"
        >
          {copy.sources[s.key]}
        </span>
      ))}
      <span className="smap-hub-label" style={{ left: pct(HX, MAP_W), top: pct(HY, MAP_H) }} aria-hidden="true">
        <Icon name="warehouse" fill />
        <span>
          <b>{copy.hub}</b>
          <small>{copy.hubSub}</small>
        </span>
      </span>
      <figcaption className="smap-cap" aria-hidden="true">
        {copy.caption}
      </figcaption>
    </figure>
  );
}
