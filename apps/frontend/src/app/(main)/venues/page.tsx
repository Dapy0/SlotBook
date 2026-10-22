// ФАЙЛ: apps/frontend/src/app/(main)/venues/page.tsx — заменить файл целиком
import BigFacilityPreviewCard from "@/components/layout/BigFacilityPreviewCard";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import FiltersSidebar from "@/app/(main)/venues/_components/FiltersSidebar";
import ResultsToolbar from "@/app/(main)/venues/_components/ResultsToolbar";
import ActiveFilters from "@/app/(main)/venues/_components/ActiveFilters";
import Pagination from "@/app/(main)/venues/_components/Pagination";
import { getSearchFacets, searchFacilities } from "@/services/facilities";
import { parseVenueSearch, toVenuesHref } from "@/lib/venueSearch";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Route } from "next";

type RawSearchParams = Record<string, string | string[] | undefined>;

async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const search = parseVenueSearch(await searchParams);
  const country = (await cookies()).get("_sb_country")?.value || "PL";

  const [result, facets] = await Promise.all([
    searchFacilities({ ...search, country }),
    getSearchFacets({ ...search, country }),
  ]);

  if (result.totalPages > 0 && search.page > result.totalPages) {
    redirect(toVenuesHref({ ...search, page: result.totalPages }) as Route);
  }

  const title = search.category ? CATEGORY_METADATA[search.category].label : "All venues";
  const { total, items } = result;
  const from = total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = from === 0 ? 0 : from + items.length - 1;
  const hasFilters = Boolean(
    search.category || search.rating !== undefined || search.q || search.city || search.priceMax,
  );

  return (
    <div>
      <BreadCrumbs />
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <span className="text-muted-foreground nums">
          {total} {total === 1 ? "venue" : "venues"}
          {search.city ? ` in ${search.city}` : ""}
        </span>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <Suspense fallback={<Skeleton className="h-96 w-full lg:w-64" />}>
          <FiltersSidebar facets={facets} />
        </Suspense>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
            <ResultsToolbar />
          </Suspense>
          <Suspense fallback={null}>
            <ActiveFilters currency={facets.price?.currency ?? null} />
          </Suspense>

          {items.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground nums">
                Showing {from}–{to} of {total} venues
              </p>
              {items.map((facility) => (
                <BigFacilityPreviewCard facilityWithServices={facility} key={facility.id} />
              ))}
              <Pagination search={search} totalPages={result.totalPages} />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-8">
              <h2 className="text-xl font-semibold">No venues match these filters</h2>
              <p className="max-w-prose text-muted-foreground">
                Try another category or city, raise the price limit or lower the minimum rating.
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
