"use client";
import { CATEGORY_BY_SLUG, CATEGORY_METADATA } from "@/app/(main)/_common/types";
import { useFilterHref } from "@/components/hooks/useFilterHref";
import { buttonVariants } from "@/components/ui/button";
import { moneyFormatterFromCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FilterKey = "q" | "category" | "city" | "rating" | "priceMax";

function ActiveFilters({ currency }: { currency: string | null }) {
  const buildHref = useFilterHref();
  const searchParams = useSearchParams();

  const label = (key: FilterKey, value: string): string | null => {
    switch (key) {
      case "q":
        return `“${value}”`;
      case "category": {
        const name = CATEGORY_BY_SLUG[value];
        return name ? CATEGORY_METADATA[name].label : null;
      }
      case "city":
        return value;
      case "rating":
        return `${value}+`;
      case "priceMax": {
        const cents = Number(value);
        if (!Number.isFinite(cents)) return null;
        return `≤ ${currency ? moneyFormatterFromCents(cents, currency) : value}`;
      }
    }
  };

  const chips = (["q", "category", "city", "rating", "priceMax"] as const).flatMap((key) => {
    const value = searchParams.get(key);
    const text = value ? label(key, value) : null;
    return text ? [{ key, text }] : [];
  });

  if (chips.length === 0) return null;

  const sort = searchParams.get("sort");
  const clearHref = sort ? `/venues?sort=${encodeURIComponent(sort)}` : "/venues";

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map(({ key, text }) => (
        <li key={key}>
          <Link
            href={buildHref({ [key]: null }) as Route}
            aria-label={`Remove filter: ${text}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full pr-2 pl-3 nums",
            )}
          >
            {text}
            <X aria-hidden className="size-3.5 text-muted-foreground" />
          </Link>
        </li>
      ))}
      {chips.length >= 2 && (
        <li>
          <Link
            href={clearHref as Route}
            className={buttonVariants({ variant: "link", size: "sm" })}
          >
            Clear all
          </Link>
        </li>
      )}
    </ul>
  );
}

export default ActiveFilters;
