import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import ScoreBadge from "@/components/layout/ScoreBadge";
import { CoverBackground } from "@/app/(main)/_components/CoverBackground";
import { cn } from "@/lib/utils";
import type { FacilityResponse } from "@slotbook/shared";
import { MapPin } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export function CategoryDot({ color }: { color: string }) {
  return (
    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
  );
}

function SmallFacilityPreviewCard({ facility }: { facility: FacilityResponse }) {
  const { name, address, city, category, score, slug, images } = facility;
  const meta = CATEGORY_METADATA[category];
  const cover = images[0];
  const mutedText = cover ? "text-white/90" : "text-muted-foreground";
  const glassPill =
    "border border-white/30 bg-white/15 text-white backdrop-blur-md [text-shadow:none] shadow-sm";

  return (
    <Link
      href={`/venues/${slug}` as Route}
      className={cn(
        "group relative isolate flex h-full min-h-48 flex-col gap-5 overflow-hidden rounded-xl border border-border bg-card p-5 transition-[box-shadow,border-color] duration-200 ease-out outline-none hover:border-[color-mix(in_oklch,var(--primary),var(--border)_40%)] hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        cover && "text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.8)]",
      )}
    >
      {/* S12: фото + затемнение, которое подстраивается под яркость фото */}
      {cover && <CoverBackground url={cover.url} />}

      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 text-xs font-medium",
            cover ? cn("rounded-full px-2.5 py-1", glassPill) : mutedText,
          )}
        >
          <CategoryDot color={meta.color} />
          <span className="truncate">{meta.label}</span>
        </span>
        <ScoreBadge score={score} styles={cover ? glassPill : ""} />
      </div>
      <div className="mt-auto flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-lg font-semibold group-hover:underline group-hover:decoration-primary group-hover:decoration-2">
          {name}
        </h3>
        <p className={cn("flex items-center gap-1.5 text-sm", mutedText)}>
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">
            {city}, {address}
          </span>
        </p>
      </div>
    </Link>
  );
}

export default SmallFacilityPreviewCard;
