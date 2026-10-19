"use client";

import { measureBrightness } from "@/lib/imageBrightness";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Tone = "dark" | "light";

const DARK_THRESHOLD = 110;

const overlayByTone: Record<Tone | "unknown", string> = {
  dark: "from-black/30 via-black/10 to-black/55",
  light: "from-black/60 via-black/35 to-black/85",
  unknown: "from-black/60 via-black/35 to-black/85",
};

function toneOf(img: HTMLImageElement): Tone | null {
  const brightness = measureBrightness(img);
  if (brightness === null) return null;
  return brightness < DARK_THRESHOLD ? "dark" : "light";
}

export function CoverBackground({ url }: { url: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setTone(toneOf(img));
  }, [url]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- решение D11 */}
      <img
        ref={imgRef}
        src={url}
        alt=""
        loading="lazy"
        crossOrigin="anonymous"
        onLoad={(e) => setTone(toneOf(e.currentTarget))}
        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-linear-to-b transition-colors duration-300",
          overlayByTone[tone ?? "unknown"],
        )}
      />
    </>
  );
}
