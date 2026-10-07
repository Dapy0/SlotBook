"use client";
import { useFilterHref } from "@/components/hooks/useFilterHref";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

function ResultsToolbar() {
  const buildHref = useFilterHref();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("q")?.toString().trim();
        router.replace(buildHref({ q: value || null }) as Route);
      }}
    >
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        name="q"
        aria-label="Search venues and services"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Search venues and services"
        className="h-11 pl-9"
      />
    </form>
  );
}

export default ResultsToolbar;
