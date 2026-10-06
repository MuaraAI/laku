"use client";

import { Fragment, useEffect, useRef } from "react";
import { why } from "@/constants/id";
import { cssVars } from "@/lib/css";
import { countUp, hasMotion, REVEAL_EVENT } from "@/lib/motion";
import { AssumptionBadge, Block, Icon, SectionTag, SplitText } from "./primitives";

const { nota } = why;

export default function Why() {
  const deskRef = useRef<HTMLDivElement>(null);
  const notaRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  // receipt prints line by line, then the total counts up
  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onReveal = () => {
      notaRef.current?.classList.add("run");
      if (hasMotion()) timer = setTimeout(() => totalRef.current && countUp(totalRef.current, nota.total), 1150);
    };
    desk.addEventListener(REVEAL_EVENT, onReveal);
    return () => {
      desk.removeEventListener(REVEAL_EVENT, onReveal);
      clearTimeout(timer);
    };
  }, []);

  const pr = (pi: number) => cssVars({ "--pi": pi });

  return (
    <Block>
      <section className="inner why-grid" id="mengapa" aria-labelledby="why-title">
        <div className="sec-head">
          <SectionTag no="03">{why.tag}</SectionTag>
          <SplitText id="why-title" parts={why.title} />
          <p data-reveal="">{why.body}</p>
          <div className="principles" data-reveal="">
            {why.principles.map((p) => (
              <div key={p}>
                <Icon name="check" />
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="desk" data-reveal="" ref={deskRef}>
          <div className="nota" role="img" aria-label={nota.aria} ref={notaRef}>
            <div className="n-head pr" style={pr(0)}>
              <b>{nota.head}</b>
              <span>{nota.shop}</span>
              <span>{nota.date}</span>
            </div>
            <hr className="n-rule pr" style={pr(1)} />
            <div className="n-item pr" style={pr(2)}>
              {nota.item}
            </div>
            {nota.lines.map((l) => (
              <Fragment key={l.k}>
                <div className="ln pr" style={pr(l.pi)}>
                  <span className="k">
                    {l.k}
                    {l.assumed && (
                      <>
                        {" "}
                        <AssumptionBadge />
                      </>
                    )}
                  </span>
                  <span className="d" />
                  <span className="v">{l.v}</span>
                </div>
                {l.formula && (
                  <div className="f pr" style={pr(l.pi)}>
                    {l.formula}
                  </div>
                )}
              </Fragment>
            ))}
            <hr className="n-rule dbl pr" style={pr(10)} />
            <div className="n-total pr" style={pr(11)}>
              <span className="k">{nota.totalKey}</span>
              <span className="v">
                <span ref={totalRef}>{nota.total}</span>
                <small>{nota.unit}</small>
              </span>
            </div>
            <div className="f pr" style={pr(11)}>
              {nota.totalFormula}
            </div>
            <hr className="n-rule pr" style={pr(12)} />
            <div className="barcode pr" style={pr(13)} aria-hidden="true" />
            <div className="n-foot pr" style={pr(13)}>
              {nota.foot}
            </div>
          </div>
        </div>
      </section>
    </Block>
  );
}
