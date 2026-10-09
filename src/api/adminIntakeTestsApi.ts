import { apiFetch } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/pagination";
import type { IntakeDebugLog, IntakeTest, IntakeTestDetail, IntakeUpload } from "@/types/intakeTests";

export interface IntakeTestsParams {
  page?: number;
  search?: string;
  status?: string;
  intake_version?: string;
  signal?: AbortSignal;
}

export function getIntakeTests(params: IntakeTestsParams = {}) {
  const query = new URLSearchParams({ page: String(params.page ?? 1) });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.intake_version && params.intake_version !== "all") query.set("intake_version", params.intake_version);
  return apiFetch<PaginatedResponse<IntakeTest>>(`/api/v1/admin/intake-tests/?${query}`, { signal: params.signal });
}

export function getIntakeTestDetail(intakeSessionId: string, signal?: AbortSignal) {
  return apiFetch<IntakeTestDetail>(`/api/v1/admin/intake-tests/${encodeURIComponent(intakeSessionId)}/`, { signal });
}

export interface IntakeUploadLogsResponse {
  upload?: IntakeUpload;
  logs: IntakeDebugLog[];
  logs_by_section?: Record<string, IntakeDebugLog[]>;
}

export function getIntakeUploadLogs(intakeSessionId: string, uploadId: string, signal?: AbortSignal) {
  return apiFetch<IntakeUploadLogsResponse | IntakeDebugLog[]>(`/api/v1/admin/intake-tests/${encodeURIComponent(intakeSessionId)}/uploads/${encodeURIComponent(uploadId)}/logs/`, { signal });
}
