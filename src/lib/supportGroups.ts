import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export interface ApiSupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  moderator: string | null;
  moderator_name: string | null;
  meeting_day: string;
  meeting_time: string;
  format: string;
  max_capacity: number;
  tags: string[];
  member_count: number;
  created_at: string;
  updated_at: string;
}

export function listSupportGroups(): Promise<PaginatedResponse<ApiSupportGroup>> {
  return apiFetch<PaginatedResponse<ApiSupportGroup>>("/api/v1/admin/support-groups/");
}

export function getSupportGroup(id: string): Promise<ApiSupportGroup> {
  return apiFetch<ApiSupportGroup>(`/api/v1/admin/support-groups/${id}/`);
}

export interface CreateSupportGroupPayload {
  name: string;
  description: string;
  category: string;
  meeting_day: string;
  meeting_time: string;
  format: string;
  max_capacity: number;
  tags: string[];
}

export function createSupportGroup(payload: CreateSupportGroupPayload): Promise<ApiSupportGroup> {
  return apiFetch<ApiSupportGroup>("/api/v1/admin/support-groups/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface UpdateSupportGroupPayload {
  max_capacity: number;
}

export function updateSupportGroup(id: string, payload: UpdateSupportGroupPayload): Promise<ApiSupportGroup> {
  return apiFetch<ApiSupportGroup>(`/api/v1/admin/support-groups/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteSupportGroup(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/support-groups/${id}/`, {
    method: "DELETE",
  });
}

export interface SupportGroupStats {
  total_groups: number;
  total_members: number;
  avg_group_size: number;
}

export function getSupportGroupStats(): Promise<SupportGroupStats> {
  return apiFetch<SupportGroupStats>("/api/v1/admin/support-groups/stats/");
}
