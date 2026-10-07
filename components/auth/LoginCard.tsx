"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { footer, login, routes } from "@/constants/id";
import { Icon } from "@/components/landing/primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LEN = 6;
const RESEND_SECONDS = 60;

// the Supabase client only loads when someone actually signs in
const getSupabase = async () => (await import("@/lib/supabase/client")).supabaseBrowser();

export default function LoginCard({
  initialError,
  nextDestination,
}: {
  initialError: string | null;
  nextDestination?: string;
}) {
  // page-level problems (OAuth, config, callback) vs. problems with what was typed
  const [error, setError] = useState(initialError);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const targetNext = nextDestination || "/dashboard?mode=live";
  const redirectTo = () => `${location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const signIn = async () => {
    const supabase = await getSupabase();
    if (!supabase) return setError(login.errors.config);
    setLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (oauthError) {
      setLoading(false);
      setError(login.errors.oauth);
    }
  };

  const requestCode = async (address: string) => {
    // OTP via backend: kode 6 digit dikirim Resend (template Supabase default
    // mengirim magic link, bukan kode — lihat backend/app/routers/auth_otp.py).
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.muaraai.com";
    const url = API_BASE.includes("api.muaraai.com")
      ? `${API_BASE}/v1/laku/v1/auth/otp/request`
      : `${API_BASE}/v1/auth/otp/request`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return setFieldError(login.email.empty);
    if (!EMAIL_RE.test(value)) return setFieldError(login.email.invalid);
    setSending(true);
    setError(null);
    setFieldError(null);
    const ok = await requestCode(value);
    setSending(false);
    if (!ok) return setFieldError(login.email.failed);
    setSentTo(value);
    setCooldown(RESEND_SECONDS);
  };

  const resend = async () => {
    if (!sentTo || cooldown > 0) return;
    setNotice(null);
    setFieldError(null);
    setCooldown(RESEND_SECONDS);
    const ok = await requestCode(sentTo);
    if (ok) setNotice(login.otp.resent);
    else {
      setCooldown(0);
      setFieldError(login.email.failed);
    }
  };

  const verifyOtp = async (token: string) => {
    if (token.length !== OTP_LEN || !sentTo || verifying) return;
    const supabase = await getSupabase();
    if (!supabase) return setError(login.errors.config);
    setVerifying(true);
    setFieldError(null);
    setNotice(null);
    // Verifikasi via backend → dapat session Supabase asli → setSession lokal.
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.muaraai.com";
    const url = API_BASE.includes("api.muaraai.com")
      ? `${API_BASE}/v1/laku/v1/auth/otp/verify`
      : `${API_BASE}/v1/auth/otp/verify`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo, token }),
      });
      if (!res.ok) {
        setVerifying(false);
        setFieldError(login.otp.invalid);
        setOtpCode("");
        return;
      }
      const session = await res.json();
      const { error: setErr } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (setErr) {
        setVerifying(false);
        setFieldError(login.otp.invalid);
        setOtpCode("");
        return;
      }
      window.location.href = targetNext;
    } catch {
      setVerifying(false);
      setFieldError(login.otp.invalid);
      setOtpCode("");
    }
  };

  // digits only (pasting "123 456" works too); verifies by itself once the last digit lands
  const onOtpChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, OTP_LEN);
    setOtpCode(digits);
    setFieldError(null);
    if (digits.length === OTP_LEN) verifyOtp(digits);
  };

  const pageError = error && (
    <p className="auth-error" role="alert">
      <Icon name="error" />
      {error}
    </p>
  );

  if (sentTo) {
    return (
      <div className="auth-step">
        <div className="auth-sent" role="status">
          <span className="auth-sent-icon">
            <Icon name="mark_email_read" />
          </span>
          <div>
            <h2>{login.otp.title}</h2>
            <p>
              {login.otp.sentLead} <b>{sentTo}</b>.
            </p>
            <p className="auth-sent-hint">{login.otp.spam}</p>
          </div>
        </div>

        {pageError}

        <form
          className="auth-email"
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp(otpCode);
          }}
          noValidate
        >
          <label className="auth-label" htmlFor="otp">
            {login.otp.label}
          </label>
          <input
            className="auth-input auth-otp"
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            autoFocus
            maxLength={OTP_LEN}
            value={otpCode}
            onChange={(e) => onOtpChange(e.target.value)}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? "otp-msg" : undefined}
          />
          {fieldError && (
            <p className="auth-field-error" id="otp-msg" role="alert">
              {fieldError}
            </p>
          )}
          <button className="btn btn-primary auth-email-btn" type="submit" disabled={verifying || otpCode.length !== OTP_LEN} aria-busy={verifying}>
            {verifying ? login.otp.verifying : login.otp.verify}
          </button>
        </form>

        <div className="auth-otp-actions">
          <button type="button" className="auth-link" onClick={resend} disabled={cooldown > 0}>
            <Icon name="refresh" />
            {cooldown > 0 ? login.otp.resendIn(cooldown) : login.otp.resend}
          </button>
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setSentTo(null);
              setOtpCode("");
              setFieldError(null);
              setNotice(null);
            }}
          >
            <Icon name="edit" />
            {login.otp.change}
          </button>
        </div>
        <p className="auth-notice" aria-live="polite">
          {notice}
        </p>
      </div>
    );
  }

  return (
    <div className="auth-step">
      {pageError}

      {/* fastest path first: one tap with Google, email as the fallback */}
      <button className="btn btn-outline auth-google" type="button" onClick={signIn} disabled={loading} aria-busy={loading}>
        <Image src="/google-g.svg" alt="" width={20} height={20} unoptimized />
        {loading ? login.loading : login.google}
      </button>

      <p className="auth-divider" role="separator">
        <span>{login.email.divider}</span>
      </p>

      <form className="auth-email" onSubmit={sendMagicLink} noValidate>
        <label className="auth-label" htmlFor="email">
          {login.email.label}
        </label>
        <input
          className="auth-input"
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={login.email.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldError(null);
          }}
          aria-invalid={!!fieldError}
          aria-describedby="email-msg"
        />
        <p className={fieldError ? "auth-field-error" : "auth-field-hint"} id="email-msg" role={fieldError ? "alert" : undefined}>
          {fieldError ?? login.email.hint}
        </p>
        <button className="btn btn-primary auth-email-btn" type="submit" disabled={sending} aria-busy={sending}>
          {sending ? login.email.sending : login.email.send}
        </button>
      </form>

      <a href={routes.afterLogin} className="auth-demo">
        <span className="auth-demo-icon">
          <Icon name="play_circle" />
        </span>
        <span>
          <b>{login.demo.title}</b>
          <small>{login.demo.sub}</small>
        </span>
        <Icon name="arrow_forward" className="auth-demo-go" />
      </a>

      <p className="auth-help">
        {login.help} <a href={`mailto:${footer.email}`}>{footer.email}</a>
      </p>
    </div>
  );
}
