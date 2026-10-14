"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { unpublishFacility } from "@/services/facilities";

type Props = {
  facilityId: string;
  slug: string;
  isPublished: boolean;
};

export function PublicationCard({ facilityId, slug, isPublished }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnpublish() {
    try {
      await unpublishFacility(facilityId);
      setIsPending(true);
      router.refresh();
      setConfirming(false);
    } catch (error) {
      error instanceof ApiError
        ? setError(error.message)
        : setError("Couldn't unpublish the schedule. Check your connection and try again.");
    }
    setIsPending(false);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">Visibility</h2>
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? "Clients can find and book this venue."
              : "Draft. Only you can see this venue."}
          </p>
        </div>

        {isPublished ? (
          !confirming && (
            <Button variant="outline" onClick={() => setConfirming(true)}>
              Unpublish
            </Button>
          )
        ) : (
          <NextLink
            href={`/dashboard/${slug}` as Route}
            className="text-sm font-medium text-brand-ink hover:underline"
          >
            Go to checklist
          </NextLink>
        )}
      </div>

      {confirming && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4">
          {/* TODO P3: текст должен соответствовать решению 10.5.4 (что с будущими бронями). */}
          <p className="text-sm">
            The venue disappears from search. Existing bookings stay as they are.
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleUnpublish} disabled={isPending}>
              {isPending ? "Unpublishing…" : "Yes, unpublish"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
