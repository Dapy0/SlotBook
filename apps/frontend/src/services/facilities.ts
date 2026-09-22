import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityBookingDataResponseSchema,
  facilityCityResponseSchema,
  facilityResponseSchema,
  facilityScheduleEntryResponseSchema,
  facilityWithServicesResponseSchema,
  serviceResponseSchema,
  type FacilityListQuery,
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

export async function getDataForBooking(facilityId: string) {
  return await api(`/facilities/${facilityId}/bookingData`, facilityBookingDataResponseSchema);
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
