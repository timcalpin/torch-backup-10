import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

export const TREATMENT_PLAN_STATUSES = ["draft", "active", "on_hold", "completed"] as const;
export type TreatmentPlanStatus = (typeof TREATMENT_PLAN_STATUSES)[number];

export interface ApiTreatmentPlan {
  id: string;
  title: string | null;
  patient: string | null;
  patient_name: string | null;
  patient_email: string | null;
  counselor: string | null;
  counselor_name: string | null;
  start_date: string | null;
  duration: string | null;
  goals_and_milestones: string | null;
  status: TreatmentPlanStatus | null;
  progress: number | null;
  created_at: string;
  updated_at: string;
}

export interface TreatmentPlanStats {
  total_plans: number;
  active_count: number;
  completed_count: number;
  pending_count: number;
  avg_progress: number;
}

export function listTreatmentPlans(): Promise<PaginatedResponse<ApiTreatmentPlan>> {
  return apiFetch<PaginatedResponse<ApiTreatmentPlan>>("/api/v1/admin/treatment-plans/");
}

export function getTreatmentPlan(id: string): Promise<ApiTreatmentPlan> {
  return apiFetch<ApiTreatmentPlan>(`/api/v1/admin/treatment-plans/${id}/`);
}

export function getTreatmentPlanStats(): Promise<TreatmentPlanStats> {
  return apiFetch<TreatmentPlanStats>("/api/v1/admin/treatment-plans/stats/");
}

export interface TreatmentPlanPayload {
  title: string;
  patient: string | null;
  counselor: string | null;
  start_date: string | null;
  duration: string;
  goals_and_milestones: string;
  status: TreatmentPlanStatus;
  progress?: number | null;
}

export function createTreatmentPlan(payload: TreatmentPlanPayload): Promise<ApiTreatmentPlan> {
  return apiFetch<ApiTreatmentPlan>("/api/v1/admin/treatment-plans/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTreatmentPlan(id: string, payload: Partial<TreatmentPlanPayload>): Promise<ApiTreatmentPlan> {
  return apiFetch<ApiTreatmentPlan>(`/api/v1/admin/treatment-plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTreatmentPlan(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/treatment-plans/${id}/`, {
    method: "DELETE",
  });
}

export interface PillarData {
  objective: string;
  actions: string[];
}

export interface TreatmentPlanStructure {
  clientOverview: string;
  body: PillarData;
  mind: PillarData;
  spirit: PillarData;
  life: PillarData;
}

export const EMPTY_TREATMENT_PLAN_STRUCTURE: TreatmentPlanStructure = {
  clientOverview: "",
  body: {
    objective: "",
    actions: [""],
  },
  mind: {
    objective: "",
    actions: [""],
  },
  spirit: {
    objective: "",
    actions: [""],
  },
  life: {
    objective: "",
    actions: [""],
  },
};