import type { FacilityImage } from "@slotbook/shared";
import type { FileStorage } from "../../lib/storage/FileStorage";
import type { DB } from "../../db/drizzlePlugin";
import { assertFacilityOwner } from "../../lib/authz";
import { detectImageType } from "../../lib/imageType";
import {
  BadRequestError,
  ImageLimitReachedError,
  NotFoundError,
  UnsupportedImageTypeError,
} from "../../lib/errors";
import { randomUUID } from "crypto";
import {
  appendFacilityImage,
  removeFacilityImage,
  setFacilityImagesOrder,
} from "./facilityImage.repository";
import { toFacilityImages } from "../facility/facility.mapper";
import type { FastifyBaseLogger } from 'fastify';
async function deleteQuietly(storage: FileStorage, key: string, log: FastifyBaseLogger) {
  try {
    await storage.delete(key);
  } catch (err) {
    log.error({ err, key }, "Failed to delete file from storage");
  }
}

export async function uploadFacilityImage(
  db: DB,
  storage: FileStorage,
  log: FastifyBaseLogger,
  input: { facilityId: string; userId: string; data: Buffer },
): Promise<FacilityImage[]> {
  await assertFacilityOwner(db, input.facilityId, input.userId);
  const type = await detectImageType(input.data);
  if (!type) {
    throw new UnsupportedImageTypeError("This file is not supported. Please choose other one.");
  }
  const key = `facilities/${input.facilityId}/${randomUUID()}.${type.ext}`;
  await storage.save(key, input.data, type.mime);
  let images: string[] | null;
  try {
    images = await appendFacilityImage(db, input.facilityId, key);
  } catch (err) {
    await deleteQuietly(storage, key, log);
    throw err;
  }

  if (!images) {
    await deleteQuietly(storage, key, log);
    throw new ImageLimitReachedError();
  }
  return toFacilityImages(images);
}

export async function deleteFacilityImage(
  db: DB,
  storage: FileStorage,
  log: FastifyBaseLogger,
  input: { facilityId: string; userId: string; key: string },
): Promise<FacilityImage[]> {
  await assertFacilityOwner(db, input.facilityId, input.userId);

  const images = await removeFacilityImage(db, input.facilityId, input.key);
  if (!images) throw new NotFoundError("Image not found");

  await deleteQuietly(storage, input.key, log);
  return toFacilityImages(images);
}

export async function reorderFacilityImages(
  db: DB,
  input: { facilityId: string; userId: string; keys: string[] },
): Promise<FacilityImage[]> {
  await assertFacilityOwner(db, input.facilityId, input.userId);
  const images = await setFacilityImagesOrder(db, input.facilityId, input.keys);
  if (!images) {
    throw new BadRequestError("No such images were found.");
  }
  return toFacilityImages(images);
}
