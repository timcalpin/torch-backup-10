import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";
import { withAdminQuery, type AdminQuery } from "./adminQuery";

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
  "literature",
  "books",
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
  literature: "Literature",
  books: "Books",
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
  content_file: string | null;
  book_url: string;
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

export interface ContentQuery extends AdminQuery {
  content_type?: ContentType | string;
  category?: ContentCategory | string;
  difficulty_level?: ContentDifficulty | string;
  status?: ContentStatus | string;
  is_featured?: boolean;
}

export function listContent(query: ContentQuery = {}): Promise<PaginatedResponse<ApiContentItem>> {
  return apiFetch<PaginatedResponse<ApiContentItem>>(withAdminQuery("/api/v1/admin/content/", query));
}

export function getContentItem(id: number): Promise<ApiContentItem> {
  return apiFetch<ApiContentItem>(`/api/v1/admin/content/${id}/`);
}

export function getContentStats(query: ContentQuery = {}): Promise<ContentStats> {
  return apiFetch<ContentStats>(withAdminQuery("/api/v1/admin/content/stats/", query));
}

export interface ContentPayload {
  title: string;
  creator?: string;
  description?: string;
  content_type: ContentType;
  category: ContentCategory;
  topic?: string;
  emotion?: string;
  difficulty_level?: ContentDifficulty | "";
  media_url?: string;
  content_file?: File | null;
  book_url?: string;
  thumbnail?: File | null;
  duration_seconds?: number;
  is_featured: boolean;
  status: ContentStatus;
}

function toContentFormData(payload: ContentPayload): FormData {
  const form = new FormData();
  form.append("title", payload.title || "");
  form.append("content_type", payload.content_type || "text");
  form.append("category", payload.category || "self_care");
  form.append("status", payload.status || "published");
  form.append("is_featured", String(Boolean(payload.is_featured)));

  if (payload.creator && payload.creator.trim() !== "") {
    form.append("creator", payload.creator.trim());
  }
  if (payload.description && payload.description.trim() !== "") {
    form.append("description", payload.description.trim());
  }
  if (payload.topic && payload.topic.trim() !== "") {
    form.append("topic", payload.topic.trim());
  }
  if (payload.emotion && payload.emotion.trim() !== "") {
    form.append("emotion", payload.emotion.trim());
  }
  if (payload.difficulty_level && payload.difficulty_level.trim() !== "") {
    form.append("difficulty_level", payload.difficulty_level.trim());
  }
  if (payload.media_url && payload.media_url.trim() !== "") {
    form.append("media_url", payload.media_url.trim());
  }
  if (payload.book_url && payload.book_url.trim() !== "") {
    form.append("book_url", payload.book_url.trim());
  }
  if (payload.duration_seconds && payload.duration_seconds > 0) {
    form.append("duration_seconds", String(payload.duration_seconds));
  }

  if (payload.thumbnail) form.append("thumbnail_upload", payload.thumbnail);
  if (payload.content_file) form.append("content_file_upload", payload.content_file);
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
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "" && key !== "title") return;
    if (key === "thumbnail") {
      if (value) form.append("thumbnail_upload", value as File);
      return;
    }
    if (key === "content_file") {
      if (value) form.append("content_file_upload", value as File);
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

export interface BulkDeleteContentResponse {
  deleted: number;
  requested: number;
}

export function deleteContentItems(ids: number[]): Promise<BulkDeleteContentResponse> {
  return apiFetch<BulkDeleteContentResponse>("/api/v1/admin/content/bulk-delete/", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
