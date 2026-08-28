import { ApiError, apiFetch } from "./api";

export interface PillarGoal {
  objective: string;
  actions?: string[];
}

export interface ApiGoalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  category: "body" | "mind" | "recovery" | "life" | string;
  objective: string;
  actions?: string[];
  title?: string;
  updated_at?: string;
}

export interface ApiGoalsData {
  patient_id: string;
  patient_name: string;
  patient_email: string;

  body: PillarGoal;
  mind: PillarGoal;
  recovery?: PillarGoal;
  spirit?: PillarGoal;
  life: PillarGoal;

  updated_at?: string;
}

export type ApiGoalsResponse = ApiGoalRecord[] | ApiGoalsData;

export interface UpdateGoalsPayload {
  body: PillarGoal;
  mind: PillarGoal;
  /** Goals use the same Spirit key as the working treatment-plan payload. */
  spirit: PillarGoal;
  life: PillarGoal;
}

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
  payload: UpdateGoalsPayload,
): Promise<ApiGoalsResponse> {
  const path = `/api/v1/admin/goals/${patientId}/`;
  const body = JSON.stringify(payload);

  // Goals are documented as a full PUT update. Keep PATCH as a compatibility
  // fallback for deployments that expose the newer partial-update route.
  return apiFetch<ApiGoalsResponse>(path, { method: "PUT", body }).catch((error) => {
    if (!(error instanceof ApiError) || error.status !== 405) {
      throw error;
    }
    return apiFetch<ApiGoalsResponse>(path, { method: "PATCH", body });
  });
}
