"use client";

import { useRef } from "react";
import { how } from "@/constants/id";
import { cssVars } from "@/lib/css";
import { clamp, hasMotion, useScrollFrame } from "@/lib/motion";
import { Block, Icon, SectionTag, SplitText } from "./primitives";

export default function How() {
  const stepsRef = useRef<HTMLDivElement>(null);

  // the top rule draws across and steps light up as you scroll past
  useScrollFrame(() => {
    const steps = stepsRef.current;
    if (!steps || !hasMotion()) return;
    const vh = innerHeight;
    const st = steps.getBoundingClientRect();
    const pr = clamp((vh * 0.8 - st.top) / (st.height * 0.9), 0, 1);
    steps.style.setProperty("--sp", pr.toFixed(3));
    const els = steps.querySelectorAll(".step");
    els.forEach((el, i) => el.classList.toggle("lit", pr >= (i + 0.25) / els.length));
  });

  return (
    <Block>
      <section className="inner" id="cara-kerja" aria-labelledby="how-title">
        <div className="sec-head">
          <SectionTag no="04">{how.tag}</SectionTag>
          <SplitText id="how-title" parts={how.title} />
          <p data-reveal="">{how.body}</p>
        </div>
        <div className="steps" ref={stepsRef}>
          <span className="steps-line" aria-hidden="true" />
          {how.steps.map((s, i) => (
            <article className="step" data-reveal="" style={cssVars({ "--i": i })} key={s.title}>
              <div className="top">
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <span className="ic">
                  <Icon name={s.icon} />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Block>
  );
}
