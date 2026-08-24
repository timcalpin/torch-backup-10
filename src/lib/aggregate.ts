import { apiFetch } from "./api";

export interface AggregateMetric {
  value: number;
  delta?: string;
}

export interface AggregateTrendItem {
  date: string;
  avgDays: number;
  checkIn: number;
  highRisk: number;
}

export interface AggregateSimpleItem {
  date: string;
  val: number;
}

export interface AggregateDashboardResponse {
  metrics: {
    avg_days_sober: AggregateMetric;
    active_users: AggregateMetric;
    avg_motivation: AggregateMetric;
    checkin_rate: AggregateMetric;
    high_risk: AggregateMetric;
    avg_anxiety: AggregateMetric;
  };

  trend: AggregateTrendItem[];

  motivation: AggregateSimpleItem[];

  anxiety: AggregateSimpleItem[];

  cohort_breakdowns?: {
    mat: AggregateCohortRow[];
    adherence: AggregateCohortRow[];
  };
}

export interface AggregateCohortRow {
  label: string;
  count: number;
  rs_score?: number;
  checkin_rate?: number;
  retention_90_day?: number;
}

export interface AggregateFilters {
  risk?: string;
  sobriety?: string;
  adherence?: string;
  mat?: string;
}

/**
 * Updated to accept optional start_date and end_date strings (YYYY-MM-DD).
 * It appends both snake_case and camelCase query params so your backend API receives them correctly.
 */
export function getAggregateDashboard(startDate?: string, endDate?: string, filters: AggregateFilters = {}) {
  const params = new URLSearchParams();

  if (startDate) {
    params.append("start_date", startDate);
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("end_date", endDate);
    params.append("endDate", endDate);
  }

  if (filters.risk && filters.risk !== "All") params.append("risk_tier", filters.risk);
  if (filters.sobriety && filters.sobriety !== "All") params.append("sobriety_stage", filters.sobriety);
  if (filters.adherence && filters.adherence !== "All") params.append("checkin_adherence", filters.adherence);
  if (filters.mat && filters.mat !== "All") params.append("mat_status", filters.mat);

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<AggregateDashboardResponse>(
    `/api/v1/admin/aggregate-dashboard/${queryString}`
  );
}
