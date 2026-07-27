import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

export const EVENT_TYPES = ["recovery", "wellness", "community"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ["scheduled", "active", "pending", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface ApiEvent {
  id: number;
  title: string;
  description: string;
  event_type: EventType | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string;
  max_attendees: number | null;
  status: EventStatus | null;
  created_at: string;
  updated_at: string;
}

export interface EventStats {
  total_events: number;
  scheduled_count: number;
  active_now_count: number;
  this_week_count: number;
  avg_capacity: number;
  upcoming_today_count: number;
  next_upcoming_start: string | null;
}

export function listEvents(): Promise<PaginatedResponse<ApiEvent>> {
  return apiFetch<PaginatedResponse<ApiEvent>>("/api/v1/admin/events/");
}

export function getEvent(id: number): Promise<ApiEvent> {
  return apiFetch<ApiEvent>(`/api/v1/admin/events/${id}/`);
}

export function getEventStats(): Promise<EventStats> {
  return apiFetch<EventStats>("/api/v1/admin/events/stats/");
}

export interface EventPayload {
  title: string;
  description: string;
  event_type: EventType;
  start_datetime: string;
  end_datetime?: string | null;
  location: string;
  max_attendees: number | null;
  status: EventStatus;
}

export function createEvent(payload: EventPayload): Promise<ApiEvent> {
  return apiFetch<ApiEvent>("/api/v1/admin/events/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEvent(id: number, payload: Partial<EventPayload>): Promise<ApiEvent> {
  return apiFetch<ApiEvent>(`/api/v1/admin/events/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteEvent(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/events/${id}/`, {
    method: "DELETE",
  });
}
