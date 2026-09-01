import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export interface TestDataset {
  id: string;
  name: string;
  persona_type: string;
  data_points_loaded?: string[];
  data_points?: string[];
  date_loaded: string;
  status: "active" | "expired" | string;
  user_count?: number;
}

export interface LoadTestDataUser {
  name: string;
  email: string;
  created: boolean;
}

export interface LoadTestDataResponse {
  sheet: string;
  headers: string[];
  rows_read: number;
  rows_imported: number;
  users: LoadTestDataUser[];
}

export function listTestData(query: { search?: string; status?: string } = {}): Promise<PaginatedResponse<TestDataset>> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status && query.status !== "all") params.set("status", query.status);
  const suffix = params.toString();
  return apiFetch<PaginatedResponse<TestDataset>>(`/api/v1/admin/test-data/${suffix ? `?${suffix}` : ""}`);
}

export function loadTestData(file: File): Promise<LoadTestDataResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<LoadTestDataResponse>("/api/v1/admin/test-data/", {
    method: "POST",
    body: formData,
  });
}
