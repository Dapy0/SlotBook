import ScoreBadge from "@/components/layout/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type BookingSummaryProps = {
  businessName: string;
  city: string;
  address: string;
  score: number | null;
  reviewsCount: number;
  service: string | null;
  duration: string | null;
  date: string | null;
  time: string | null;
  price: string | null;
  canConfirm?: boolean;
  isSubmitting?: boolean;
  needsLogin?: boolean;
  onConfirm?: () => void;
  className?: string;
};

export function confirmLabel(time: string | null, isSubmitting?: boolean) {
  if (isSubmitting) return "Booking…";
  if (!time) return "Choose a time";
  return `Book for ${time.split(" ")[0]}`;
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium nums",
          !value && "font-normal text-muted-foreground",
          highlight && value && "rounded-sm bg-primary px-1.5 text-primary-foreground",
        )}
      >
        {value ?? "Not chosen"}
      </dd>
    </div>
  );
}

export default function BookingSummaryCard({
  businessName,
  city,
  address,
  score,
  reviewsCount,
  service,
  duration,
  date,
  time,
  price,
  canConfirm = false,
  isSubmitting = false,
  needsLogin = false,
  onConfirm,
  className,
}: BookingSummaryProps) {
  return (
    <section aria-label="Booking summary" className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="px-5 py-4">
          <p className="font-heading text-lg font-semibold">{businessName}</p>
          <p className="text-sm text-muted-foreground">
            {city} · {address}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <ScoreBadge score={score} />
            {score != null && (
              <span className="text-sm text-muted-foreground nums">
                {reviewsCount} {reviewsCount === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
        </div>

        <dl className="divide-y divide-border border-t border-border px-5 py-2">
          <Row label="Service" value={service} />
          <Row label="Duration" value={duration} />
          <Row label="Date" value={date} />
          <Row label="Time" value={time} highlight />
        </dl>

        <div className="flex items-center justify-between border-t border-border bg-muted/60 px-5 py-4">
          <span className="text-sm font-medium">Pay at the venue</span>
          <span className="font-heading text-xl font-bold nums">{price ?? "–"}</span>
        </div>
      </div>

      <Button
        size="lg"
        onClick={onConfirm}
        disabled={!canConfirm || isSubmitting}
        aria-busy={isSubmitting}
        className="mt-4 w-full"
      >
        {isSubmitting && <Spinner />}
        {confirmLabel(time, isSubmitting)}
      </Button>
      <p className="mt-3 text-sm text-muted-foreground">
        {needsLogin
          ? "You'll log in before confirming. Your choice is kept."
          : "The venue confirms your booking. You can cancel any time before it starts."}
      </p>
    </section>
  );
}
