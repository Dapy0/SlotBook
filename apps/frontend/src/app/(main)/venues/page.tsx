import BigFacilityPreviewCard from "@/components/layout/BigFacilityPreviewCard";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import FiltersSidebar from "@/app/(main)/venues/_components/FiltersSidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/services/categories";
import { getCitiesList, getFacilities, searchFacilities } from "@/services/facilities";
import { SearchIcon } from "lucide-react";
import { cookies } from "next/headers";
import { count } from "drizzle-orm";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResultsToolbar from "@/app/(main)/venues/_components/ResultsToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { FacilityListQuery } from "@slotbook/shared";
import { CATEGORY_BY_SLUG, CATEGORY_METADATA } from "@/app/(main)/_common/types";

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

  const countAll = categories.reduce((sum, c) => sum + c.count, 0);
  const shown = categoryName
    ? (categories.find((c) => c.categoryName === categoryName)?.count ?? 0)
    : countAll;
  const title = categoryName ? CATEGORY_METADATA[categoryName].label : "All";

  return (
    <div className="">
      <BreadCrumbs
        crumbsList={[
          "categories",
          ...(categoryName ? [CATEGORY_METADATA[categoryName].label] : []),
        ]}
      />
      <div className="mb-6 flex items-baseline gap-2">
        <h1 className="text-3xl font-bold">{title} Venues</h1>
        <span className="text-lg text-gray-400">
          {shown} of {countAll}
        </span>
      </div>

      <div className="flex items-start gap-8">
        <Suspense fallback={<Skeleton className="h-160 w-65" />}>
          <FiltersSidebar cities={cities} counts={categories} />
        </Suspense>

        <div className="flex flex-1 flex-col gap-4">
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <ResultsToolbar />
          </Suspense>

          <div className="flex flex-col gap-4">
            {}
            {facilitiesWithServices.length > 0 ? (
              facilitiesWithServices.map((facilityWithServices) => (
                <BigFacilityPreviewCard
                  facilityWithServices={facilityWithServices}
                  key={facilityWithServices.id}
                />
              ))
            ) : (
              <div className="flex items-center self-center pt-10 text-3xl text-gray-400">
                No facilities in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
