import type { Metadata } from "next";
import Link from "next/link";
import LoginCard from "@/components/auth/LoginCard";
import { Icon, LakuMark } from "@/components/landing/primitives";
import { login, nav, routes } from "@/constants/id";

export const metadata: Metadata = { title: login.metaTitle };

type ErrorKey = keyof typeof login.errors;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const initialError = error && error in login.errors ? login.errors[error as ErrorKey] : null;
  return (
    <main className="auth">
      <div>
        <div className="auth-card">
          <Link className="auth-brand" href={routes.home} aria-label={nav.home}>
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
        <Link className="auth-back" href={routes.home}>
          <Icon name="arrow_back" />
          {login.back}
        </Link>
      </div>
    </main>
  );
}
