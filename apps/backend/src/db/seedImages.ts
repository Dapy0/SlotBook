import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FACILITY_SEEDS } from "./seed-data/facilities.ts";
import { facilityIdFor } from "./seedIds.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEED_IMAGES_DIR = path.join(__dirname, "seed-data", "images");

const SEED_IMAGES_VERSION = 2;

function stableUuid(text: string): string {
  const h = createHash("sha1").update(text).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export type SeedImage = { facilityId: string; key: string; source: string };

export function collectSeedImages(): SeedImage[] {
  return FACILITY_SEEDS.flatMap((seed, index) => {
    const source = path.join(SEED_IMAGES_DIR, `${seed.slug}.webp`);
    if (!existsSync(source)) return [];
    const facilityId = facilityIdFor(seed, index);
    return [
      {
        facilityId,
        key: `facilities/${facilityId}/${stableUuid(`${seed.slug}@${SEED_IMAGES_VERSION}`)}.webp`,
        source,
      },
    ];
  });
}

export async function copySeedImages(images: SeedImage[]): Promise<void> {
  const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
  const root = path.resolve(__dirname, "../..", uploadDir);
  for (const image of images) {
    const target = path.join(root, image.key);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(image.source, target);
  }
}
