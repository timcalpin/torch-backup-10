import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

export const CONTENT_TYPES = ["audio", "video", "podcast", "meditation", "text"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  audio: "Audio",
  video: "Video",
  podcast: "Podcast",
  meditation: "Meditation",
  text: "Text",
};

export const CONTENT_CATEGORIES = [
  "meditation",
  "yoga",
  "trauma",
  "mental_health",
  "self_care",
  "stress_relief",
  "stress_gratitude",
  "spirituality",
] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];
export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  meditation: "Meditation",
  yoga: "Yoga",
  trauma: "Trauma",
  mental_health: "Mental Health",
  self_care: "Self Care",
  stress_relief: "Stress Relief",
  stress_gratitude: "Stress Gratitude",
  spirituality: "Spirituality",
};

export const CONTENT_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type ContentDifficulty = (typeof CONTENT_DIFFICULTIES)[number];
export const CONTENT_DIFFICULTY_LABELS: Record<ContentDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface ApiContentItem {
  id: number;
  title: string;
  creator: string;
  description: string;
  content_type: ContentType;
  category: ContentCategory;
  topic: string;
  emotion: string;
  difficulty_level: ContentDifficulty | "";
  media_url: string;
  thumbnail: string | null;
  duration_seconds: number;
  duration_minutes: string;
  tags: string[];
  is_featured: boolean;
  status: ContentStatus;
  is_completed: boolean;
  created_at: string;
}

export interface ContentStats {
  total_content: number;
  total_plays: number;
  avg_completion: number;
  published_count: number;
}

export function listContent(): Promise<PaginatedResponse<ApiContentItem>> {
  return apiFetch<PaginatedResponse<ApiContentItem>>("/api/v1/admin/content/");
}

export function getContentItem(id: number): Promise<ApiContentItem> {
  return apiFetch<ApiContentItem>(`/api/v1/admin/content/${id}/`);
}

export function getContentStats(): Promise<ContentStats> {
  return apiFetch<ContentStats>("/api/v1/admin/content/stats/");
}

export interface ContentPayload {
  title: string;
  creator: string;
  description: string;
  content_type: ContentType;
  category: ContentCategory;
  topic: string;
  emotion: string;
  difficulty_level: ContentDifficulty | "";
  media_url: string;
  duration_seconds: number;
  is_featured: boolean;
  status: ContentStatus;
  thumbnail?: File | null;
}

function toContentFormData(payload: ContentPayload): FormData {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("creator", payload.creator);
  form.append("description", payload.description);
  form.append("content_type", payload.content_type);
  form.append("category", payload.category);
  form.append("topic", payload.topic);
  form.append("emotion", payload.emotion);
  form.append("difficulty_level", payload.difficulty_level);
  form.append("media_url", payload.media_url);
  form.append("duration_seconds", String(payload.duration_seconds));
  form.append("is_featured", String(payload.is_featured));
  form.append("status", payload.status);
  // The API's `thumbnail` field is a computed read-only URL (uploaded file
  // or a YouTube-derived fallback) — the actual file upload goes through
  // `thumbnail_upload`, which the admin serializer maps onto the model field.
  if (payload.thumbnail) form.append("thumbnail_upload", payload.thumbnail);
  return form;
}

export function createContentItem(payload: ContentPayload): Promise<ApiContentItem> {
  return apiFetch<ApiContentItem>("/api/v1/admin/content/", {
    method: "POST",
    body: toContentFormData(payload),
  });
}

export function updateContentItem(id: number, payload: Partial<ContentPayload>): Promise<ApiContentItem> {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "thumbnail") {
      if (value) form.append("thumbnail_upload", value as File);
      return;
    }
    form.append(key, String(value));
  });
  return apiFetch<ApiContentItem>(`/api/v1/admin/content/${id}/`, {
    method: "PATCH",
    body: form,
  });
}

export function deleteContentItem(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/content/${id}/`, {
    method: "DELETE",
  });
}
