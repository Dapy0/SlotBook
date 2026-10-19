import type { FacilityImage, FacilityResponse } from "@slotbook/shared";
import { buildFileUrl } from "../../lib/storage/fileUrl";
import type { FacilityEntity } from "../../db/schema";

export function toFacilityImages(keys: string[]): FacilityImage[] {
  return keys.map((key) => ({ key, url: buildFileUrl(key) }));
}
export function toFacilityResponse(entity: FacilityEntity): FacilityResponse {
  return {
    ...entity,
    images: toFacilityImages(entity.images),
  };
}
