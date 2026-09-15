import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCityResponseSchema,
  facilityResponseSchema,
  type FacilityCityResponse,
  type FacilityResponse,
} from "@slotbook/shared/facility";
import {
  facilityScheduleResponseSchema,
  type FacilityScheduleResponse,
} from "@slotbook/shared/facilitySchedule";
import type { ServiceResponseDTO } from "@slotbook/shared/service";
import { facilities } from "../../../backend/src/db/schema/facility";

export async function getFacilities(getParams: {
  country: string;
  category?: string;
  rating?: string;
  priceMax?: string;
  q?: string;
  sort?: string;
  limit?: number;
}): Promise<FacilityResponse[]> {
  const query = createParams(getParams);
  const endpoint = query ? `/facilities/?${query}` : "/facilities/";

  const result = facilityResponseSchema.array().parse(
    await api(endpoint, {
      method: "GET",
    }),
  );

  return result;
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

export async function getFacilityScheduleById(id: string): Promise<FacilityScheduleResponse[]> {
  return facilityScheduleResponseSchema
    .array()
    .parse(await api(`/facilities/${id}/schedule`, { method: "GET" }));
}

export async function getMyFacilities(): Promise<FacilityResponse[]> {
  const res = await api<FacilityResponse[] | null>(`/facilities/mine`, {
    method: "GET",
  });
  return res ?? [];
}

export async function getFacilityServicesById(facilityId: string): Promise<ServiceResponseDTO[]> {
  const res = await api<ServiceResponseDTO[]>(`/facilities/${facilityId}/services`, {
    method: "GET",
  });
  return res;
}
