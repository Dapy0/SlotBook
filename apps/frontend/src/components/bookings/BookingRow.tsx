import { formatInTimeZone } from "date-fns-tz";
import {
  checkTransition,
  TRANSITIONS,
  type BookingStatus,
  type FacilityBookingResponse,
} from "@slotbook/shared";
import { Badge } from "@/components/ui/badge";
import { moneyFormatter } from "@/lib/format";
import { BookingActions } from "@/components/bookings/BookingActions";

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", className: "border-green-200 bg-green-50 text-green-700" },
  canceled: { label: "Canceled", className: "border-gray-200 bg-gray-100 text-gray-500" },
};

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

  const time = `${formatInTimeZone(startsAt, timeZone, "HH:mm")}–${formatInTimeZone(endsAt, timeZone, "HH:mm")}`;

  const isChangeable =
    (TRANSITIONS[status]["confirmed"] || TRANSITIONS[status]["canceled"]) && startsAt > new Date();

  return (
    <div
      className={`grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-4 ${
        status === "canceled" ? "opacity-60" : ""
      }`}
    >
      <span className="font-mono text-sm font-medium text-gray-900">{time}</span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="m-0 truncate font-medium text-gray-900">
          {serviceName}
          {showStaff && <span className="font-normal text-gray-500"> · {staffMemberName}</span>}
        </p>
        <p className="m-0 truncate text-sm text-gray-500">
          {client.clientName} ·{" "}
          <a href={`mailto:${client.clientEmail}`} className="hover:underline">
            {client.clientEmail}
          </a>
        </p>
      </div>

      <div className="flex items-center gap-3 sm:justify-end">
        <span className="text-sm font-semibold whitespace-nowrap">
          {moneyFormatter(priceCents, currency)}
        </span>
        <Badge variant="outline" className={STATUS[status].className}>
          {STATUS[status].label}
        </Badge>
        {isChangeable && <BookingActions bookingId={id} status={status} />}
      </div>
    </div>
  );
}
