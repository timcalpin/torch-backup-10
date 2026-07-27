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
    const firstValue = Object.values(record)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];
  }
  return fallback;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const csrfToken = UNSAFE_METHODS.has(method) ? getCookie("csrftoken") : null;
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // FormData sets its own multipart boundary — let the browser fill it in.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(response.status, extractErrorMessage(body, response.statusText), body);
  }

  return body as T;
}
