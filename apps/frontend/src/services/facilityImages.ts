import { api } from "@/lib/api";
import { facilityImagesResponseSchema, type FacilityImagesResponse } from "@slotbook/shared";

export async function uploadFacilityImage(
  facilityId: string,
  file: File,
): Promise<FacilityImagesResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return api(`/facilities/${facilityId}/images`, facilityImagesResponseSchema, {
    method: "POST",
    body: formData,
  });
}
export async function deleteFacilityImage(
  facilityId: string,
  key: string,
): Promise<FacilityImagesResponse> {
  return api(
    `/facilities/${facilityId}/images?key=${encodeURIComponent(key)}`,
    facilityImagesResponseSchema,
    {
      method: "DELETE",
    },
  );
}
export async function reorderFacilityImages(
  facilityId: string,
  keys: string[],
): Promise<FacilityImagesResponse> {
  return api(`/facilities/${facilityId}/images`, facilityImagesResponseSchema, {
    method: "PUT",
    body: JSON.stringify({keys}),
  });
}
