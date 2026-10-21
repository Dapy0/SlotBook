import type { ClientBookingResponse } from "@slotbook/shared";
import { Stars } from "@/components/reviews/Stars";

export function MyReviewSummary({
  review,
}: {
  review: NonNullable<ClientBookingResponse["review"]>;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Your review</span>
        <Stars rating={review.rating} />
      </div>
      {review.comment && <p className="max-w-prose text-sm wrap-break-word">{review.comment}</p>}
    </div>
  );
}
