import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type MetricStatus = "fresh" | "stale" | "missing" | "not_implemented";
export type MetricCategory = "body" | "mind" | "spirit";

export interface CategoryRollup {
  status: MetricStatus;
  last_updated: string | null;
}

export interface UserSummary {
  user_id: string;
  full_name: string;
  email: string;
  body: CategoryRollup;
  mind: CategoryRollup;
  spirit: CategoryRollup;
  sync_required: boolean;
  never_synced: boolean;
}

export interface MetricEntry {
  key: string;
  label: string;
  category: MetricCategory;
  unit: string;
  source: string;
  status: MetricStatus;
  value: number | string | null;
  last_updated: string | null;
  reason: string | null;
  crisis_floor_applied?: boolean;
}

export interface SourceCard {
  key: string;
  label: string;
  detail: string;
  status: MetricStatus;
  completed_label?: string;
}

export interface MetricsSummary {
  fresh: number;
  stale: number;
  missing: number;
  not_implemented: number;
}

export interface UserDetail {
  user: { id: string; full_name: string; email: string };
  summary: MetricsSummary;
  rollup: { body: CategoryRollup; mind: CategoryRollup; spirit: CategoryRollup };
  source_cards: SourceCard[];
  last_full_sync: string | null;
  sync_required: boolean;
  metrics: { body: MetricEntry[]; mind: MetricEntry[]; spirit: MetricEntry[] };
}

export interface FlaggedPayload {
  id: string;
  row_id: string;
  sync_timestamp: string;
  diagnosed_issue: string;
  verdict: string;
}

export interface PayloadSnapshot {
  id: string;
  sync_timestamp: string;
  payload: Record<string, unknown>;
  label: string;
}

export interface FieldComparisonRow {
  field: string;
  bad_value: unknown;
  healthy_value: unknown;
  diff: string;
  root_cause: string;
}

export interface PayloadComparison {
  bad_payload: PayloadSnapshot;
  healthy_payload: PayloadSnapshot | null;
  field_comparison: FieldComparisonRow[];
  root_cause_analysis: string[];
}

export interface PayloadInspectorData {
  total_payloads: number;
  flagged_count: number;
  clean_rate: number;
  flagged_payloads: FlaggedPayload[];
  comparison: PayloadComparison | null;
  generated_at: string;
}

export function getHealthKitDebugUsers(
  page: number = 1,
  search: string = ""
): Promise<PaginatedResponse<UserSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  return apiFetch<PaginatedResponse<UserSummary>>(`/api/v1/admin/healthkit/users/?${params.toString()}`);
}

export function getHealthKitDebugUserDetail(userId: string): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/api/v1/admin/healthkit/users/${userId}/`);
}

export function getHealthKitDebugPayloadInspector(userId: string): Promise<PayloadInspectorData> {
  return apiFetch<PayloadInspectorData>(`/api/v1/admin/healthkit/users/${userId}/payload-inspector/`);
}
