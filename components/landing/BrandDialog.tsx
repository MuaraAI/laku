"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { brand, nav } from "@/constants/id";
import { hasMotion } from "@/lib/motion";
import { Icon } from "./primitives";

const BrandContext = createContext<() => void>(() => {});

/** Provides `useBrand()` to open the logo anatomy dialog from anywhere on the page. */
export function BrandProvider({ children }: { children: ReactNode }) {
  const openRef = useRef<() => void>(() => {});
  const open = useCallback(() => openRef.current(), []);
  return (
    <BrandContext.Provider value={open}>
      {children}
      <BrandDialog register={(fn) => (openRef.current = fn)} />
    </BrandContext.Provider>
  );
}

export function BrandButton({ className, children }: { className: string; children: ReactNode }) {
  const open = useContext(BrandContext);
  return (
    <button className={className} type="button" aria-haspopup="dialog" aria-controls="brand" title={nav.brandHint} onClick={open}>
      {children}
    </button>
  );
}

// step → the piece of the mark it explains
const PIECE: Record<number, string> = { 1: "p-oct", 2: "p-l", 3: "p-stock", 4: "p-ghost" };
const TAGS = [
  { t: 1, cx: 69, cy: 69 },
  { t: 2, cx: 5, cy: 15 },
  { t: 3, cx: 60, cy: 48 },
  { t: 4, cx: 58, cy: 5 },
];

function BrandDialog({ register }: { register: (open: () => void) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const exploded = step >= 1 && step <= 4;
  const pc = (piece: string) => `pc ${piece}${exploded && PIECE[step] !== piece ? " dim" : ""}`;

  useEffect(() => {
    register(() => {
      const dlg = dialogRef.current;
      if (!dlg || typeof dlg.showModal !== "function") return;
      dlg.showModal();
      document.documentElement.classList.add("lock");
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      setStep(0);
    });
  }, [register]);

  // the active step is the one crossing a thin line in the middle of the readable area
  useEffect(() => {
    const root = bodyRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const line = matchMedia("(max-width: 760px)").matches ? "-69% 0px -29% 0px" : "-48% 0px -48% 0px";
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.step))),
      { root, rootMargin: line },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goStep = (n: number) => {
    const body = bodyRef.current;
    const sec = stepRefs.current[n];
    if (!body || !sec) return;
    const mobile = matchMedia("(max-width: 760px)").matches;
    let top = body.scrollTop + sec.getBoundingClientRect().top - body.getBoundingClientRect().top;
    // desktop: centre the step; phone: land it just under the sticky logo stage
    top -= mobile ? (stageRef.current?.offsetHeight ?? 0) + 8 : (body.clientHeight - sec.offsetHeight) / 2;
    body.scrollTo({ top: Math.max(0, top), behavior: hasMotion() ? "smooth" : "auto" });
  };

  const close = () => {
    const dlg = dialogRef.current;
    if (!dlg?.open) return;
    if (!hasMotion()) return dlg.close();
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      dlg.close();
    }, 220);
  };

  return (
    <dialog
      ref={dialogRef}
      className={`brand${closing ? " closing" : ""}`}
      id="brand"
      aria-labelledby="brandTitle"
      onClose={() => document.documentElement.classList.remove("lock")}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="brand-bar">
        <span className="tag">
          <b>{brand.barTag}</b> {brand.barTitle}
        </span>
        <button className="brand-x" type="button" aria-label={brand.close} onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <div className="brand-body" ref={bodyRef}>
        <div className="brand-stage" ref={stageRef}>
          <svg className={`anat${exploded ? " exp" : ""}`} viewBox="-22 -22 108 108" aria-hidden="true" data-step={step}>
            <g className="zoom">
              <g className={pc("p-oct")}>
                <path className="a-oct" d="M19.8 2H44.2L62 19.8V44.2L44.2 62H19.8L2 44.2V19.8Z" />
              </g>
              <g className={pc("p-ghost")}>
                <rect className="a-ghost" x="24" y="14" width="14" height="14" rx="2" />
              </g>
              <g className={pc("p-stock")}>
                <rect className="a-stock" x="24" y="33" width="14" height="14" rx="2" />
              </g>
              <g className={pc("p-l")}>
                <path className="a-l" d="M17 17V50H48" />
              </g>
              <g className="a-gap">
                <path d="M44 28.2V32.8M42 28.2H46M42 32.8H46" />
                <text x="48.2" y="30.5">5</text>
              </g>
            </g>
            {TAGS.map(({ t, cx, cy }) => (
              <g key={t} className={`a-tag${t === step ? " on" : ""}`}>
                <circle cx={cx} cy={cy} r="5" />
                <text x={cx} y={cy}>
                  {String(t).padStart(2, "0")}
                </text>
              </g>
            ))}
            <g className="a-word">
              <text className="w1" x="32" y="79">
                {brand.wordmark}
              </text>
              <text className="w2" x="32" y="85">
                {brand.byline}
              </text>
            </g>
          </svg>
          <div className="brand-dots" aria-label={brand.dotsAria}>
            {brand.steps.map((s, i) => (
              <button
                key={s.dot}
                type="button"
                aria-label={s.dot}
                className={i === step ? "on" : undefined}
                aria-current={i === step ? "step" : "false"}
                onClick={() => goStep(i)}
              />
            ))}
          </div>
        </div>
        <div className="brand-steps">
          {brand.steps.map((s, i) => {
            const Heading = i === 0 ? "h2" : "h3";
            return (
              <section
                key={s.dot}
                className={`bs${i === step ? " on" : ""}`}
                data-step={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
              >
                <span className="bs-no">
                  {s.no && <i>{s.no}</i>}
                  {s.kicker}
                </span>
                <Heading id={i === 0 ? "brandTitle" : undefined}>{s.title}</Heading>
                <p>{s.body}</p>
                {s.spec && (
                  <ul className="bs-spec">
                    {s.spec.map((sp) => (
                      <li key={sp.text}>
                        {sp.chip && <span className="chip" style={{ background: `var(--${sp.chip})` }} />}
                        {sp.text}
                      </li>
                    ))}
                  </ul>
                )}
                {s.hint && (
                  <button className="bs-hint" type="button" onClick={() => goStep(1)}>
                    <Icon name="south" />
                    {s.hint}
                  </button>
                )}
                {s.back && (
                  <div className="btns">
                    <button className="btn btn-primary btn-sm" type="button" onClick={close}>
                      {s.back}
                    </button>
                    <button className="btn btn-outline btn-sm" type="button" onClick={() => goStep(0)}>
                      {s.replay}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
