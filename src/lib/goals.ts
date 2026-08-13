import { apiFetch } from "./api";

export interface PillarGoal {
  objective: string;
}

export interface ApiGoalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  category: "body" | "mind" | "recovery" | "life" | string;
  objective: string;
  title?: string;
  updated_at?: string;
}

export interface ApiGoalsData {
  patient_id: string;
  patient_name: string;
  patient_email: string;

  body: PillarGoal;
  mind: PillarGoal;
  spirit: PillarGoal;
  life: PillarGoal;

  updated_at?: string;
}

export type ApiGoalsResponse = ApiGoalRecord[] | ApiGoalsData;

/**
 * Get all goals for a specific patient.
 *
 * GET:
 * /api/v1/admin/goals/<patientId>/
 */
export function getPatientGoals(
  patientId: string
): Promise<ApiGoalsResponse> {
  return apiFetch<ApiGoalsResponse>(
    `/api/v1/admin/goals/${patientId}/`
  );
}

/**
 * Update all goals for a specific patient.
 *
 * PUT:
 * /api/v1/admin/goals/<patientId>/
 */
export function updatePatientGoals(
  patientId: string,
  payload: {
    body: PillarGoal;
    mind: PillarGoal;
    spirit: PillarGoal;
    life: PillarGoal;
  }
): Promise<ApiGoalsResponse> {
  return apiFetch<ApiGoalsResponse>(
    `/api/v1/admin/goals/${patientId}/`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}
