import { apiFetch } from "./api";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  user?: AdminUser;
  [key: string]: unknown;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/v1/admin/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/api/v1/admin/logout/", {
    method: "POST",
  });
}

export function getMe(): Promise<AdminUser> {
  return apiFetch<AdminUser>("/api/v1/admin/me/");
}
