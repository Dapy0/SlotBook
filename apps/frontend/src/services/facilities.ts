import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityBookingDataResponseSchema,
  facilityCityResponseSchema,
  facilityResponseSchema,
  facilityScheduleEntryResponseSchema,
  facilityWithServicesResponseSchema,
  serviceResponseSchema,
  type CreateFacilityRequest,
  type FacilityListQuery,
  type UpdateFacilityRequest,
} from "@slotbook/shared";

export async function getFacilities(params: FacilityListQuery) {
  const query = createParams(params);
  const endpoint = query ? `/facilities/?${query}` : "/facilities/";

  return await api(endpoint, facilityResponseSchema.array());
}
export async function searchFacilities(params: FacilityListQuery) {
  const query = createParams(params);
  const endpoint = query ? `/facilities/search?${query}` : "/facilities/search";
  return await api(endpoint, facilityWithServicesResponseSchema.array());
}
export async function getCitiesList(getParams: { country: string }) {
  const query = createParams(getParams);
  const endpoint = query ? `/facilities/cities?${query}` : "/facilities/cities";

  return await api(endpoint, facilityCityResponseSchema.array());
}
export async function getFacilityById(id: string) {
  return await api(`/facilities/${id}`, facilityResponseSchema);
}
export async function getFacilityBySlug(slug: string) {
  return await api(`/facilities/by-slug/${slug}`, facilityResponseSchema);
}

export async function getDataForBooking(facilityId: string) {
  return await api(`/facilities/${facilityId}/bookingData`, facilityBookingDataResponseSchema);
}

export async function getFacilityScheduleBySlug(slug: string) {
  return await api(
    `/facilities/by-slug/${slug}/schedule`,
    facilityScheduleEntryResponseSchema.array(),
  );
}
export async function getFacilityScheduleById(id: string) {
  return await api(`/facilities/${id}/schedule`, facilityScheduleEntryResponseSchema.array());
}

export async function getMyFacilities(cookie: string) {
  return await api(`/facilities/mine`, facilityScheduleEntryResponseSchema.nullable(), {
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });
}

export async function getFacilityServicesById(facilityId: string) {
  return await api(`/facilities/${facilityId}/services`, serviceResponseSchema.array());
}

export async function createFacility(payload: CreateFacilityRequest) {
  return await api(`/facilities/`, facilityResponseSchema, {
    method: "POST",
  });
}

export async function updateFacility(facilityId: string, payload: UpdateFacilityRequest) {
  return await api(`/facilities/${facilityId}`, facilityResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export async function publishFacility(id: string) {
  return await api(`/facilities/${id}/publish`, facilityResponseSchema, {
    method: "POST",
    body: JSON.stringify(""),
  });
}
export async function unpublishFacility(id: string) {
  return await api(`/facilities/${id}/unpublish`, facilityResponseSchema, {
    method: "POST",
    body: JSON.stringify(""),
  });
}

export async function deleteFacility(id: string) {
  return await api(`/facilities/${id}`, facilityResponseSchema, {
    method: "DELETE",
  });
}
