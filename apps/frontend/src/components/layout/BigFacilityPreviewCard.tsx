import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import { CategoryDot } from "@/app/(main)/_components/SmallFacilityPreviewCard";
import ScoreBadge from "@/components/layout/ScoreBadge";
import { buttonVariants } from "@/components/ui/button";
import { durationFormatter, moneyFormatterFromCents } from "@/lib/format";
import { createParams } from "@/lib/queryStrings";
import { cn, convertMinutesToTime } from "@/lib/utils";
import type { FacilityWithServicesResponse } from "@slotbook/shared";
import { ChevronRight, ImageOff, MapPin } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

function BigFacilityPreviewCard({
  facilityWithServices,
}: {
  facilityWithServices: FacilityWithServicesResponse;
}) {
  const {
    name,
    address,
    city,
    slug,
    score,
    reviewsCount,
    description,
    services,
    category,
    images,
  } = facilityWithServices;
  const meta = CATEGORY_METADATA[category];
  const venueHref = `/venues/${slug}` as Route;
  const cover = images[0];

  return (
    <div className="@container w-full">
      <article className="grid w-full overflow-hidden rounded-xl border border-border bg-card @xl:grid-cols-[1fr_minmax(220px,280px)] @3xl:grid-cols-[180px_1fr_minmax(240px,280px)] @5xl:grid-cols-[260px_1fr_minmax(260px,320px)]">
        <Link
          href={venueHref}
          tabIndex={-1}
          aria-hidden
          className="group relative block overflow-hidden bg-muted @xl:col-span-2 @3xl:col-span-1 @3xl:m-3 @3xl:mr-0 @3xl:min-h-48 @3xl:rounded-lg"
        >
          {cover ? (
            <img
              src={cover.url}
              alt=""
              loading="lazy"
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] @xl:aspect-[21/9] @3xl:absolute @3xl:inset-0 @3xl:aspect-auto @3xl:size-full"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center text-muted-foreground @xl:aspect-[21/9] @3xl:absolute @3xl:inset-0 @3xl:aspect-auto @3xl:size-full">
              <ImageOff aria-hidden className="size-6" />
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-col gap-4 p-5">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CategoryDot color={meta.color} />
            {meta.label}
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-xl font-semibold">
              <Link
                href={venueHref}
                className="rounded-sm outline-none hover:underline hover:decoration-primary hover:decoration-2 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {name}
              </Link>
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <ScoreBadge score={score} />
              {score != null && (
                <span className="nums">
                  {reviewsCount} {reviewsCount === 1 ? "review" : "reviews"}
                </span>
              )}
              <span className="flex min-w-0 items-center gap-1">
                <MapPin aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">
                  {city} · {address}
                </span>
              </span>
            </div>
            {description && (
              <p className="line-clamp-2 max-w-prose text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Link href={venueHref} className={buttonVariants({ variant: "outline" })}>
              View venue
            </Link>
            <span className="text-xs text-muted-foreground nums">
              {services.length} {services.length === 1 ? "service" : "services"} in the price list
            </span>
          </div>
        </div>

        <div className="flex flex-col border-t border-border bg-muted/50 @xl:border-t-0 @xl:border-l">
          <ul className="flex flex-col">
            {services.slice(0, 3).map((service) => {
              const [hours, minutes] = convertMinutesToTime(service.durationMinutes);
              return (
                <li key={service.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/venues/${slug}/book?${createParams({ service: service.id })}` as Route}
                    className="group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors duration-150 outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground nums">
                        {durationFormatter.format({ hours, minutes })}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold nums">
                      {moneyFormatterFromCents(service.priceCents, service.currency)}
                      <ChevronRight
                        aria-hidden
                        className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto p-4">
            <Link
              href={`/venues/${slug}/book` as Route}
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              Choose a time
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BigFacilityPreviewCard;
