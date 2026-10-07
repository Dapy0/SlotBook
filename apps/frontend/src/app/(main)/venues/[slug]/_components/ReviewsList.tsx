import type { ReviewResponse } from "@slotbook/shared";
import { StarIcon } from "lucide-react";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          aria-hidden
          className={
            i < rating
              ? "size-3.5 fill-primary stroke-primary"
              : "size-3.5 fill-muted stroke-border"
          }
        />
      ))}
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function ReviewsList({
  reviews,
  query = "",
}: {
  reviews: ReviewResponse[];
  query?: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        No reviews yet. Reviews appear here after clients visit.
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? reviews.filter((r) => r.comment?.toLowerCase().includes(q) ?? false)
    : reviews;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
      <div className="flex flex-col items-start gap-1 self-start rounded-xl border border-border bg-card p-5 sm:items-center sm:text-center">
        <span className="font-heading text-4xl font-bold nums">{avgRating.toFixed(1)}</span>
        <Stars rating={Math.round(avgRating)} />
        <span className="text-sm text-muted-foreground nums">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No reviews match your search.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((review) => (
              <li key={review.id} className="flex flex-col gap-1.5 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <Stars rating={review.rating} />
                  <span className="text-sm text-muted-foreground nums">
                    {dateFormatter.format(new Date(review.createdAt))}
                  </span>
                </div>
                {review.comment && <p className="max-w-prose break-words">{review.comment}</p>}
                <p className="text-sm text-muted-foreground">
                  {review.serviceName} · {review.staffMemberName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
