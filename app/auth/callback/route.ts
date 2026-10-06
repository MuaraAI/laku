import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/constants/id";
import { safeNext, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

// Handles Supabase auth callback (OAuth PKCE code, or Email magiclink token_hash)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next"), routes.afterLogin);

  // If OAuth or provider returned an error in callback URL
  if (searchParams.get("error")) {
    const desc = searchParams.get("error_description") || "";
    console.error("Auth callback error from provider:", desc);
    return NextResponse.redirect(`${origin}${routes.login}?error=oauth`);
  }

  if (supabaseUrl && supabaseAnonKey && (code || (token_hash && type))) {
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "email" | "magiclink" | "recovery" | "invite",
      });
      if (!error) return response;
      console.error("verifyOtp error:", error);
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return response;
      console.error("exchangeCodeForSession error:", error);
    }

    // Jika user sudah memiliki sesi aktif (misal redirect tanpa code)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}${routes.login}?error=callback`);
}
