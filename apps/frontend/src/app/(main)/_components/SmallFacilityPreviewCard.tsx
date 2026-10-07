import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import ScoreBadge from "@/components/layout/ScoreBadge";
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
  const { name, address, city, category, score, slug } = facility;
  const meta = CATEGORY_METADATA[category];

  return (
    <Link
      href={`/venues/${slug}` as Route}
      className="group flex h-full flex-col gap-5 rounded-xl border border-border bg-card p-5 transition-[box-shadow,border-color] duration-200 ease-out outline-none hover:border-[color-mix(in_oklch,var(--primary),var(--border)_40%)] hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <CategoryDot color={meta.color} />
          <span className="truncate">{meta.label}</span>
        </span>
        <ScoreBadge score={score} />
      </div>
      <div className="mt-auto flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-lg font-semibold group-hover:underline group-hover:decoration-primary group-hover:decoration-2">
          {name}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
