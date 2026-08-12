import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

/* =========================================================
   CATEGORIES
========================================================= */

export const RESOURCE_CATEGORIES = [
  "recovery_meetings",
  "mental_health",
  "physical_health",
  "additional_support",
  "recreation",
] as const;

export type ResourceCategory =
  (typeof RESOURCE_CATEGORIES)[number];

/* =========================================================
   SUB-CATEGORIES
========================================================= */
export const RESOURCE_SUBCATEGORIES = {
  recovery_meetings: [
    "aa",
    "na",
    "smart",
    "recovery_dharma",
    "celebrate_recovery",
  ],

  mental_health: [
    "therapy",
    "emdr",
    "ocd",
    "trauma_ptsd",
    "couples_therapy",
    "anxiety",
    "depression",
  ],

  physical_health: [
    "yoga",
    "gym",
    "doctors",
    "mat",
  ],

  additional_support: [
    "job_training",
    "education",
    "treatment",
    "state_county_benefits",
    "legal_aid",
    "crisis_support",
  ],

  recreation: [
    "art",
    "music",
    "creative_writing",
    "live_events",
    "parks_nature",
    "animal_assisted",
  ],
} as const;

/* =========================================================
   DELIVERY FORMATS
========================================================= */

export const DELIVERY_FORMATS = [
  "in_person",
  "online",
  "hybrid",
  "phone",
  "not_applicable",
] as const;

export type DeliveryFormat =
  (typeof DELIVERY_FORMATS)[number];

/* =========================================================
   RESOURCE STATUS
========================================================= */

export const RESOURCE_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export type ResourceStatus =
  (typeof RESOURCE_STATUSES)[number];

/* =========================================================
   API RESOURCE
========================================================= */

export interface ApiResource {
  id: number;

  title: string;

  category: string;
  category_display: string;

  sub_category: string | null;
  sub_category_display: string | null;

  format: string;

  status: string;
  status_display: string;

  is_active: boolean;

  description?: string;
  organization?: string;

  url?: string;
  phone?: string;
  email?: string;

  thumbnail?: string | null;
  thumbnail_url?: string;

  tags?: string[];

  venue?: string;
  street_address?: string;
  address_line_2?: string;

  city?: string;
  county?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  day?: string;
  start_time?: string | null;
  end_time?: string | null;

  delivery_format?: DeliveryFormat;

  meeting_type?: string;
  audience?: string;
  language?: string;
  meeting_id?: string;

  is_open?: boolean;
  is_accessible?: boolean;
  is_featured?: boolean;

  order?: number;

  published_at?: string | null;
  created_at?: string;
  updated_at?: string;

  full_address?: string;

  next_occurrence?: string | null;
  is_starting_soon?: boolean;
}

/* =========================================================
   RESOURCE STATS
========================================================= */

export interface ResourceStatsCategory {
  value: string;
  label: string;
  count: number;
}

export interface ResourceStatsResult {
  id: number;

  title: string;

  category: string;
  category_display: string;

  sub_category: string | null;
  sub_category_display: string | null;

  format: string;

  status: string;
  status_display: string;

  is_active: boolean;
}

export interface ResourceStats {
  count: number;
  active_count: number;
  pending_count: number;
  category_count: number;

  categories: ResourceStatsCategory[];

  results: ResourceStatsResult[];
}

/* =========================================================
   CREATE RESOURCE PAYLOAD
========================================================= */

export interface CreateResourcePayload {
  title: string;

  category: ResourceCategory;

  sub_category: string;

  description: string;

  organization?: string;

  url?: string;

  phone?: string;

  email?: string;

  venue?: string;

  street_address?: string;

  address_line_2?: string;

  city?: string;

  county?: string;

  state?: string;

  zip_code?: string;

  country?: string;

  delivery_format: DeliveryFormat;

  day?: string;

  start_time?: string | null;

  end_time?: string | null;

  meeting_type?: string;

  audience?: string;

  language?: string;

  meeting_id?: string;

  is_open?: boolean;

  is_accessible?: boolean;

  is_featured?: boolean;

  tags?: string[];

  status: ResourceStatus;
}

/* =========================================================
   UPDATE RESOURCE PAYLOAD
========================================================= */

export type UpdateResourcePayload =
  Partial<CreateResourcePayload> & {
    is_active?: boolean;
  };

/* =========================================================
   LIST RESOURCES
========================================================= */

export function listResources(): Promise<
  PaginatedResponse<ApiResource>
> {
  return apiFetch<PaginatedResponse<ApiResource>>(
    "/api/v1/admin/resources/"
  );
}

/* =========================================================
   GET RESOURCE
========================================================= */

export function getResource(
  id: number
): Promise<ApiResource> {
  return apiFetch<ApiResource>(
    `/api/v1/admin/resources/${id}/`
  );
}

/* =========================================================
   RESOURCE STATS
========================================================= */

export function getResourceStats(): Promise<ResourceStats> {
  return apiFetch<ResourceStats>(
    "/api/v1/admin/resources/stats/"
  );
}

/* =========================================================
   CREATE RESOURCE
========================================================= */

export function createResource(
  payload: CreateResourcePayload
): Promise<ApiResource> {
  return apiFetch<ApiResource>(
    "/api/v1/admin/resources/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================================================
   UPDATE RESOURCE
========================================================= */

export function updateResource(
  id: number,
  payload: CreateResourcePayload
): Promise<ApiResource> {
  return apiFetch<ApiResource>(
    `/api/v1/admin/resources/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================================================
   DELETE RESOURCE
========================================================= */

export function deleteResource(
  id: number
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/admin/resources/${id}/`,
    {
      method: "DELETE",
    }
  );
}