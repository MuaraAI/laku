import type { Metadata } from "next";
import Link from "next/link";
import LoginCard from "@/components/auth/LoginCard";
import Image from "next/image";
import { Icon, LakuMark } from "@/components/landing/primitives";
import { footer, hero, login, nav, routes } from "@/constants/id";

export const metadata: Metadata = { title: login.metaTitle };

type ErrorKey = keyof typeof login.errors;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const initialError = error && error in login.errors ? login.errors[error as ErrorKey] : null;
  return (
    <div className="auth">
      <aside className="auth-aside" aria-hidden="true">
        <span className="auth-brand on-dark">
          <LakuMark />
          <span className="logo-name">{nav.brandName}</span>
        </span>
        <div className="auth-aside-mid">
          <p className="auth-tagline">
            {hero.headline.map((p, i) =>
              typeof p === "string" ? (
                p
              ) : (
                <span key={i} className={p.className}>
                  {p.text}
                </span>
              ),
            )}
          </p>
          <p className="auth-aside-sub">{login.aside.sub}</p>
          <Image className="auth-crates" src="/illustrations/stock-crates.svg" alt="" width={357} height={394} priority unoptimized />
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
          <LoginCard initialError={initialError} nextDestination={next} />
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
