import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCityResponseSchema,
  facilityDataForBookingSchema,
  facilityResponseSchema,
  facilityWithServicesResponseSchema,
  type FacilityCityResponse,
  type FacilityDataForBookingResponse,
  type FacilityListQuery,
  type FacilityResponse,
} from "@slotbook/shared/facility";

import type { ServiceResponseDTO } from "@slotbook/shared/service";
import { facilities } from "../../../backend/src/db/schema/facility";
import {
  facilityScheduleEntryResponseSchema,
  type FacilityScheduleEntryResponse,
} from "@slotbook/shared";

export async function getFacilities(params: FacilityListQuery): Promise<FacilityResponse[]> {
  const query = createParams(params);
  const endpoint = query ? `/facilities/?${query}` : "/facilities/";

  const result = facilityResponseSchema.array().parse(
    await api(endpoint, {
      method: "GET",
    }),
  );

  return result;
}
export async function searchFacilities(params: FacilityListQuery) {
  const query = createParams(params);
  const endpoint = query ? `/facilities/search?${query}` : "/facilities/search";
  return facilityWithServicesResponseSchema.array().parse(await api(endpoint));
}
export async function getCitiesList(getParams: {
  country: string;
}): Promise<FacilityCityResponse[]> {
  const query = createParams(getParams);
  const endpoint = query ? `/facilities/cities?${query}` : "/facilities/cities";

  const result = facilityCityResponseSchema.array().parse(
    await api(endpoint, {
      method: "GET",
    }),
  );

  return result;
}
export async function getFacilityById(id: string): Promise<FacilityResponse> {
  return facilityResponseSchema.parse(await api(`/facilities/${id}`, { method: "GET" }));
}
export async function getDataForBooking(
  facilityId: string,
): Promise<FacilityDataForBookingResponse> {
  return facilityDataForBookingSchema.parse(
    await api(`/facilities/${facilityId}/bookingData`, { method: "GET" }),
  );
}

export async function getFacilityScheduleById(id: string): Promise<FacilityScheduleEntryResponse> {
  return facilityScheduleEntryResponseSchema.parse(
    await api(`/facilities/${id}/schedule`, { method: "GET" }),
  );
}

export async function getMyFacilities(cookie: string): Promise<FacilityResponse[]> {
  const res = await api<FacilityResponse[] | null>(`/facilities/mine`, {
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });
  return res ?? [];
}

export async function getFacilityServicesById(facilityId: string): Promise<ServiceResponseDTO[]> {
  const res = await api<ServiceResponseDTO[]>(`/facilities/${facilityId}/services`, {
    method: "GET",
  });
  return res;
}
