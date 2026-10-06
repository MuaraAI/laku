import type { Metadata } from "next";
import Link from "next/link";
import LoginCard from "@/components/auth/LoginCard";
import { Headline, Icon, LakuMark, StatusBadge } from "@/components/landing/primitives";
import { demo, footer, hero, login, nav, routes } from "@/constants/id";

export const metadata: Metadata = { title: login.metaTitle };

type ErrorKey = keyof typeof login.errors;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const initialError = error && error in login.errors ? login.errors[error as ErrorKey] : null;
  return (
    <div className="auth">
      <aside className="auth-aside" aria-hidden="true">
        <div className="auth-aside-top">
          <span className="auth-brand on-dark">
            <LakuMark />
            <span className="logo-name">{nav.brandName}</span>
          </span>
          <Headline as="p" className="auth-tagline" parts={hero.headline} />
          <p className="auth-aside-sub">{login.aside.sub}</p>
        </div>
        <div className="auth-preview">
          <div className="auth-preview-head">
            <span>{login.aside.previewTitle}</span>
            <span className="demo-chip">{demo.label}</span>
          </div>
          <ul>
            {demo.rows.map((r) => (
              <li key={r.name}>
                <span className="name">{r.name}</span>
                <span className="days">{r.days}</span>
                <StatusBadge kind={r.status} />
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-foot">{footer.copyright}</p>
      </aside>

      <main className="auth-main">
        <Link className="auth-back" href={routes.home}>
          <Icon name="arrow_back" />
          {login.back}
        </Link>
        <div className="auth-form">
          <Link className="auth-brand auth-brand-mobile" href={routes.home} aria-label={nav.home}>
            <LakuMark />
            <span className="logo-name">{nav.brandName}</span>
          </Link>
          <div>
            <h1>{login.title}</h1>
            <p className="auth-sub">{login.sub}</p>
          </div>
          <LoginCard initialError={initialError} />
          <ul className="auth-notes">
            {login.notes.map((n) => (
              <li key={n}>
                <Icon name="check" />
                {n}
              </li>
            ))}
          </ul>
          <p className="auth-consent">
            {login.consentLead}
            <Link href={routes.tos}>{login.consentTos}</Link>
            {login.consentAnd}
            <Link href={routes.privacy}>{login.consentPrivacy}</Link>
            {login.consentEnd}
          </p>
        </div>
      </main>
    </div>
  );
}
