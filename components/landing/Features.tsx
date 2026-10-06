"use client";

import { useEffect, useRef, useState } from "react";
import { features } from "@/constants/id";
import { hasMotion } from "@/lib/motion";
import { Icon } from "./primitives";

const { items, diagram } = features;

// wires (SVG) and which feature lights each one up
const EDGES = [
  { id: "e1", on: [0, 3, 4], d: "M130 97 C152 97 140 220 160 220", dur: "1.8s" },
  { id: "e2", on: [0, 3, 4], d: "M130 220 L160 220", dur: "1.8s" },
  { id: "e3", on: [0, 3, 4], d: "M130 343 C152 343 140 220 160 220", dur: "1.8s" },
  { id: "e4", on: [0, 1, 2, 3, 4], d: "M180 220 L214 220", dur: "1.2s" },
  { id: "e5", on: [1], d: "M338 220 C358 220 354 97 374 97", dur: "1.8s" },
  { id: "e6", on: [3], d: "M338 220 L374 220", dur: "1.8s" },
  { id: "e7", on: [2], d: "M338 220 C358 220 354 343 374 343", dur: "1.8s" },
];
const INPUT_ON = [0, 3, 4];
const GATE_ON = [0, 4];

export default function Features() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const on = (list: number[]) => (list.includes(cur) ? " on" : "");

  useEffect(() => {
    const motion = hasMotion();
    setAuto(motion);
    if (!motion) svgRef.current?.pauseAnimations?.();
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => setInView(es[0].isIntersecting), { threshold: 0.35 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const activate = (k: number, byUser = false) => {
    if (k !== cur) setSwapped(true);
    setCur(k);
    setTimerKey((t) => t + 1);
    if (byUser) setAuto(false);
  };

  const timing = auto && inView;

  return (
    <div
      className={`explore feats${paused ? " paused" : ""}`}
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="feat-list">
        {items.map((f, i) => (
          <div className={`feat-row${i === cur ? " open" : ""}`} key={f.title}>
            <button className="feat-btn" aria-expanded={i === cur} onClick={() => activate(i, true)}>
              <span className="no">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <span className="tog">
                <Icon name="add" />
              </span>
            </button>
            <div className="feat-body">
              <div>
                <p>{f.body}</p>
                <ul>
                  {f.chips.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <span
              key={i === cur ? timerKey : undefined}
              className={`feat-timer${timing && i === cur ? " run" : ""}`}
              aria-hidden="true"
              onAnimationEnd={() => auto && activate((cur + 1) % items.length)}
            />
          </div>
        ))}
      </div>

      <div className="diagram" data-reveal="" aria-hidden="true">
        <svg viewBox="0 0 520 440" preserveAspectRatio="none" ref={svgRef}>
          {EDGES.map((e) => (
            <path key={e.id} className={`d-edge${on(e.on)}`} id={e.id} d={e.d} />
          ))}
          <rect className={`d-gate${on(GATE_ON)}`} x="160" y="210" width="20" height="20" rx="5" />
          <path className="d-gate-x" d="M166 216 L174 224 M174 216 L166 224" />
          {EDGES.map((e) => (
            <g key={e.id} className={`pk${on(e.on)}`}>
              {["0s", "-0.9s"].map((begin) => (
                <rect key={begin} x="-4" y="-4" width="8" height="8" rx="2">
                  <animateMotion dur={e.dur} begin={begin} repeatCount="indefinite">
                    <mpath href={`#${e.id}`} />
                  </animateMotion>
                </rect>
              ))}
            </g>
          ))}
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
            <span className="eq">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className={`hub-msg${swapped ? " swap" : ""}`} key={cur}>
            {items[cur].hub}
          </div>
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
