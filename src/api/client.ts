// ============================================================================
// Diamond Body — API Client (Production Hardened)
// ============================================================================

const PROD_FALLBACK = "https://the-diamond-body-backend.onrender.com/api/v1";

const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  PROD_FALLBACK ||
  "http://localhost:5000/api/v1";

console.log("[API] Using backend:", API_BASE);

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

class ApiError extends Error {
  status: number;
  details?: unknown;
  isNetworkError: boolean;
  constructor(status: number, message: string, details?: unknown, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

// ---------- token storage ----------

let accessToken: string | null = localStorage.getItem("db_access_token");
let refreshToken: string | null = localStorage.getItem("db_refresh_token");

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("db_access_token", access);
  localStorage.setItem("db_refresh_token", refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("db_access_token");
  localStorage.removeItem("db_refresh_token");
}

export function getAccessToken() { return accessToken; }

// ---------- public fetch ----------

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  _retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const fullUrl = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, { ...options, headers });
  } catch (_networkErr) {
    throw new ApiError(0, `Cannot reach server at ${API_BASE}`, undefined, true);
  }

  if (res.status === 401 && _retry && refreshToken) {
    try {
      const refRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refRes.ok) {
        const refJson: ApiResponse<{ accessToken: string; refreshToken: string }> = await refRes.json();
        setTokens(refJson.data.accessToken, refJson.data.refreshToken);
        headers["Authorization"] = `Bearer ${accessToken}`;
        res = await fetch(fullUrl, { ...options, headers });
      }
    } catch { }
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "Invalid response from server.", undefined, false);
  }

  if (!json.success) {
    throw new ApiError(res.status, json.message || "Request failed", (json as any).details, false);
  }

  return json.data;
}

export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
  } catch {
    throw new ApiError(0, "Cannot reach server.", undefined, true);
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new ApiError(res.status, json.message, (json as any).details, false);
  return json.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, fd: FormData) => apiUpload<T>(path, fd),
  baseUrl: API_BASE,
};