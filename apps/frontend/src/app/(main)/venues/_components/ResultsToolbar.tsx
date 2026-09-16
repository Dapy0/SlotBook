"use client";
import { useFilterHref } from "@/components/hooks/useFilterHref";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import type { Route } from 'next';
import { useRouter, useSearchParams } from "next/navigation";

function ResultsToolbar() {
  const buildHref = useFilterHref();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-3">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q")?.toString().trim();
          router.replace(buildHref({ q: value || null }) as Route);
        }}
      >
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Refine results"
          className="pl-9"
        />
      </form>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-gray-500">SORT BY</span>
        <Select
          value={searchParams.get("sort") ?? "rating"}
          onValueChange={(v) =>
            router.replace(buildHref({ sort: v === "rating" ? null : v }) as Route)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">By rating</SelectItem>
            <SelectItem value="distance">By distance</SelectItem>
            <SelectItem value="price">By price</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default ResultsToolbar;
