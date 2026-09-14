import { api } from "@/lib/api";
import { createParams } from "@/lib/queryStrings";
import {
  facilityCityResponseSchema,
  facilityResponseSchema,
  type FacilityCityResponse,
  type FacilityResponse,
} from "@slotbook/shared/facility";
import type { ResponseFacilityScheduleSchema } from "@slotbook/shared/facilitySchedule";
import type { ServiceResponseDTO } from "@slotbook/shared/service";

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
export async function getFacilityById(id: string): Promise<
  FacilityResponse & {
    facilitySchedule: ResponseFacilityScheduleSchema[];
  }
> {
  const facilityInfo = await api<FacilityResponse>(`/facilities/${id}`, {
    method: "GET",
  });
  const facilitySchedule = await api<ResponseFacilityScheduleSchema[]>(
    `/facilities/${id}/schedule`,
    {
      method: "GET",
    },
  );
  return {
    ...facilityInfo,
    facilitySchedule: facilitySchedule,
  };
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
