import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

export interface ApiCounselor {
  id: string | number;
  full_name?: string;
  name?: string;
  email?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  counselor?: ApiCounselor | string | null;
  sobriety_days: number | null;
  sobriety_start_date: string | null;
  primary_substance?: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface CreateUserResponse {
  user: ApiUser;  
  temporary_password: string;
}

export interface CreateUserResponse {
  user: ApiUser;  
  temporary_password: string;
}

export interface Recoveryuser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  counselor: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  days_sober: number;
  sobriety_date: string | null;
  session_mode: string | null;
  relapse_spectrum: {
    score: number;
    score_date: string;
  } | null;
  checkins: {
    id: string;
    date: string;
    type: string;
    mood: string | null;
    score: number;
    status: string;
  }[];
}

export function listUsers(page: number = 1): Promise<PaginatedResponse<ApiUser>> {
  return apiFetch<PaginatedResponse<ApiUser>>(`/api/v1/admin/users/?page=${page}`);
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

export function getUsersdetails(id: string): Promise<Recoveryuser> {
  return apiFetch<Recoveryuser>(`/api/v1/admin/users/views/${id}/`);
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  counselor?: string | number | null;
  counselor_name?: string | null;
  is_active: boolean;
  sobriety_start_date?: string | null;
  primary_substance?: string | null;
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
  phone?: string | null;
  role: string;
  counselor?: string | number | null;
  counselor_name?: string | null;
  is_active?: boolean;
  sobriety_start_date?: string | null;
  primary_substance?: string | null;
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