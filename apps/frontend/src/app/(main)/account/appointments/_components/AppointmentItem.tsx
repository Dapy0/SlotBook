import { CancelBookingButton } from "@/app/(main)/account/appointments/_components/CancelBookingButton";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { formatTimeToTimezone, moneyFormatterFromCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingWithDetailsResponse } from "@slotbook/shared";
import type { Route } from "next";
import Link from "next/link";

type Props = {
  booking: BookingWithDetailsResponse;
  isHighlighted?: boolean;
};

function datePart(date: Date, timeZone: string, part: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, ...part }).format(date);
}

function AppointmentItem({ booking, isHighlighted = false }: Props) {
  const {
    id,
    status,
    startsAt,
    endsAt,
    serviceName,
    facilityName,
    facilitySlug,
    facilityTimezone,
    staffMemberName,
    priceCents,
    currency,
  } = booking;
  const time = `${formatTimeToTimezone(startsAt, facilityTimezone)} – ${formatTimeToTimezone(endsAt, facilityTimezone)}`;
  const now = new Date();
  const isCancelable = status !== "canceled" && startsAt > now;
  const isCompleted = status === "confirmed" && endsAt <= now;

  return (
    <article
      className={cn(
        "flex w-full gap-4 rounded-xl border border-border bg-card p-4 sm:items-center sm:p-5",
        isHighlighted && "border-primary ring-3 ring-primary/30",
        status === "canceled" && "bg-muted/50",
      )}
    >
      {/* Date set like a page of an appointment book. */}
      <div
        className={cn(
          "flex w-16 shrink-0 flex-col items-center justify-center self-start rounded-lg border py-2",
          status === "canceled"
            ? "border-border text-muted-foreground"
            : "border-primary/60 bg-accent",
        )}
      >
        <span className="text-xs font-semibold uppercase">
          {datePart(startsAt, facilityTimezone, { month: "short" })}
        </span>
        <span className="font-heading text-2xl leading-none font-bold nums">
          {datePart(startsAt, facilityTimezone, { day: "numeric" })}
        </span>
        <span className="text-xs text-muted-foreground">
          {datePart(startsAt, facilityTimezone, { weekday: "short" })}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-semibold",
                status === "canceled" && "text-muted-foreground line-through",
              )}
            >
              {serviceName}
            </p>
            <StatusBadge status={isCompleted ? "completed" : status} />
          </div>
          <p className="text-sm font-medium nums">{time}</p>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/venues/${facilitySlug}` as Route}
              className="font-medium text-foreground hover:text-brand-ink hover:underline"
            >
              {facilityName}
            </Link>
            {" · with "}
            {staffMemberName}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="font-semibold whitespace-nowrap nums">
            {moneyFormatterFromCents(priceCents, currency)}
          </span>
          {isCancelable && <CancelBookingButton bookingId={id} />}
        </div>
      </div>
    </article>
  );
}

export default AppointmentItem;
