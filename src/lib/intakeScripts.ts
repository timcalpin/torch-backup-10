import { apiFetch, ApiError } from "./api";
import { getAccessToken } from "./tokens";
import type { PaginatedResponse } from "./pagination";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Reuses the exact same vocabulary as the mobile app's Dart IntakeStepType
 * enum (and the backend's existing IntakeAsyncRespondSerializer.question_type
 * choices) so there's no separate mapping table anywhere.
 */
export type IntakeStepType =
  | "consent"
  | "preferredName"
  | "profileVerify"
  | "open"
  | "yesNo"
  | "multiSelect"
  | "scale"
  | "criticalYesNo"
  | "info"
  | "closing";

export const INTAKE_STEP_TYPES: IntakeStepType[] = [
  "consent",
  "preferredName",
  "profileVerify",
  "open",
  "yesNo",
  "multiSelect",
  "scale",
  "criticalYesNo",
  "info",
  "closing",
];

export type SkipIfOperator =
  | "equals"
  | "not_equals"
  | "multi_select_contains"
  | "multi_select_not_contains"
  | "multi_select_any"
  | "multi_select_empty";

export const SKIP_IF_OPERATORS: SkipIfOperator[] = [
  "equals",
  "not_equals",
  "multi_select_contains",
  "multi_select_not_contains",
  "multi_select_any",
  "multi_select_empty",
];

export interface SkipIf {
  op: SkipIfOperator;
  key: string;
  value?: unknown;
}

export interface IntakeScriptStep {
  key: string;
  type: IntakeStepType;
  section: number;
  section_title?: string;
  prompt: string;
  options?: string[] | null;
  scale_labels?: { low?: string; high?: string } | null;
  has_deceased_follow_up?: boolean;
  skip_if?: SkipIf | null;
  /** Free text the .docx parser left for manual review (e.g. branching notes it couldn't safely auto-convert). */
  parser_note?: string;
}

export interface IntakeScriptSummary {
  id: string;
  version_label: string;
  status: "draft" | "live";
  source_filename: string;
  file_size: number | null;
  step_count: number;
  uploaded_by_name: string | null;
  published_by_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntakeScriptDetail extends IntakeScriptSummary {
  steps: IntakeScriptStep[];
  parser_warnings: string[];
}

export function listIntakeScripts(page = 1): Promise<PaginatedResponse<IntakeScriptSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<PaginatedResponse<IntakeScriptSummary>>(`/api/v1/admin/intake-scripts/?${params.toString()}`);
}

export function getIntakeScript(id: string): Promise<IntakeScriptDetail> {
  return apiFetch<IntakeScriptDetail>(`/api/v1/admin/intake-scripts/${id}/`);
}

export function uploadIntakeScript(file: File, versionLabel: string): Promise<IntakeScriptDetail> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("version_label", versionLabel);
  return apiFetch<IntakeScriptDetail>("/api/v1/admin/intake-scripts/", {
    method: "POST",
    body: formData,
  });
}

export function updateIntakeScript(
  id: string,
  payload: { version_label?: string; steps?: IntakeScriptStep[] }
): Promise<IntakeScriptDetail> {
  return apiFetch<IntakeScriptDetail>(`/api/v1/admin/intake-scripts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function publishIntakeScript(id: string): Promise<IntakeScriptDetail> {
  return apiFetch<IntakeScriptDetail>(`/api/v1/admin/intake-scripts/${id}/publish/`, {
    method: "POST",
  });
}

export function deleteIntakeScript(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/intake-scripts/${id}/`, {
    method: "DELETE",
  });
}

/**
 * Downloads the originally uploaded .docx for a version. Uses a raw fetch
 * (not apiFetch) since the response is a binary file, not JSON.
 */
export async function downloadIntakeScript(id: string, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/intake-scripts/${id}/download/`, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = (body && (body.detail as string)) || "Unable to download this file.";
    throw new ApiError(response.status, message, body);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
