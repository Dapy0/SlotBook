"use client";
import { useFilterHref } from "@/components/hooks/useFilterHref";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FacilitySort } from "@slotbook/shared";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: Array<{ value: FacilitySort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

function SortSelect() {
  const buildHref = useFilterHref();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "recommended";

  return (
    <Select
      value={current}
      items={SORT_OPTIONS}
      onValueChange={(value) =>
        router.replace(
          buildHref({ sort: !value || value === "recommended" ? null : String(value) }) as Route,
        )
      }
    >
      <SelectTrigger aria-label="Sort venues" className="h-11 w-full sm:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SortSelect;
