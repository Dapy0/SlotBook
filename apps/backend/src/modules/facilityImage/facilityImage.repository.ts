import { and, eq, sql } from "drizzle-orm";
import type { DB } from "../../db/drizzlePlugin";
import { facilities } from "../../db/schema";
import { FACILITY_IMAGE_MAX_COUNT } from "@slotbook/shared";

export async function appendFacilityImage(
  db: DB,
  facilityId: string,
  key: string,
): Promise<string[] | null> {
  const [res] = await db
    .update(facilities)
    .set({
      images: sql`${facilities.images} || jsonb_build_array(${key}::text)`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(facilities.id, facilityId),
        sql`jsonb_array_length(${facilities.images}) < ${FACILITY_IMAGE_MAX_COUNT}`,
      ),
    )
    .returning({ images: facilities.images });
  return res?.images ?? null;
}

export async function removeFacilityImage(
  db: DB,
  facilityId: string,
  key: string,
): Promise<string[] | null> {
  const [res] = await db
    .update(facilities)
    .set({
      images: sql`${facilities.images} - ${key}::text`,
      updatedAt: new Date(),
    })
    .where(and(eq(facilities.id, facilityId), sql`${facilities.images} ? ${key}::text`))
    .returning({ images: facilities.images });
  return res?.images ?? null;
}

export async function setFacilityImagesOrder(
  db: DB,
  facilityId: string,
  keys: string[],
): Promise<string[] | null> {
  const newImages = sql`${JSON.stringify(keys)}::jsonb`;

  const [res] = await db
    .update(facilities)
    .set({
      images: newImages,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(facilities.id, facilityId),
        sql`jsonb_array_length(${facilities.images}) = jsonb_array_length(${newImages})`,
        sql`${facilities.images} <@ ${newImages}`,
      ),
    )
    .returning({ images: facilities.images });
  return res?.images ?? null;
}
