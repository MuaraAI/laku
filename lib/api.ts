import { supabaseBrowser } from "./supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.muaraai.com";

/**
 * Fetch data from Laku FastAPI backend with Supabase Bearer token.
 * Returns null if unauthenticated or on fetch error (enables graceful fallback to mock data).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const supabase = supabaseBrowser();
    let token: string | undefined;

    if (supabase) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}
