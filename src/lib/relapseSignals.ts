import { apiFetch } from "./api";

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
}

export function getRelapseSignalStats(): Promise<RelapseSignalStats> {
  return apiFetch<RelapseSignalStats>(
    "/api/v1/admin/relapse-signal-stats/",
  );
}

export function getRelapseSignalLogs(): Promise<RelapseSignalLog[]> {
  return apiFetch<RelapseSignalLog[]>(
    "/api/v1/admin/relapse-signal-logs/",
  );
}