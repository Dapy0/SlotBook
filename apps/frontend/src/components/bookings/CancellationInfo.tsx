import {
  canClientCancel,
  type BookingWithDetailsResponse,
  type CancelActor,
} from "@slotbook/shared";
import { formatCancelReason } from "@/lib/cancelReasons";
import { formatDeadline } from "@/lib/format";

type Props = {
  booking: BookingWithDetailsResponse;
  now: Date;
};

function canceledText(canceledBy: CancelActor | null, reason: string | null): string {
  switch (canceledBy) {
    case "client":
      return "You canceled this booking";
    case "staff":
    case "owner": {
      const label = formatCancelReason(reason);
      return label ? `Canceled by the venue · ${label}` : "Canceled by the venue";
    }
    case "system":
      return "Not confirmed in time";
    case null:
      return "Canceled";
  }
}

export function CancellationInfo({ booking, now }: Props) {
  const { status, canceledBy, cancelReason, cancelableUntil, createdAt, facilityTimezone } =
    booking;

  if (status === "canceled") {
    return (
      <p className="text-sm text-muted-foreground">{canceledText(canceledBy, cancelReason)}</p>
    );
  }

  if (canClientCancel(booking, now)) {
    return (
      <p className="text-sm text-muted-foreground">
        Free cancellation until {formatDeadline(cancelableUntil, facilityTimezone)}
      </p>
    );
  }

  const hadNoFreeWindow = cancelableUntil.getTime() <= createdAt.getTime();
  return (
    <p className="text-sm text-muted-foreground">
      {hadNoFreeWindow
        ? "This booking can't be canceled online. Contact the venue to change it."
        : "Free cancellation has ended. Contact the venue to change the booking."}
    </p>
  );
}
