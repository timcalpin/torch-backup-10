import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";
import { withAdminQuery, type AdminQuery } from "./adminQuery";

export type { PaginatedResponse };

export const LITERATURE_CATEGORIES = ["recovery", "spirituality", "meditation", "education"] as const;
export type LiteratureCategory = (typeof LITERATURE_CATEGORIES)[number];
export const LITERATURE_CATEGORY_LABELS: Record<LiteratureCategory, string> = {
  recovery: "Recovery",
  spirituality: "Spirituality",
  meditation: "Meditation",
  education: "Education",
};

export interface ApiLiterature {
  id: number;
  title: string;
  description: string;
  category: LiteratureCategory;
  pdf_file: string;
  thumbnail: string | null;
  is_featured: boolean;
  created_at: string;
}

export function listLiterature(query: AdminQuery = {}): Promise<PaginatedResponse<ApiLiterature>> {
  return apiFetch<PaginatedResponse<ApiLiterature>>(withAdminQuery("/api/v1/admin/literature/", query));
}

export function getLiterature(id: number): Promise<ApiLiterature> {
  return apiFetch<ApiLiterature>(`/api/v1/admin/literature/${id}/`);
}

export interface LiteraturePayload {
  title: string;
  description: string;
  category: LiteratureCategory;
  is_featured: boolean;
  pdf_file?: File | null;
  thumbnail?: File | null;
}

export function createLiterature(payload: LiteraturePayload): Promise<ApiLiterature> {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("description", payload.description);
  form.append("category", payload.category);
  form.append("is_featured", String(payload.is_featured));
  if (payload.pdf_file) form.append("pdf_file", payload.pdf_file);
  if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);
  return apiFetch<ApiLiterature>("/api/v1/admin/literature/", {
    method: "POST",
    body: form,
  });
}

export function updateLiterature(id: number, payload: Partial<LiteraturePayload>): Promise<ApiLiterature> {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "pdf_file" || key === "thumbnail") {
      if (value) form.append(key, value as File);
      return;
    }
    form.append(key, String(value));
  });
  return apiFetch<ApiLiterature>(`/api/v1/admin/literature/${id}/`, {
    method: "PATCH",
    body: form,
  });
}

export function deleteLiterature(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/literature/${id}/`, {
    method: "DELETE",
  });
}
