import { apiFetch } from "./api";
import type { PaginatedResponse } from "./pagination";

export type { PaginatedResponse };

// Mirrors apps/resources/models.py::Resource after the "realworldresource"
// rewrite (PR #40) — this model now covers Recovery Meetings and Wellness &
// Support listings, not the old flat title/category/url shape.

export const RESOURCE_TYPES = ["recovery_meeting", "wellness_support"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RECOVERY_CATEGORIES = ["aa", "na", "smart", "celebrate_recovery", "recovery_dharma"] as const;
export const WELLNESS_CATEGORIES = [
  "therapy",
  "yoga",
  "fitness",
  "volunteering",
  "massage_bodywork",
  "art_creative",
  "parks_nature",
  "animal_therapy",
  "job_placement",
  "county_benefits",
  "legal_aid",
  "crisis_support",
  "other",
] as const;
export type ResourceCategory = (typeof RECOVERY_CATEGORIES)[number] | (typeof WELLNESS_CATEGORIES)[number];

export const DELIVERY_FORMATS = ["in_person", "online", "hybrid", "phone"] as const;
export type DeliveryFormat = (typeof DELIVERY_FORMATS)[number] | "not_applicable";

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const RESOURCE_STATUSES = ["draft", "published", "archived"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface ApiResource {
  id: number;
  resource_type: ResourceType;
  category: ResourceCategory;
  title: string;
  subtitle: string;
  description: string;
  organization: string;
  url: string;
  phone: string;
  email: string;
  thumbnail: string | null;
  thumbnail_url: string;
  tags: string[];
  venue: string;
  street_address: string;
  address_line_2: string;
  city: string;
  county: string;
  state: string;
  zip_code: string;
  country: string;
  day: DayOfWeek | "";
  start_time: string | null;
  end_time: string | null;
  delivery_format: DeliveryFormat;
  meeting_type: string;
  audience: string;
  language: string;
  meeting_id: string;
  is_open: boolean;
  is_accessible: boolean;
  status: ResourceStatus;
  is_featured: boolean;
  is_active: boolean;
  order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  resource_type_display: string;
  category_display: string;
  day_display: string;
  delivery_format_display: string;
  full_address: string;
  next_occurrence: string | null;
  is_starting_soon: boolean;
}

export function listResources(): Promise<PaginatedResponse<ApiResource>> {
  return apiFetch<PaginatedResponse<ApiResource>>("/api/v1/admin/resources/");
}

export function getResource(id: number): Promise<ApiResource> {
  return apiFetch<ApiResource>(`/api/v1/admin/resources/${id}/`);
}

// Fields required for a Recovery Meeting: day, start_time, and a
// delivery_format other than "not_applicable" (see Resource.clean()).
export interface RecoveryMeetingPayload {
  resource_type: "recovery_meeting";
  title: string;
  category: (typeof RECOVERY_CATEGORIES)[number];
  description: string;
  organization: string;
  url: string;
  phone: string;
  venue: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string | null;
  delivery_format: (typeof DELIVERY_FORMATS)[number];
  tags: string[];
  is_featured: boolean;
  status: ResourceStatus;
}

// Wellness & Support must NOT send any meeting fields (day/start_time/
// end_time/meeting_id) — Resource.clean() rejects them for this type.
export interface WellnessSupportPayload {
  resource_type: "wellness_support";
  title: string;
  category: (typeof WELLNESS_CATEGORIES)[number];
  description: string;
  organization: string;
  url: string;
  phone: string;
  venue: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  tags: string[];
  is_featured: boolean;
  status: ResourceStatus;
}

export type ResourcePayload = RecoveryMeetingPayload | WellnessSupportPayload;

export function createResource(payload: ResourcePayload): Promise<ApiResource> {
  return apiFetch<ApiResource>("/api/v1/admin/resources/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateResource(id: number, payload: Partial<ResourcePayload> & { is_featured?: boolean }): Promise<ApiResource> {
  return apiFetch<ApiResource>(`/api/v1/admin/resources/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteResource(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/resources/${id}/`, {
    method: "DELETE",
  });
}
