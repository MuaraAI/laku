import { supabaseBrowser } from "./supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.muaraai.com";

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status?: number;
}

/**
 * Fetch data from Laku FastAPI backend with Supabase Bearer token.
 * Returns { data, error, status }.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
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

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = API_BASE.includes("api.muaraai.com") && !cleanPath.startsWith("/v1/laku")
      ? `${API_BASE}/v1/laku${cleanPath}`
      : `${API_BASE}${cleanPath}`;

    const signal = options.signal || (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(15000) : undefined);

    const res = await fetch(url, {
      ...options,
      headers,
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.detail?.error?.message || errJson?.error?.message || `HTTP ${res.status}`;
      return { data: null, error: errMsg, status: res.status };
    }

    const data = (await res.json()) as T;
    return { data, error: null, status: res.status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Koneksi terputus";
    return { data: null, error: msg };
  }
}
