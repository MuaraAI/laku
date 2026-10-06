import { Fragment, type ElementType, type ReactNode } from "react";
import { assumption, status, type SplitPart, type StatusKey } from "@/constants/id";

export function Icon({ name, fill, className }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span className={["ms", fill && "fill", className].filter(Boolean).join(" ")} aria-hidden="true">
      {name}
    </span>
  );
}

export function StatusBadge({ kind }: { kind: StatusKey }) {
  const s = status[kind];
  return (
    <span className={`badge b-${kind}`}>
      <Icon name={s.icon} />
      {s.label}
    </span>
  );
}

export function AssumptionBadge() {
  return <span className="badge b-asumsi">{assumption}</span>;
}

function MarkParts() {
  return (
    <>
      <path className="m-oct" d="M19.8 2H44.2L62 19.8V44.2L44.2 62H19.8L2 44.2V19.8Z" />
      <rect className="m-ghost" x="24" y="14" width="14" height="14" rx="2" />
      <rect className="m-stock" x="24" y="33" width="14" height="14" rx="2" />
      <path className="m-l" d="M17 17V50H48" />
    </>
  );
}

/** The Laku mark: octagon, shelf bracket L, stock box, incoming box. */
export function LakuMark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <MarkParts />
    </svg>
  );
}

/** Shared <symbol> for the small marks that reference `#laku-mark`. Render once per page. */
export function LakuSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="laku-mark" viewBox="0 0 64 64">
        <MarkParts />
      </symbol>
    </svg>
  );
}

export function Crosshairs() {
  return (
    <>
      <i className="x tl" />
      <i className="x tr" />
    </>
  );
}

/** A bordered ledger block with crosshairs on the rail. */
export function Block({ children }: { children: ReactNode }) {
  return (
    <div className="blk">
      <div className="rail">
        <Crosshairs />
        {children}
      </div>
    </div>
  );
}

export function SectionTag({ no, children }: { no?: string; children: ReactNode }) {
  return (
    <span className="tag" data-reveal="fade">
      {no && <b>{no}</b>} {children}
    </span>
  );
}

/** Section heading; `parts` lets one phrase carry a class (e.g. the soft grey half). Fades in with its block. */
export function Headline({
  as: Tag = "h2",
  parts,
  id,
  className,
}: {
  as?: ElementType;
  parts: SplitPart[] | string;
  id?: string;
  className?: string;
}) {
  const list = typeof parts === "string" ? [parts] : parts;
  return (
    <Tag id={id} className={className} data-reveal="">
      {list.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <span key={i} className={p.className}>
            {p.text}
          </span>
        ),
      )}
    </Tag>
  );
}
