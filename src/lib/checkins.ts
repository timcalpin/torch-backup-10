import { apiFetch } from "./api";

export interface CreateCheckInPayload {
  patient: string;
  date: string;
  mood: string;
  score: number;
  notes: string;
  status: "completed";
}

export function createCheckIn(payload: CreateCheckInPayload) {
  return apiFetch("/api/v1/admin/checkins/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
