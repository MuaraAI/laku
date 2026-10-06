import Link from "next/link";
import { legalCommon, type LegalDoc } from "@/constants/id";
import { Icon } from "./primitives";
import SiteShell from "./SiteShell";

export default function LegalPage({ doc, other }: { doc: LegalDoc; other: { href: string; label: string } }) {
  return (
    <SiteShell>
      <main id="top">
        <div className="rail">
          <article className="legal">
            <h1>{doc.title}</h1>
            <p className="legal-updated">
              {legalCommon.updatedLabel}: {doc.updated}
            </p>
            <p className="legal-draft" role="note">
              <Icon name="info" />
              {legalCommon.draft}
            </p>
            {doc.sections.map((sec) => (
              <section key={sec.heading}>
                <h2>{sec.heading}</h2>
                {sec.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
            <Link className="legal-other" href={other.href}>
              {other.label}
              <Icon name="arrow_forward" />
            </Link>
          </article>
        </div>
      </main>
    </SiteShell>
  );
}
