import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Server Supabase client bound to the request cookies, or null when env vars are not set. */
export async function supabaseServer() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: cookies are read-only there, the route handler sets them
        }
      },
    },
  });
}
