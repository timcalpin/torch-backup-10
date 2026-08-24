import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";
import { withAdminQuery, type AdminQuery } from "./adminQuery";

export const COUNSELOR_STATUSES = ["active", "inactive", "pending"] as const;
export type CounselorStatus = (typeof COUNSELOR_STATUSES)[number];

export const COUNSELOR_STATUS_LABELS: Record<CounselorStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

// Must match Therapist.Specialization choices exactly — this is an enum on
// the backend, not free text.
export const COUNSELOR_SPECIALIZATIONS = [
  "addiction_trauma",
  "cbt_dbt",
  "family_therapy",
  "grief_counseling",
] as const;
export type CounselorSpecialization = (typeof COUNSELOR_SPECIALIZATIONS)[number];

export const COUNSELOR_SPECIALIZATION_LABELS: Record<CounselorSpecialization, string> = {
  addiction_trauma: "Addiction, Trauma",
  cbt_dbt: "CBT / DBT",
  family_therapy: "Family Therapy",
  grief_counseling: "Grief Counseling",
};

export interface ApiCounselor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string; // read-only, computed server-side from first_name + last_name
  email: string | null;
  phone: string;
  specialization: CounselorSpecialization;
  specialization_label: string; // read-only, human label from the server
  license_number: string | null;
  status: CounselorStatus;
  status_label: string; // read-only, human label from the server
  notes_credentials: string;
  initials: string; // read-only, auto-generated server-side on save
  role: string;
  avatar_url: string | null;
  patient_count: number;
  created_at: string;
  updated_at: string;
}

// A handful of legacy rows may have no first/last name on record yet —
// fall back so lists and dropdowns never render a blank, indistinguishable entry.
export function counselorDisplayName(counselor: ApiCounselor): string {
  const trimmed = (counselor.name ?? "").trim();
  if (trimmed) return trimmed;
  if (counselor.initials) return `${counselor.initials} — ${counselor.role || "Counselor"}`;
  return counselor.role || "Unnamed counselor";
}

export function listCounselors(query: AdminQuery = {}): Promise<PaginatedResponse<ApiCounselor>> {
  return apiFetch<PaginatedResponse<ApiCounselor>>(withAdminQuery("/api/v1/admin/counselors/", query));
}

export function getCounselor(id: string): Promise<ApiCounselor> {
  return apiFetch<ApiCounselor>(`/api/v1/admin/counselors/${id}/`);
}

// `initials` is server-generated (read-only on the API) — don't send it.
// `role` has a model default ("Licensed Counselor") and `avatar_url` is
// blank-able, so both are optional here.
export interface CreateCounselorPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: CounselorSpecialization;
  license_number: string;
  status: CounselorStatus;
  notes_credentials: string;
  role?: string;
  avatar_url?: string;
}

export function createCounselor(payload: CreateCounselorPayload): Promise<ApiCounselor> {
  return apiFetch<ApiCounselor>("/api/v1/admin/counselors/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Email is intentionally excluded from updates — it's the counselor's
// identity/login and is not editable once the record is created.
export type UpdateCounselorPayload = Partial<Omit<CreateCounselorPayload, "email">>;

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
