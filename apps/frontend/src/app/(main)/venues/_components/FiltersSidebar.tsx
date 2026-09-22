"use client";
import { CATEGORY_METADATA } from '@/app/(main)/_common/types';
import { useFilterHref } from "@/components/hooks/useFilterHref";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertToSelectFormat } from "@/lib/utils";
import {
  FACILITY_CATEGORIES,
  type FacilityCityResponse,
} from "@slotbook/shared";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
const RATINGS = [null, "4.0", "4.5", "4.8"];
function FiltersSidebar({
  counts,
  cities,
}: {
  counts: Array<{ categoryName: (typeof FACILITY_CATEGORIES)[number]; count: number }>;
  cities: FacilityCityResponse[];
}) {
  const buildHref = useFilterHref();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeRating = searchParams.get("rating");
  const activeCity = searchParams.get("city");
  const activePrice = searchParams.get("priceMax");
  const formattedCities = convertToSelectFormat(cities, "city", "city");

  return (
    <aside className="flex h-fit w-65 shrink-0 flex-col gap-6 rounded-md border p-4">
      <div>
        <p className="mb-3 text-xs font-medium text-gray-500">CATEGORY</p>
        <div className="flex flex-col gap-1">
          <Link href={buildHref({ category: null }) as Route}>
            <Button
              variant={"ghost"}
              className={`-mx-2 flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 ${
                !activeCategory ? "bg-gray-100 font-medium" : "text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-black" />
                All
              </span>
              <span className="text-gray-400">{counts.reduce((sum, c) => sum + c.count, 0)}</span>
            </Button>
          </Link>
          {FACILITY_CATEGORIES.map((category) => {
            const { label, slug, color } = CATEGORY_METADATA[category];
            const isSelected = activeCategory === slug;

            return (
              <Link key={slug} href={buildHref({ category: isSelected ? null : slug }) as Route}>
                <Button
                  variant={"ghost"}
                  key={category}
                  className={`-mx-2 flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 ${
                    isSelected ? "bg-gray-100 font-medium" : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>
                  <span className="text-gray-400">
                    {counts.find((el) => el?.categoryName === category)?.count ?? 0}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-gray-500">CITY</p>
        <Select
          value={activeCity}
          items={formattedCities}
          onValueChange={(v) =>
            router.replace(buildHref({ city: v === "all" ? null : v }) as Route)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All cities</SelectItem>

            {formattedCities.map((city) => (
              <SelectItem value={city.value}> {city.label.toWellFormed()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-gray-500">RATING</p>
        <div className="flex gap-2">
          {RATINGS.map((value) => (
            <Link key={value} href={buildHref({ rating: value }) as Route}>
              <Button
                key={value ?? "any"}
                size="sm"
                variant={activeRating === value ? "default" : "outline"}
              >
                {value ? `${value}+` : "Any"}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-gray-500">PRICE FROM</p>
        <Select
          value={activePrice ?? "any"}
          onValueChange={(v) =>
            router.replace(buildHref({ priceMax: v === "any" ? null : v }) as Route)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="50">Up to 50 zł</SelectItem>
            <SelectItem value="100">Up to 100 zł</SelectItem>
            <SelectItem value="200">Up to 200 zł</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-gray-500">AVAILABILITY</p>
        <div className="flex flex-col gap-2">
          {[
            { key: "availableToday", label: "Slots available today" },
            { key: "openWeekends", label: "Open on weekends" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={searchParams.get(key) === "1"}
                onCheckedChange={(checked) =>
                  router.replace(buildHref({ [key]: checked ? "1" : null }) as Route)
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FiltersSidebar;
