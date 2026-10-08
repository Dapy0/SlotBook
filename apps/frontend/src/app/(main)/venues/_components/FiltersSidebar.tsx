"use client";
import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import { CategoryDot } from "@/app/(main)/_components/SmallFacilityPreviewCard";
import { useFilterHref } from "@/components/hooks/useFilterHref";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, convertToSelectFormat } from "@/lib/utils";
import { FACILITY_CATEGORIES, type FacilityCityResponse } from "@slotbook/shared";
import { SlidersHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const RATINGS = [null, "4.0", "4.5", "4.8"];

function FilterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 font-sans text-sm font-semibold">{children}</h2>;
}

// Only filters the API really applies are shown: category, city and rating.
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
  const [isOpen, setIsOpen] = useState(false);

  const activeCategory = searchParams.get("category");
  const activeRating = searchParams.get("rating");
  const activeCity = searchParams.get("city");
  const formattedCities = convertToSelectFormat(cities, "city", "city");
  const activeCount = [activeCategory, activeRating, activeCity].filter(Boolean).length;

  const rowClass = (isSelected: boolean) =>
    cn(
      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
      isSelected && "bg-accent font-semibold",
    );

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64">
      <Button
        variant="outline"
        className="w-full justify-between lg:hidden"
        aria-expanded={isOpen}
        aria-controls="venue-filters"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden />
          Filters
        </span>
        {activeCount > 0 && <span className="text-muted-foreground nums">{activeCount} on</span>}
      </Button>

      <div
        id="venue-filters"
        className={cn(
          "mt-3 flex-col gap-6 rounded-xl border border-border bg-card p-4 max-lg:enter lg:mt-0 lg:flex",
          isOpen ? "flex" : "hidden",
        )}
      >
        <section>
          <FilterHeading>Category</FilterHeading>
          <ul className="-mx-1 flex flex-col">
            <li>
              <Link
                href={buildHref({ category: null }) as Route}
                aria-current={!activeCategory ? "page" : undefined}
                className={rowClass(!activeCategory)}
              >
                <span className="flex items-center gap-2">
                  <CategoryDot color="var(--foreground)" />
                  All
                </span>
                <span className="text-muted-foreground nums">
                  {counts.reduce((sum, c) => sum + c.count, 0)}
                </span>
              </Link>
            </li>
            {FACILITY_CATEGORIES.map((category) => {
              const { label, slug, color } = CATEGORY_METADATA[category];
              const isSelected = activeCategory === slug;
              const count = counts.find((el) => el?.categoryName === category)?.count ?? 0;

              return (
                <li key={slug}>
                  <Link
                    href={buildHref({ category: isSelected ? null : slug }) as Route}
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(rowClass(isSelected), count === 0 && "text-muted-foreground")}
                  >
                    <span className="flex items-center gap-2">
                      <CategoryDot color={color} />
                      {label}
                    </span>
                    <span className="text-muted-foreground nums">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <FilterHeading>City</FilterHeading>
          <Select
            value={activeCity}
            items={formattedCities}
            onValueChange={(v) => router.replace(buildHref({ city: v || null }) as Route)}
          >
            <SelectTrigger aria-label="City" className="w-full">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All cities</SelectItem>
              {formattedCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label.toWellFormed()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section>
          <FilterHeading>Rating</FilterHeading>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Minimum rating">
            {RATINGS.map((value) => {
              const isActive = activeRating === value;
              return (
                <Link
                  key={value ?? "any"}
                  href={buildHref({ rating: value }) as Route}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    buttonVariants({ size: "sm", variant: isActive ? "default" : "outline" }),
                    "rounded-full px-3 nums",
                  )}
                >
                  {value ? `${value}+` : "Any"}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}

export default FiltersSidebar;
