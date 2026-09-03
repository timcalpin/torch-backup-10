import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export interface RelapseSignalStats {
  signals_detected: number;
  critical_alerts: number;
}

export interface RelapseSignalLog {
  patient: string;
  email: string;
  signal_type: string;
  severity: string;
  reason: string;
  description: string;
  counselor: string;
  status: string;
  created_at: string;
  time?: string;
}

export function getRelapseSignalStats(): Promise<RelapseSignalStats> {
  return apiFetch<RelapseSignalStats>(
    "/api/v1/admin/relapse-signal-stats/",
  );
}

export function getRelapseSignalLogs(): Promise<PaginatedResponse<RelapseSignalLog> | RelapseSignalLog[]> {
  return apiFetch<PaginatedResponse<RelapseSignalLog> | RelapseSignalLog[]>(
    "/api/v1/admin/relapse-signal-logs/",
  );
}