import { FACILITY_IMAGE_TYPES } from "@slotbook/shared";
import { fileTypeFromBuffer } from "file-type";

export async function detectImageType(
  data: Buffer,
): Promise<(typeof FACILITY_IMAGE_TYPES)[number] | null> {
  const fileType = await fileTypeFromBuffer(data);
  const found = FACILITY_IMAGE_TYPES.find((val) => val.mime === fileType?.mime);
  if (!found) {
    return null;
  }
  return found;
}
