"use client";

import Image from "next/image";
import { useState } from "react";
import { login, routes } from "@/constants/id";
import { Icon } from "@/components/landing/primitives";

export default function LoginCard({ initialError }: { initialError: string | null }) {
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    // the Supabase client only loads when someone actually signs in
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = supabaseBrowser();
    if (!supabase) return setError(login.errors.config);
    setLoading(true);
    setError(null);
    const redirectTo = `${location.origin}/auth/callback?next=${encodeURIComponent(routes.afterLogin)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (oauthError) {
      setLoading(false);
      setError(login.errors.oauth);
    }
  };

  return (
    <>
      {error && (
        <p className="auth-error" role="alert">
          <Icon name="error" />
          {error}
        </p>
      )}
      <button className="btn btn-outline auth-google" type="button" onClick={signIn} disabled={loading} aria-busy={loading}>
        <Image src="/google-g.svg" alt="" width={20} height={20} unoptimized />
        {loading ? login.loading : login.google}
      </button>
    </>
  );
}
