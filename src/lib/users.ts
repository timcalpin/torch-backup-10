import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";
import { withAdminQuery, type AdminQuery } from "./adminQuery";

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
  counselor_name?: string | null;
  sobriety_days: number | null;
  days_sober?: number | null;
  sobriety_start_date: string | null;
  sobriety_date?: string | null;
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

    mood: {
      score: number | null;
      label: string | null;
    };
    notes_snippet: string;
    status: string;
  }[];
}

export function listUsers(query: AdminQuery = {}): Promise<PaginatedResponse<ApiUser>> {
  return apiFetch<PaginatedResponse<ApiUser>>(withAdminQuery("/api/v1/admin/users/", query));
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
  return apiFetch<Recoveryuser>(`/api/v1/admin/users/views/${id}/`).catch((error) => {
    // The recovery view aggregates check-ins and relapse data. If that
    // aggregation fails for a single user, keep the profile usable with the
    // canonical user endpoint instead of showing a generic 500 error page.
    if (!(error instanceof Error) || !("status" in error)) throw error;
    const status = (error as { status?: number }).status;
    if (status === undefined || status < 500 || status >= 600) throw error;

    return getUser(id).then((user): Recoveryuser => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      counselor:
        typeof user.counselor === "string"
          ? user.counselor
          : user.counselor?.full_name ?? user.counselor?.name ?? null,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      created_at: user.created_at,
      days_sober: user.sobriety_days ?? 0,
      sobriety_date: user.sobriety_start_date,
      session_mode: null,
      relapse_spectrum: null,
      checkins: [],
    }));
  });
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
