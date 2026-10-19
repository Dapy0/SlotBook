import { ImageOff } from "lucide-react";
import type { FacilityImage } from "@slotbook/shared";

type Props = {
  images: FacilityImage[];
  name: string;
};

const MAX_SIDE = 4;

const sideLayout: Record<number, string> = {
  1: "md:grid-cols-1 md:grid-rows-1",
  2: "md:grid-cols-1 md:grid-rows-2",
  3: "md:grid-cols-2 md:grid-rows-2",
  4: "md:grid-cols-2 md:grid-rows-2",
};

export function FacilityGallery({ images, name }: Props) {
  const cover = images[0];

  if (!cover) {
    return (
      <div className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted text-sm text-muted-foreground">
        <ImageOff aria-hidden className="size-6" />
        No photos yet
      </div>
    );
  }

  const rest = images.slice(1);
  const side = rest.slice(0, MAX_SIDE);
  const hidden = rest.length - side.length;

  return (
    <section
      aria-label="Photos"
      className={`grid gap-2 md:h-[28rem] md:grid-rows-1 ${
        side.length > 0 ? "md:grid-cols-[2fr_1fr]" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- решение D11 */}
      <img
        src={cover.url}
        alt={`${name}, photo 1`}
        className="aspect-[16/9] w-full rounded-xl object-cover md:aspect-auto md:h-full"
      />

      {side.length > 0 && (
        <ul className={`grid grid-cols-4 gap-2 md:h-full md:min-h-0 ${sideLayout[side.length]}`}>
          {side.map((image, i) => {
            const isLast = i === side.length - 1;
            const wide = side.length === 3 && i === 0 ? "md:col-span-2" : "";

            return (
              <li key={image.key} className={`relative md:min-h-0 ${wide}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- решение D11 */}
                <img
                  src={image.url}
                  alt={`${name}, photo ${i + 2}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover md:aspect-auto md:h-full"
                />
                {isLast && hidden > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-lg font-semibold text-white">
                    +{hidden}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
