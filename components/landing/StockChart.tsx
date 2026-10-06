"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { demo, stockChart as c } from "@/constants/id";
import { Icon, StatusBadge } from "./primitives";

// viewBox geometry
const W = 520, H = 300, ML = 40, MR = 18, MT = 18, MB = 34;
const D0 = -7, D1 = 7, Y1 = 200;
const x = (d: number) => ML + ((d - D0) / (D1 - D0)) * (W - ML - MR);
const y = (v: number) => H - MB - (v / Y1) * (H - MT - MB);
const pct = (px: number, total: number) => `${(px / total) * 100}%`;

const line = (pts: [number, number][]) => pts.map(([d, v], i) => `${i ? "L" : "M"}${x(d)} ${y(v)}`).join(" ");
const area = (pts: [number, number][]) => `${line(pts)} L${x(pts[pts.length - 1][0])} ${y(0)} L${x(pts[0][0])} ${y(0)} Z`;

const Y_TICKS = [0, 100, 200];
const X_TICKS = [-7, 0, 5];

/** Value(s) at a day: recorded up to today, projected after; day 5 holds the delivery jump. */
function readout(d: number) {
  const recorded = c.actual.find(([day]) => day === d);
  const projected = c.projected.filter(([day]) => day === d).map(([, v]) => v);
  if (d <= 0 && recorded) return { value: `${recorded[1]}`, kind: c.kindActual };
  return { value: projected.join(" → "), kind: c.kindProjected };
}

export default function StockChart() {
  const [hover, setHover] = useState<number | null>(null);

  const fromPointer = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const vx = ((e.clientX - box.left) / box.width) * W;
    const d = Math.round(D0 + ((vx - ML) / (W - ML - MR)) * (D1 - D0));
    setHover(Math.max(D0, Math.min(D1, d)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(D0, Math.min(D1, (h ?? 0) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const tip = hover === null ? null : readout(hover);
  const tipOnLeft = hover !== null && hover > 2;

  return (
    <div className="chart-card" data-reveal="">
      <div className="chart-head">
        <div>
          <p className="chart-title">{c.title}</p>
          <p className="chart-sub">
            <span className="demo-chip">{demo.label}</span>
            {c.sub}
          </p>
        </div>
        <StatusBadge kind="critical" />
      </div>

      <div
        className="chart-plot"
        tabIndex={0}
        role="img"
        aria-label={c.aria}
        onKeyDown={onKey}
        onFocus={() => setHover((h) => h ?? 0)}
        onBlur={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {Y_TICKS.map((v) => (
            <g key={v}>
              <line className="grid" x1={ML} x2={W - MR} y1={y(v)} y2={y(v)} />
              <text className="tick" x={ML - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">
                {v}
              </text>
            </g>
          ))}
          {X_TICKS.map((d) => (
            <text key={d} className="tick" x={x(d)} y={H - 10} textAnchor="middle">
              {c.tickLabel(d)}
            </text>
          ))}

          {/* stockout window: projected to hit 0 on day 4, delivery on day 5 */}
          <rect className="empty-band" x={x(4)} y={MT} width={x(5) - x(4)} height={y(0) - MT} rx="3" />
          <line className="today" x1={x(0)} x2={x(0)} y1={MT} y2={y(0)} />
          <line className="arrival" x1={x(5)} x2={x(5)} y1={y(173)} y2={y(0)} />

          <path className="area" d={area(c.actual)} />
          <path className="proj" d={line(c.projected)} />
          <path className="draw" d={line(c.actual)} pathLength={1} />

          <circle className="dot" cx={x(0)} cy={y(40)} r="5" />
          <circle className="dot proj-dot" cx={x(5)} cy={y(173)} r="4.5" />

          <text className="note" x={x(0) + 10} y={y(40) - 12}>
            {c.today} · {c.todayValue}
          </text>
          <text className="note" x={x(5) - 10} y={y(173) - 2} textAnchor="end">
            {c.arrival}
          </text>

          {hover !== null && <line className="cross" x1={x(hover)} x2={x(hover)} y1={MT} y2={y(0)} />}
          <rect
            className="hit"
            x={ML}
            y={MT}
            width={W - ML - MR}
            height={y(0) - MT}
            onPointerMove={fromPointer}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        <span className="empty-chip" style={{ left: pct((x(4) + x(5)) / 2, W), top: pct(y(70), H) }}>
          <Icon name="error" />
          {c.empty}
        </span>

        {tip && hover !== null && (
          <div className={`chart-tip${tipOnLeft ? " left" : ""}`} style={{ left: pct(x(hover), W) }}>
            <strong>
              {tip.value} <small>{c.unit}</small>
            </strong>
            <span>
              {c.dayLabel(hover)} · {tip.kind}
            </span>
          </div>
        )}
      </div>

      <div className="chart-legend" aria-hidden="true">
        <span>
          <i className="key solid" />
          {c.legendActual}
        </span>
        <span>
          <i className="key dashed" />
          {c.legendProjected}
        </span>
      </div>

      <table className="sr-only">
        <caption>{c.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{c.tableDay}</th>
            <th scope="col">{c.tableStock}</th>
            <th scope="col">{c.tableKind}</th>
          </tr>
        </thead>
        <tbody>
          {[...c.actual.map((p) => [...p, c.kindActual] as const), ...c.projected.slice(1).map((p) => [...p, c.kindProjected] as const)].map(
            ([d, v, kind], i) => (
              <tr key={i}>
                <td>{c.dayLabel(d)}</td>
                <td>{v}</td>
                <td>{kind}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
