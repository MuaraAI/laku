"use client";

import Image from "next/image";
import { useState } from "react";
import { login, routes } from "@/constants/id";
import { Icon } from "@/components/landing/primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginCard({
  initialError,
  nextDestination,
}: {
  initialError: string | null;
  nextDestination?: string;
}) {
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const targetNext = nextDestination || "/dashboard?mode=live";

  const redirectTo = () =>
    `${location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`;

  const signIn = async () => {
    // the Supabase client only loads when someone actually signs in
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = supabaseBrowser();
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

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return setError(login.email.invalid);
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = supabaseBrowser();
    if (!supabase) return setError(login.errors.config);
    setSending(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        emailRedirectTo: redirectTo(),
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (otpError) return setError(login.email.failed);
    setSentTo(value);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenVal = otpCode.trim();
    if (!tokenVal || !sentTo) return;
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = supabaseBrowser();
    if (!supabase) return setError(login.errors.config);
    setVerifying(true);
    setError(null);
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: sentTo,
      token: tokenVal,
      type: "email",
    });
    setVerifying(false);
    if (verifyErr) {
      setError("Kode OTP salah atau kedaluwarsa. Periksa kode di email.");
      return;
    }
    window.location.href = targetNext;
  };

  if (sentTo) {
    return (
      <div className="auth-email">
        <div className="auth-sent" role="status">
          <span className="ms" aria-hidden="true">mark_email_read</span>
          <p>{login.email.sent(sentTo)}</p>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            <Icon name="error" />
            {error}
          </p>
        )}

        <form onSubmit={verifyOtp} style={{ display: "grid", gap: "10px" }}>
          <label className="auth-label" htmlFor="otp">
            Atau masukkan kode 6-digit dari email
          </label>
          <input
            className="auth-input"
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Contoh: 123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={10}
            required
          />
          <button
            className="btn btn-primary auth-email-btn"
            type="submit"
            disabled={verifying || !otpCode.trim()}
            aria-busy={verifying}
          >
            {verifying ? "Memverifikasi…" : "Masuk dengan kode"}
          </button>
        </form>

        <button
          className="btn btn-outline"
          type="button"
          onClick={() => {
            setSentTo(null);
            setOtpCode("");
            setError(null);
          }}
          style={{ minHeight: "44px" }}
        >
          ← Gunakan email lain
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="auth-error" role="alert">
          <Icon name="error" />
          {error}
        </p>
      )}

      <form className="auth-email" onSubmit={sendMagicLink}>
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
          placeholder={login.email.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary auth-email-btn" type="submit" disabled={sending || !email.trim()} aria-busy={sending}>
          {sending ? login.email.sending : login.email.send}
        </button>
      </form>

      <p className="auth-divider" role="separator">
        <span>{login.email.divider}</span>
      </p>

      <button className="btn btn-outline auth-google" type="button" onClick={signIn} disabled={loading} aria-busy={loading}>
        <Image src="/google-g.svg" alt="" width={20} height={20} unoptimized />
        {loading ? login.loading : login.google}
      </button>

      <div style={{ marginTop: "8px", paddingTop: "14px", borderTop: "1px dashed var(--border)", textAlign: "center" }}>
        <a href={routes.afterLogin} className="btn btn-outline" style={{ width: "100%", justifyContent: "center", minHeight: "44px", fontSize: "0.875rem" }}>
          Mode Demo (Buka Dashboard Langsung) →
        </a>
      </div>

      <p style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
        Bantuan:{" "}
        <a href="mailto:support@laku.muaraai.com" style={{ color: "var(--primary)" }}>
          support@laku.muaraai.com
        </a>
      </p>
    </>
  );
}
