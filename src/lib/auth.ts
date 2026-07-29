import { apiFetch } from "./api";
import { clearTokens, getRefreshToken, setTokens } from "./tokens";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/api/v1/admin/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(response);
  return response;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      // Blacklists the refresh token server-side so it can't be rotated again.
      await apiFetch<void>("/api/v1/admin/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    clearTokens();
  }
}

export function getMe(): Promise<AdminUser> {
  return apiFetch<AdminUser>("/api/v1/admin/me/");
}
