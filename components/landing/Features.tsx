"use client";

import { useState } from "react";
import { features } from "@/constants/id";
import { Icon } from "./primitives";

const { items, diagram, hubIdle } = features;

// wires (SVG) and which feature lights each one up
const EDGES = [
  { id: "e1", on: [0, 3, 4], d: "M130 97 C152 97 140 220 160 220" },
  { id: "e2", on: [0, 3, 4], d: "M130 220 L160 220" },
  { id: "e3", on: [0, 3, 4], d: "M130 343 C152 343 140 220 160 220" },
  { id: "e4", on: [0, 1, 2, 3, 4], d: "M180 220 L214 220" },
  { id: "e5", on: [1], d: "M338 220 C358 220 354 97 374 97" },
  { id: "e6", on: [3], d: "M338 220 L374 220" },
  { id: "e7", on: [2], d: "M338 220 C358 220 354 343 374 343" },
];
const INPUT_ON = [0, 3, 4];
const GATE_ON = [0, 4];

export default function Features() {
  // -1 = every row closed; tapping the open row closes it
  const [cur, setCur] = useState(0);
  const on = (list: number[]) => (list.includes(cur) ? " on" : "");

  return (
    <div className="explore">
      <div className="feat-list">
        {items.map((f, i) => (
          <div className={`feat-row${i === cur ? " open" : ""}`} key={f.title}>
            <button
              className="feat-btn"
              aria-expanded={i === cur}
              aria-controls={`feat-body-${i}`}
              onClick={() => setCur((c) => (c === i ? -1 : i))}
            >
              <span className="no">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <span className="tog">
                <Icon name="add" />
              </span>
            </button>
            <div className="feat-body" id={`feat-body-${i}`}>
              <div>
                <p>{f.body}</p>
                <ul>
                  {f.chips.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="diagram" data-reveal="" aria-hidden="true">
        <svg viewBox="0 0 520 440" preserveAspectRatio="none">
          {EDGES.map((e) => (
            <path key={e.id} className={`d-edge${on(e.on)}`} d={e.d} />
          ))}
          <rect className={`d-gate${on(GATE_ON)}`} x="160" y="210" width="20" height="20" rx="5" />
          <path className="d-gate-x" d="M166 216 L174 224 M174 216 L166 224" />
        </svg>
        {diagram.inputs.map((n, i) => (
          <div key={n.name} className={`node in r${i + 1}${on(INPUT_ON)}`}>
            <span className="ms">description</span>
            <span className="t">
              {n.name}
              <small>{n.ext}</small>
            </span>
          </div>
        ))}
        <div className="node hub">
          <div className="top">
            <svg className="hub-mark" aria-hidden="true">
              <use href="#laku-mark" />
            </svg>
            <b>{diagram.hub}</b>
          </div>
          <div className="hub-msg">{cur < 0 ? hubIdle : items[cur].hub}</div>
        </div>
        <div className={`node out crit r1${on([1])}`}>
          <span className="ms fill">error</span>
          <span className="t">
            {diagram.outRestock.name}
            <small>{diagram.outRestock.sub}</small>
          </span>
        </div>
        <div className={`node out r2${on([3])}`}>
          <span className="ms">payments</span>
          <span className="t">
            {diagram.outRecap.name}
            <small>{diagram.outRecap.sub}</small>
          </span>
        </div>
        <div className={`node out r3${on([2])}`}>
          <span className="ms">block</span>
          <span className="t">
            {diagram.outStop.name}
            <small>{diagram.outStop.sub}</small>
          </span>
        </div>
        <span className="cap">{diagram.caption}</span>
      </div>
    </div>
  );
}
