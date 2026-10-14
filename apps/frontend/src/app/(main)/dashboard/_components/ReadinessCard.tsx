"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import type { Route } from "next";
import type { FacilityReadinessKey, FacilityReadinessResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { publishFacility } from "@/services/facilities";

const CHECK_COPY: Record<FacilityReadinessKey, { label: string; fix: string; path: string }> = {
  HAS_HOURS: { label: "Opening hours", fix: "Set opening hours", path: "hours" },
  HAS_ACTIVE_SERVICE: { label: "At least one service", fix: "Add a service", path: "services" },
  HAS_BOOKABLE_STAFF: {
    label: "A staff member with services and a schedule",
    fix: "Set up staff",
    path: "staff",
  },
  HAS_LOCATION: { label: "Location on the map", fix: "Add coordinates", path: "settings" },
};

type Props = {
  facilityId: string;
  slug: string;
  readiness: FacilityReadinessResponse;
};

export function ReadinessCard({ facilityId, slug, readiness }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doneCount = readiness.checks.filter((c) => c.ok).length;

  async function handlePublish() {
    try {
      await publishFacility(facilityId);
      setIsPending(true);
      router.refresh();
    } catch (error) {
      error instanceof ApiError
        ? setError(error.message)
        : setError("Couldn't publish the schedule. Check your connection and try again.");
    }
    setIsPending(false);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold">Get your venue live</h2>
        <span className="text-sm text-muted-foreground nums">
          {doneCount} of {readiness.checks.length} done
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {readiness.checks.map(({ key, ok }) => {
          const copy = CHECK_COPY[key];
          return (
            <li key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    ok ? "size-2 rounded-full bg-success" : "size-2 rounded-full bg-border"
                  }
                />
                <span className={ok ? "text-muted-foreground line-through" : ""}>{copy.label}</span>
                <span className="sr-only">{ok ? "done" : "not done"}</span>
              </span>
              {!ok && (
                <NextLink
                  href={`/dashboard/${slug}/${copy.path}` as Route}
                  className="font-medium text-brand-ink hover:underline"
                >
                  {copy.fix}
                </NextLink>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <Button onClick={handlePublish} disabled={!readiness.ready || isPending}>
          {isPending ? "Publishing…" : "Publish venue"}
        </Button>
      </div>
    </section>
  );
}
