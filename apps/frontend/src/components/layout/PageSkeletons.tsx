import { Skeleton } from "@/components/ui/skeleton";

// Loading placeholders shaped like the real pages, so content doesn't jump when it arrives.

export function ListPageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-64" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-4 w-56" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-4 h-10 w-72" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-60 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
