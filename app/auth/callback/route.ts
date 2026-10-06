import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/constants/id";
import { safeNext } from "@/lib/supabase/env";
import { supabaseServer } from "@/lib/supabase/server";

// Google → Supabase → here with ?code=…; exchange it for a session cookie, then continue.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), routes.afterLogin);
  if (code) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}${routes.login}?error=callback`);
}
