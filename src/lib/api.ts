import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokens";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const UNAUTHORIZED_EVENT = "api:unauthorized";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const candidate = record.detail ?? record.message ?? record.error;
    if (typeof candidate === "string") return candidate;
    if (Array.isArray(record.errors)) {
      const messages = record.errors
        .slice(0, 5)
        .map((entry) => {
          if (entry && typeof entry === "object") {
            const item = entry as Record<string, unknown>;
            return `Row ${item.row ?? "?"}: ${String(item.message ?? item.error ?? "Invalid row")}`;
          }
          return String(entry);
        });
      if (messages.length) return messages.join(" · ");
    }
    const firstValue = Object.values(record)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];
  }
  return fallback;
}

// A burst of parallel calls can all 401 at once; they share this single
// in-flight refresh instead of each spending the (rotating) refresh token.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return null;
      const tokens = (await response.json()) as { access: string; refresh?: string };
      setTokens(tokens);
      return tokens.access;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function buildRequest(path: string, options: RequestInit, token: string | null): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      // FormData sets its own multipart boundary — let the browser fill it in.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await buildRequest(path, options, getAccessToken());

  // Access tokens are short-lived: on the first 401, trade the refresh token
  // for a new one and replay the request once.
  if (response.status === 401 && getRefreshToken()) {
    const access = await refreshAccessToken();
    if (access) {
      response = await buildRequest(path, options, access);
    }
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(response.status, extractErrorMessage(body, response.statusText), body);
  }

  return body as T;
}
