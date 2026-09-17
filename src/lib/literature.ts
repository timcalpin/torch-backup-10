import {
  listContent,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  type ApiContentItem,
} from "./content";
import type { PaginatedResponse } from "./pagination";
import type { AdminQuery } from "./adminQuery";

export type { PaginatedResponse };

export const LITERATURE_CATEGORIES = ["literature", "books", "recovery", "spirituality", "meditation", "education"] as const;
export type LiteratureCategory = (typeof LITERATURE_CATEGORIES)[number];
export const LITERATURE_CATEGORY_LABELS: Record<LiteratureCategory, string> = {
  literature: "Literature",
  books: "Books",
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
  book_url: string;
  thumbnail: string | null;
  is_featured: boolean;
  created_at: string;
}

export function listLiterature(query: AdminQuery = {}): Promise<PaginatedResponse<ApiLiterature>> {
  return listContent({ ...query, category: (query.category as string) || "literature" }).then((res) => ({
    ...res,
    results: res.results.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: (item.category as LiteratureCategory) || "literature",
      pdf_file: item.content_file || "",
      book_url: item.book_url || "",
      thumbnail: item.thumbnail,
      is_featured: item.is_featured,
      created_at: item.created_at,
    })),
  }));
}

export function getLiterature(id: number): Promise<ApiLiterature> {
  return getContentItem(id).then((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: (item.category as LiteratureCategory) || "literature",
    pdf_file: item.content_file || "",
    book_url: item.book_url || "",
    thumbnail: item.thumbnail,
    is_featured: item.is_featured,
    created_at: item.created_at,
  }));
}

export interface LiteraturePayload {
  title: string;
  description: string;
  category: LiteratureCategory;
  is_featured: boolean;
  pdf_file?: File | null;
  book_url?: string;
  thumbnail?: File | null;
}

export function createLiterature(payload: LiteraturePayload): Promise<ApiLiterature> {
  return createContentItem({
    title: payload.title,
    description: payload.description,
    category: (payload.category as any) || "literature",
    content_type: "text",
    content_file: payload.pdf_file,
    book_url: payload.book_url,
    thumbnail: payload.thumbnail,
    is_featured: payload.is_featured,
    status: "published",
  }).then((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: (item.category as LiteratureCategory) || "literature",
    pdf_file: item.content_file || "",
    book_url: item.book_url || "",
    thumbnail: item.thumbnail,
    is_featured: item.is_featured,
    created_at: item.created_at,
  }));
}

export function updateLiterature(id: number, payload: Partial<LiteraturePayload>): Promise<ApiLiterature> {
  return updateContentItem(id, {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.category !== undefined ? { category: payload.category as any } : {}),
    ...(payload.is_featured !== undefined ? { is_featured: payload.is_featured } : {}),
    ...(payload.pdf_file !== undefined ? { content_file: payload.pdf_file } : {}),
    ...(payload.book_url !== undefined ? { book_url: payload.book_url } : {}),
    ...(payload.thumbnail !== undefined ? { thumbnail: payload.thumbnail } : {}),
  }).then((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: (item.category as LiteratureCategory) || "literature",
    pdf_file: item.content_file || "",
    book_url: item.book_url || "",
    thumbnail: item.thumbnail,
    is_featured: item.is_featured,
    created_at: item.created_at,
  }));
}

export function deleteLiterature(id: number): Promise<void> {
  return deleteContentItem(id);
}
