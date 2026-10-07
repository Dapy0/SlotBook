import BigFacilityPreviewCard from "@/components/layout/BigFacilityPreviewCard";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import FiltersSidebar from "@/app/(main)/venues/_components/FiltersSidebar";
import { getCategories } from "@/services/categories";
import { getCitiesList, searchFacilities } from "@/services/facilities";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResultsToolbar from "@/app/(main)/venues/_components/ResultsToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { FacilityListQuery } from "@slotbook/shared";
import { CATEGORY_BY_SLUG, CATEGORY_METADATA } from "@/app/(main)/_common/types";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

async function Page({ searchParams }: { searchParams: Promise<FacilityListQuery> }) {
  const { category, rating, limit = 10, offset = 0, q, sort, city } = await searchParams;
  const country = (await cookies()).get("_sb_country")?.value || "PL";

  const categoryName = category ? CATEGORY_BY_SLUG[category] : undefined;
  if (category && !categoryName) notFound();

  const [facilitiesWithServices, categories, cities] = await Promise.all([
    searchFacilities({ country, limit, offset, category: categoryName, city, q, rating, sort }),
    getCategories({ country, limit }),
    getCitiesList({ country }),
  ]);

  const title = categoryName ? CATEGORY_METADATA[categoryName].label : "All venues";
  const found = facilitiesWithServices.length;
  const hasFilters = Boolean(category || rating || q || city);

  return (
    <div>
      <BreadCrumbs />
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <span className="nums text-muted-foreground">
          {found >= Number(limit) ? `${found}+` : found} {found === 1 ? "venue" : "venues"}
          {city ? ` in ${city}` : ""}
        </span>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <Suspense fallback={<Skeleton className="h-96 w-full lg:w-64" />}>
          <FiltersSidebar cities={cities} counts={categories} />
        </Suspense>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
            <ResultsToolbar />
          </Suspense>

          {found > 0 ? (
            <div className="flex flex-col gap-4">
              {facilitiesWithServices.map((facilityWithServices) => (
                <BigFacilityPreviewCard
                  facilityWithServices={facilityWithServices}
                  key={facilityWithServices.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-8">
              <h2 className="text-xl font-semibold">No venues match these filters</h2>
              <p className="max-w-prose text-muted-foreground">
                Try another category or city, or lower the minimum rating.
              </p>
              {hasFilters && (
                <Link href="/venues" className={buttonVariants({ variant: "outline" })}>
                  Clear all filters
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
