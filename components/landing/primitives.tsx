import { Fragment, type CSSProperties, type ElementType, type ReactNode } from "react";
import { assumption, status, type SplitPart, type StatusKey } from "@/constants/id";

const ICONS: Record<string, ReactNode> = {
  arrow_forward: (
    <>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  arrow_back: (
    <>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 19-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  arrow_downward: (
    <>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 12-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  south: (
    <>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 12-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  check: (
    <path d="m4 12 5 5L20 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  close: (
    <>
      <path d="m18 6-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  add: (
    <>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  play_circle: (
    <>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none" />
    </>
  ),
  mark_email_read: (
    <>
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 19 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 21v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  edit: (
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  warehouse: (
    <>
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 18h12M6 14h12" stroke="currentColor" strokeWidth="1.5" />
      <rect width="4" height="6" x="10" y="16" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  factory: (
    <>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4L2 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17 18h1M12 18h1M7 18h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  storefront: (
    <>
      <path d="M3 9l1-5h16l1 5M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M3 9h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  upload_file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 18v-6M9 15l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  fact_check: (
    <>
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  checklist: (
    <>
      <path d="m3 8 2 2 4-4M3 16l2 2 4-4M13 8h8M13 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  schedule: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  stacks: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" strokeWidth="1.8" />
      <polyline points="2 12 12 17 22 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  block: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  forum: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  map: (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  api: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="6" y1="6" x2="6.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="18" x2="6.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export function Icon({ name, fill, className }: { name: string; fill?: boolean; className?: string }) {
  const glyph = ICONS[name];
  if (glyph) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className={["ms", fill && "fill", className].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        {glyph}
      </svg>
    );
  }
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

export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="tag" data-reveal="fade">
      {children}
    </span>
  );
}

/**
 * Section heading; `parts` lets one phrase carry a class (e.g. the soft grey half).
 * Fades in with its block, or with `split` its words rise one by one (hero only).
 */
export function Headline({
  as: Tag = "h2",
  parts,
  id,
  className,
  split = false,
}: {
  as?: ElementType;
  parts: SplitPart[] | string;
  id?: string;
  className?: string;
  split?: boolean;
}) {
  const list = typeof parts === "string" ? [parts] : parts;
  let wi = 0;
  const words = (text: string) =>
    text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((w, i) =>
        /^\s+$/.test(w) ? (
          " "
        ) : (
          <span className="w" aria-hidden="true" key={i}>
            <span style={{ "--wi": wi++ } as CSSProperties}>{w}</span>
          </span>
        ),
      );
  const render = (text: string) => (split ? words(text) : text);
  const motionProps = split
    ? { "data-split": "", "aria-label": list.map((p) => (typeof p === "string" ? p : p.text)).join("").trim() }
    : { "data-reveal": "" };
  return (
    <Tag id={id} className={className} {...motionProps}>
      {list.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{render(p)}</Fragment>
        ) : (
          <span key={i} className={p.className}>
            {render(p.text)}
          </span>
        ),
      )}
    </Tag>
  );
}
