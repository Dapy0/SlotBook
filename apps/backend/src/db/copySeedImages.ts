import "dotenv/config";
import { collectSeedImages, copySeedImages } from "./seedImages.ts";

async function main() {
  const images = collectSeedImages();
  await copySeedImages(images);
  // eslint-disable-next-line no-console
  console.log(`Seed images copied: ${images.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
