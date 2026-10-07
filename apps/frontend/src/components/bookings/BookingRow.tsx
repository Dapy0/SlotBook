import { formatInTimeZone } from "date-fns-tz";
import { TRANSITIONS, type FacilityBookingResponse } from "@slotbook/shared";
import { moneyFormatterFromCents } from "@/lib/format";
import { BookingActions } from "@/components/bookings/BookingActions";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  booking: FacilityBookingResponse;
  timeZone: string;
  showStaff?: boolean; // в кабинете мастера (S8) колонка мастера не нужна
};

export function BookingRow({ booking, timeZone, showStaff = true }: Props) {
  const {
    id,
    status,
    startsAt,
    endsAt,
    serviceName,
    staffMemberName,
    client,
    priceCents,
    currency,
  } = booking;

  const isChangeable =
    (TRANSITIONS[status]["confirmed"] || TRANSITIONS[status]["canceled"]) && startsAt > new Date();

  return (
    <div
      className={cn(
        "grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-4 py-3.5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center",
        status === "canceled" && "bg-muted/40",
      )}
    >
      <div className="flex flex-col leading-tight nums">
        <span className="font-semibold">{formatInTimeZone(startsAt, timeZone, "HH:mm")}</span>
        <span className="text-sm text-muted-foreground">
          {formatInTimeZone(endsAt, timeZone, "HH:mm")}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p
          className={cn(
            "truncate font-medium",
            status === "canceled" && "text-muted-foreground line-through",
          )}
        >
          {serviceName}
          {showStaff && (
            <span className="font-normal text-muted-foreground no-underline">
              {" "}
              · {staffMemberName}
            </span>
          )}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {client.clientName} ·{" "}
          <a
            href={`mailto:${client.clientEmail}`}
            className="hover:text-foreground hover:underline"
          >
            {client.clientEmail}
          </a>
        </p>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:justify-end">
        <span className="text-sm font-semibold whitespace-nowrap nums">
          {moneyFormatterFromCents(priceCents, currency)}
        </span>
        <StatusBadge status={status} short />
        {isChangeable && <BookingActions bookingId={id} status={status} />}
      </div>
    </div>
  );
}
