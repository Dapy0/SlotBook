import BigFacilityPreviewCard from "@/app/(main)/venues/_components/BigFacilityPreviewCard";
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
import { getFacilities } from "@/services/facilities";
import { CATEGORY_BY_SLUG, CATEGORY_METADATA } from "@slotbook/shared/facility";
import { SearchIcon } from "lucide-react";
import { cookies } from "next/headers";
import { count } from "drizzle-orm";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResultsToolbar from "@/app/(main)/venues/_components/ResultsToolbar";
import { Skeleton } from "@/components/ui/skeleton";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    city?: string;
    rating?: string;
    priceMax?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const { category, rating, priceMax, q, sort } = await searchParams;
  const country = (await cookies()).get("_sb_country")?.value || "PL";

  const categoryName = category ? CATEGORY_BY_SLUG[category] : undefined;
  console.log(categoryName);
  if (category && !categoryName) notFound();

  const [facilities, categories] = await Promise.all([
    getFacilities({ country, category: categoryName, rating, priceMax, q, sort }),
    getCategories({ country }),
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
      <div className="flex items-baseline gap-2 mb-6">
        <h1 className="text-3xl font-bold">{title} Venues</h1>
        <span className="text-gray-400 text-lg">
          {shown} of {countAll}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        <Suspense fallback={<Skeleton className="w-65 h-160" />}>
          <FiltersSidebar counts={categories} />
        </Suspense>

        <div className="flex-1 flex flex-col gap-4">
          <Suspense fallback={<Skeleton className="w-full h-10" />}>
            <ResultsToolbar />
          </Suspense>

          <div className="flex flex-col gap-4">
            {}
            {facilities.length > 0 ? (
              facilities.map((facility) => (
                <BigFacilityPreviewCard facility={facility} key={facility.id} />
              ))
            ) : (
              <div className="flex items-center self-center text-3xl pt-10 text-gray-400">
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
