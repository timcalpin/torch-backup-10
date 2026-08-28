import { apiFetch } from "./api";

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

export function loadTestData(file: File): Promise<LoadTestDataResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<LoadTestDataResponse>("/api/v1/admin/load-test-data/", {
    method: "POST",
    body: formData,
  });
}
