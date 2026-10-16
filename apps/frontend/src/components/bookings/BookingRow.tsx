import { formatInTimeZone } from "date-fns-tz";
import { TRANSITIONS, type CancelActor, type FacilityBookingResponse } from "@slotbook/shared";
import { moneyFormatterFromCents } from "@/lib/format";
import { formatCancelReason } from "@/lib/cancelReasons";
import { BookingActions } from "@/components/bookings/BookingActions";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  booking: FacilityBookingResponse;
  timeZone: string;
  showStaff?: boolean;
};

// Та же отмена, что видит клиент, но с точки зрения заведения.
function canceledByText(canceledBy: CancelActor | null): string {
  switch (canceledBy) {
    case "client":
      return "Canceled by the client";
    case "staff":
      return "Canceled by staff";
    case "owner":
      return "Canceled by the owner";
    case "system":
      return "Auto-canceled: not confirmed in time";
    case null:
      return "Canceled";
  }
}

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
    canceledBy,
    cancelReason,
  } = booking;

  const isChangeable =
    (TRANSITIONS[status]["confirmed"] || TRANSITIONS[status]["canceled"]) && startsAt > new Date();
  const reasonText = formatCancelReason(cancelReason);

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
          {client.clientName} · {client.clientEmail}
        </p>
        {status === "canceled" && (
          <p className="text-sm text-muted-foreground">
            {canceledByText(canceledBy)}
            {reasonText && ` · ${reasonText}`}
          </p>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:justify-end">
        <span className="text-sm font-semibold whitespace-nowrap nums">
          {moneyFormatterFromCents(priceCents, currency)}
        </span>
        <StatusBadge status={status} short />
        {isChangeable && <BookingActions bookingId={id} status={status} clientName={client.clientName} />}
      </div>
    </div>
  );
}
