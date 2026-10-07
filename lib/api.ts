import { apiErrors, uploadRules } from "@/constants/id";
import { supabaseBrowser } from "./supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.muaraai.com";

export interface ApiResult<T> {
  data: T | null;
  /** Pesan untuk ditampilkan ke pengguna (Bahasa Indonesia), null kalau sukses. */
  error: string | null;
  status?: number;
  /** Kode error mesin dari backend (mis. FILE_TOO_LARGE) atau OFFLINE / TIMEOUT / NETWORK. */
  code?: string;
}

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE.includes("api.muaraai.com") && !cleanPath.startsWith("/v1/laku")
    ? `${API_BASE}/v1/laku${cleanPath}`
    : `${API_BASE}${cleanPath}`;
}

/**
 * Status HTTP → pesan yang bisa ditindaklanjuti. Untuk 4xx "isian" (400/404/409/413/422) pesan
 * server dipakai bila ada — backend sudah menulisnya dalam Bahasa Indonesia dan lebih spesifik.
 * 401/403/429/5xx selalu pakai pesan kita: pesan server di sana teknis/Inggris.
 */
export function friendlyError(status: number, serverMessage?: string | null, retryAfter?: string | null): string {
  const server = serverMessage?.trim() || null;
  if (status === 401) return apiErrors.unauthorized;
  if (status === 403) return apiErrors.forbidden;
  if (status === 429) {
    const s = retryAfter ? Number.parseInt(retryAfter, 10) : NaN;
    return apiErrors.rateLimited(Number.isFinite(s) ? s : null);
  }
  if (status === 502 || status === 503 || status === 504) return apiErrors.unavailable;
  if (status >= 500) return apiErrors.server;
  if (status === 413) return server ?? apiErrors.tooLarge;
  if (status === 409) return server ?? apiErrors.conflict;
  if (status === 404) return server ?? apiErrors.notFound;
  if (status === 422) return server ?? apiErrors.validation;
  if (status === 400) return server ?? apiErrors.badRequest;
  return server ?? apiErrors.unknown;
}

/** Exception dari fetch (bukan respons HTTP) → offline / timeout / jaringan. */
function transportError(err: unknown): ApiResult<never> {
  const name = err instanceof Error ? err.name : "";
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { data: null, error: apiErrors.offline, code: "OFFLINE" };
  }
  if (name === "TimeoutError" || name === "AbortError") {
    return { data: null, error: apiErrors.timeout, code: "TIMEOUT" };
  }
  return { data: null, error: apiErrors.network, code: "NETWORK" };
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = supabaseBrowser();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(ms) : undefined;
}

async function toResult<T>(res: Response): Promise<ApiResult<T>> {
  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    // bentuk error backend: {error:{code,message}} (lihat backend/app/main.py); detail.error = format lama
    const err = errJson?.error ?? errJson?.detail?.error ?? null;
    return {
      data: null,
      error: friendlyError(res.status, err?.message, res.headers.get("retry-after")),
      status: res.status,
      code: err?.code,
    };
  }
  if (res.status === 204) return { data: null, error: null, status: res.status };
  const data = (await res.json().catch(() => null)) as T | null;
  return { data, error: null, status: res.status };
}

/**
 * Fetch data from Laku FastAPI backend with Supabase Bearer token.
 * Returns { data, error, status, code } — never throws.
 */
export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...(options.headers as Record<string, string>),
    };
    const res = await fetch(buildApiUrl(path), { ...options, headers, signal: options.signal || timeoutSignal(15000) });
    return await toResult<T>(res);
  } catch (err: unknown) {
    return transportError(err);
  }
}

/** Upload multipart (file export / template stok). Browser yang menulis Content-Type + boundary. */
export async function apiUpload<T = unknown>(path: string, form: FormData): Promise<ApiResult<T>> {
  try {
    const res = await fetch(buildApiUrl(path), {
      method: "POST",
      headers: await authHeader(),
      body: form,
      signal: timeoutSignal(60000), // parse 20.000 baris bisa makan waktu
    });
    return await toResult<T>(res);
  } catch (err: unknown) {
    return transportError(err);
  }
}

/** Cek file di browser sebelum dikirim (A14). null = aman. */
export function validateUploadFile(file: File): string | null {
  const name = file.name || "file";
  const ext = name.toLowerCase().slice(name.lastIndexOf("."));
  if (![".csv", ".xlsx"].includes(ext)) return uploadRules.badType(name);
  if (file.size === 0) return uploadRules.empty;
  if (file.size > uploadRules.maxBytes)
    return uploadRules.tooLarge((file.size / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 1 }));
  return null;
}
