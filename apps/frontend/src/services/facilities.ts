import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityBookingDataResponseSchema,
  facilityCityResponseSchema,
  facilityFacetsResponseSchema,
  facilityResponseSchema,
  facilityScheduleEntryResponseSchema,
  facilitySearchResponseSchema,
  serviceResponseSchema,
  type CreateFacilityRequest,
  type FacilitySearchInput,
  type UpdateFacilityRequest,
} from "@slotbook/shared";

export async function searchFacilities(params: FacilitySearchInput) {
  return await api(`/facilities/search?${createParams(params)}`, facilitySearchResponseSchema);
}
export async function getSearchFacets(params: FacilitySearchInput) {
  return await api(
    `/facilities/search/facets?${createParams(params)}`,
    facilityFacetsResponseSchema,
  );
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
