
import { CancelBookingButton } from '@/app/(main)/account/appointments/_components/CancelBookingButton';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToTimezone, formatTimeToTimezone, moneyFormatter } from "@/lib/format";
import type { BookingStatus, BookingWithDetailsResponse } from "@slotbook/shared";
import Link from "next/link";
const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", className: "border-green-200 bg-green-50 text-green-700" },
  canceled: { label: "Canceled", className: "border-gray-200 bg-gray-100 text-gray-500" },
};
type Props = {
  booking: BookingWithDetailsResponse;
  isHighlighted?: boolean;
};

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
  const date = formatDateToTimezone(startsAt, facilityTimezone);
  const time = `${formatTimeToTimezone(startsAt, facilityTimezone)}–${formatTimeToTimezone(endsAt, facilityTimezone)}`;
  const now = new Date();
  const isCancelable = status !== "canceled" && startsAt > now;
  const isCompleted = status === "confirmed" && endsAt <= now;
  const badge = isCompleted
    ? { label: "завершено", className: STATUS.confirmed.className }
    : STATUS[status];

  return (
    <div
      className={`flex w-full flex-col gap-3 p-4 transition sm:flex-row sm:items-center sm:justify-between ${
        isHighlighted ? "bg-primary/5" : ""
      } ${status === "canceled" ? "opacity-60" : ""}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 truncate font-medium text-gray-900">{serviceName}</p>
        <p className="text-sm font-light text-gray-600">
          <Link href={`/venues/${facilitySlug}`} className="hover:underline">
            {facilityName}
          </Link>
          {" · "}
          {staffMemberName}
          {" · "}
          {date}, {time}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-md font-bold whitespace-nowrap">
          {moneyFormatter(priceCents, currency)}
        </span>
        <Badge variant="outline" className={badge.className}>
          {badge.label}
        </Badge>
        {isCancelable && <CancelBookingButton bookingId={id} />}
      </div>
    </div>
  );
}

export default AppointmentItem;
