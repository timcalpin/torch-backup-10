import { apiFetch } from "./api";

export interface MetricFilters {
  metric: string;
  risk?: string;
  sobriety?: string;
  adherence?: string;
  mat?: string;
  compare?: boolean;
  cohortA?: string;
  cohortB?: string;
}
export interface MetricCohortValue { key: string; label: string; value: number; }
export interface MetricDetailResponse {
  metric: string;
  unit: string;
  population: number;
  trend: { date: string; cohorts: MetricCohortValue[] }[];
  distribution: { label: string; cohorts: MetricCohortValue[] }[];
  cohortComparison: { key: string; label: string; count: number; value: number }[];
}

interface BackendMetricDetail {
  metric: string;
  start_date: string;
  end_date: string;
  compare_mode: boolean;
  cohorts: {
    cohort: string;
    label?: string;
    count: number;
    value: number;
    trend: { date: string; value: number }[];
  }[];
  distribution: { key: string; label: string; count: number; cohorts?: { cohort: string; count: number }[] }[];
}

function cohortKey(value: string, index: number) {
  if (value === "A") return "a";
  if (value === "B") return "b";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `cohort-${index}`;
}

function cohortLabel(value: string, filters: MetricFilters) {
  if (value === "A") return filters.cohortA ?? "Cohort A";
  if (value === "B") return filters.cohortB ?? "Cohort B";
  const labels: Record<string, string> = {
    sobriety_365_plus: "Sobriety 365+",
    sobriety_0_30: "Sobriety 0–30",
    adherence_over_75: "Adherence >75%",
    adherence_under_25: "Adherence <25%",
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

export function getMetricDetail(filters: MetricFilters) {
  const params = new URLSearchParams({ metric: filters.metric });
  params.set("start_date", "2026-06-15");
  params.set("end_date", "2026-08-09");
  if (filters.compare) {
    params.set("compare", "true");
    if (filters.cohortA) params.set("cohort_a", filters.cohortA);
    if (filters.cohortB) params.set("cohort_b", filters.cohortB);
  }
  if (filters.risk && filters.risk !== "All") params.set("risk_tier", filters.risk);
  if (filters.sobriety && filters.sobriety !== "All") params.set("sobriety_stage", filters.sobriety);
  if (filters.adherence && filters.adherence !== "All") params.set("checkin_adherence", filters.adherence);
  if (filters.mat && filters.mat !== "All") params.set("mat_status", filters.mat);
  return apiFetch<BackendMetricDetail>(`/api/v1/admin/aggregate-dashboard/${encodeURIComponent(filters.metric)}/?${params.toString()}`).then((payload) => {
    const cohorts = payload.cohorts.map((cohort, index) => ({
      key: cohortKey(cohort.cohort, index),
      label: cohort.label ?? cohortLabel(cohort.cohort, filters),
      value: cohort.value,
      count: cohort.count,
      trend: cohort.trend,
    }));
    const dates = Array.from(new Set(cohorts.flatMap((cohort) => cohort.trend.map((point) => point.date)))).sort();
    return {
      metric: payload.metric,
      unit: filters.metric.includes("days") ? "d" : "",
      population: cohorts.reduce((total, cohort, index) => index === 0 ? cohort.count : total, 0),
      trend: dates.map((date) => ({ date, cohorts: cohorts.map((cohort) => ({ key: cohort.key, label: cohort.label, value: cohort.trend.find((point) => point.date === date)?.value ?? 0 })) })),
      distribution: payload.distribution.map((bucket) => ({
        label: bucket.label,
        cohorts: bucket.cohorts?.length
          ? bucket.cohorts.map((cohort, index) => ({ key: cohortKey(cohort.cohort, index), label: cohortLabel(cohort.cohort, filters), value: cohort.count }))
          : [{ key: "a", label: cohorts[0]?.label ?? "Population", value: bucket.count }],
      })),
      cohortComparison: cohorts.map((cohort) => ({ key: cohort.key, label: cohort.label, count: cohort.count, value: cohort.value })),
    } satisfies MetricDetailResponse;
  });
}
