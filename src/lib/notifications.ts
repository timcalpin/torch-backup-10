import { apiFetch } from "./api";
import { withAdminQuery, type AdminQuery } from "./adminQuery";
import type { PaginatedResponse } from "./pagination";

export const NOTIFICATIONS_PATH = "/api/v1/admin/notifications/";
export type NotificationType = "manual" | "scheduled" | "rule_based";
export interface NotificationCondition { field: "sobriety_streak_days" | "mood_checkin_score" | "inactivity_days"; operator: "=" | ">=" | "<=" | ">" | "<"; value: number }
export interface ApiNotification { id: string | number; title: string; body: string; notification_type?: NotificationType; type?: NotificationType; audience?: string; conditions?: NotificationCondition[]; execution?: string; recurrence?: string; schedule_at?: string | null; status?: string; open_rate?: number | string | null; created_at?: string; sent_at?: string; updated_at?: string; [key: string]: unknown }
export interface NotificationStats { total_sent: number | string; avg_open_rate: number | string; active_rules: number | string; scheduled_queue: number | string }
export interface CreateNotificationPayload { title: string; body: string; notification_type: NotificationType; audience: string; conditions: NotificationCondition[]; execution: "immediate" | "on_trigger"; recurrence: string; schedule_at: string | null; status: "active" | "scheduled" }
export interface CreateNotificationResponse extends ApiNotification { queued_recipient_count?: number; queued_count?: number; recipient_count?: number }
export function listNotifications(query: AdminQuery = {}) { return apiFetch<PaginatedResponse<ApiNotification>>(withAdminQuery(NOTIFICATIONS_PATH, query)); }
export function getNotificationStats() { return apiFetch<NotificationStats>(`${NOTIFICATIONS_PATH}stats/`); }
export function createNotification(payload: CreateNotificationPayload) { return apiFetch<CreateNotificationResponse>(NOTIFICATIONS_PATH, { method: "POST", body: JSON.stringify(payload) }); }
