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
}

/**
 * Updated to accept optional start_date and end_date strings (YYYY-MM-DD).
 * It appends both snake_case and camelCase query params so your backend API receives them correctly.
 */
export function getAggregateDashboard(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();

  if (startDate) {
    params.append("start_date", startDate);
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("end_date", endDate);
    params.append("endDate", endDate);
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<AggregateDashboardResponse>(
    `/api/v1/admin/aggregate-dashboard/${queryString}`
  );
}