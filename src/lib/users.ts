import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  counselor: string;
  sobriety_days: number | null;
  sobriety_start_date: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface CreateUserResponse {
  user: ApiUser;  
  temporary_password: string;
}

export function listUsers(): Promise<PaginatedResponse<ApiUser>> {
  return apiFetch<PaginatedResponse<ApiUser>>("/api/v1/admin/users/");
}

export function getUser(id: string): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/api/v1/admin/users/${id}/`);
}

export interface UserStats {
  total_users: number;
  active_this_week: number;
  new_this_month: number;
}

export function getUserStats(): Promise<UserStats> {
  return apiFetch<UserStats>("/api/v1/admin/users/stats/");
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  is_active: boolean;
  sobriety_start_date: string | null;
  role: string;
}

export function createUser(
  payload: CreateUserPayload
): Promise<CreateUserResponse> {
  return apiFetch<CreateUserResponse>("/api/v1/admin/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface UpdateUserPayload {
  full_name: string;
  role: string;
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/api/v1/admin/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/users/${id}/`, {
    method: "DELETE",
  });
}
