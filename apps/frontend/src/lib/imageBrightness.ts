export function measureBrightness(img: HTMLImageElement): number | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, 1, 1);

  try {
    const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  } catch {
    return null;
  }
}
