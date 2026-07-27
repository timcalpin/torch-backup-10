import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export interface ApiCounselor {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatar_url: string;
  patients_count: number;
}

// Some existing therapist rows have no first/last name on record, which makes
// `name` an empty string — fall back to initials/role so dropdowns and lists
// never render blank, indistinguishable entries.
export function counselorDisplayName(counselor: ApiCounselor): string {
  const trimmed = counselor.name.trim();
  if (trimmed) return trimmed;
  if (counselor.initials) return `${counselor.initials} — ${counselor.role || "Counselor"}`;
  return counselor.role || "Unnamed counselor";
}

export function listCounselors(): Promise<PaginatedResponse<ApiCounselor>> {
  return apiFetch<PaginatedResponse<ApiCounselor>>("/api/v1/admin/counselors/");
}

export function getCounselor(id: string): Promise<ApiCounselor> {
  return apiFetch<ApiCounselor>(`/api/v1/admin/counselors/${id}/`);
}

export interface CreateCounselorPayload {
  name: string;
  initials: string;
  role: string;
  avatar_url: string;
}

export function createCounselor(payload: CreateCounselorPayload): Promise<ApiCounselor> {
  return apiFetch<ApiCounselor>("/api/v1/admin/counselors/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface UpdateCounselorPayload {
  role: string;
}

export function updateCounselor(id: string, payload: UpdateCounselorPayload): Promise<ApiCounselor> {
  return apiFetch<ApiCounselor>(`/api/v1/admin/counselors/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCounselor(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/counselors/${id}/`, {
    method: "DELETE",
  });
}

export interface CounselorStats {
  total_counselors: number;
  total_patients_assigned: number;
}

export function getCounselorStats(): Promise<CounselorStats> {
  return apiFetch<CounselorStats>("/api/v1/admin/counselors/stats/");
}
