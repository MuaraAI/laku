import Link from "next/link";
import type { ReactNode } from "react";
import { LakuMark } from "@/components/landing/primitives";
import { errorPages, footer, nav, routes } from "@/constants/id";

/** Tampilan bersama halaman 404 / 500: logo, kode besar, pesan, aksi. Hanya token tema, tanpa hex. */
export default function ErrorScreen({
  code,
  title,
  body,
  actions,
  showSupport = false,
}: {
  code: string;
  title: string;
  body: string;
  actions?: ReactNode;
  showSupport?: boolean;
}) {
  return (
    <main className="errpage">
      <Link className="errpage-brand" href={routes.home} aria-label={nav.home}>
        <LakuMark />
        <span className="logo-name">{nav.brandName}</span>
      </Link>
      <div className="errpage-body">
        <p className="errpage-code" aria-hidden="true">{code}</p>
        <h1>{title}</h1>
        <p className="errpage-text">
          {body}
          {showSupport && (
            <>
              {" "}
              <a href={`mailto:${footer.email}`}>{footer.email}</a>.
            </>
          )}
        </p>
        <div className="errpage-actions">
          {actions}
          <Link className="btn btn-outline" href={routes.home}>{errorPages.home}</Link>
        </div>
      </div>
    </main>
  );
}
