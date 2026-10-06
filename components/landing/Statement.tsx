"use client";

import { Fragment, useEffect, useRef } from "react";
import { statement } from "@/constants/id";
import { clamp, hasMotion, useScrollFrame } from "@/lib/motion";
import { Crosshairs } from "./primitives";

const toWords = (text: string, hl: boolean) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, hl }));

const WORDS = [...toWords(statement.lead, false), ...toWords(statement.highlight, true)];

export default function Statement() {
  const spacerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (hasMotion()) return;
    spacerRef.current?.querySelectorAll(".sw").forEach((w) => w.classList.add("on"));
  }, []);

  // words light up as the sentence is read through the viewport
  useScrollFrame(() => {
    const spacer = spacerRef.current;
    if (!spacer || !hasMotion()) return;
    const vh = innerHeight;
    const s = spacer.getBoundingClientRect();
    const sp = clamp((vh * 0.85 - s.top) / (s.height + vh * 0.35), 0, 1);
    const words = spacer.querySelectorAll(".sw");
    const lit = Math.round(sp * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
    spacer.style.setProperty("--ls", `${(0.06 - 0.095 * clamp(sp * 1.6, 0, 1)).toFixed(4)}em`);
  });

  return (
    <div className="rail">
      <Crosshairs />
      <section className="inner" aria-label={statement.aria}>
        <span className="tag" data-reveal="fade">
          {statement.tag}
        </span>
        <p className="spacer" ref={spacerRef}>
          {WORDS.map(({ w, hl }, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className={hl ? "sw hl" : "sw"}>{w}</span>
            </Fragment>
          ))}
        </p>
      </section>
    </div>
  );
}
