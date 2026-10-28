// ФАЙЛ: apps/frontend/src/app/(main)/venues/_components/Pagination.tsx — НОВЫЙ файл, создать
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toVenuesHref, type VenueSearch } from "@/lib/venueSearch";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { getPageWindow } from "@slotbook/shared";

function Pagination({ search, totalPages }: { search: VenueSearch; totalPages: number }) {
  if (totalPages <= 1) return null;

  const current = search.page;
  const hrefFor = (page: number) => toVenuesHref({ ...search, page }) as Route;
  const pageClass = (isCurrent: boolean) =>
    cn(buttonVariants({ variant: isCurrent ? "default" : "ghost", size: "sm" }), "min-w-9 nums");
  const edgeClass = cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1");

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1 pt-2">
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} className={edgeClass}>
          <ChevronLeft aria-hidden />
          Prev
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(edgeClass, "pointer-events-none opacity-50")}>
          <ChevronLeft aria-hidden />
          Prev
        </span>
      )}

      {getPageWindow(current, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-muted-foreground">
            …
          </span>
        ) : item === current ? (
          <span key={item} aria-current="page" className={pageClass(true)}>
            {item}
          </span>
        ) : (
          <Link key={item} href={hrefFor(item)} className={pageClass(false)}>
            {item}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link href={hrefFor(current + 1)} className={edgeClass}>
          Next
          <ChevronRight aria-hidden />
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(edgeClass, "pointer-events-none opacity-50")}>
          Next
          <ChevronRight aria-hidden />
        </span>
      )}
    </nav>
  );
}

export default Pagination;
