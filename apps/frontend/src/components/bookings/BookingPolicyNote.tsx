import type { PublicBookingPolicy } from "@slotbook/shared";
import { formatCutoff } from "@/lib/format";

type Props = {
  policy: PublicBookingPolicy;
};

export function BookingPolicyNote({ policy }: Props) {
  const confirmation =
    policy.confirmationMode == "auto" ? "Instant confirmation" : "The venue confirms each booking";

  const cancellation = formatCutoff(policy.clientCancelCutoffMinutes);

  return (
    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
      <li>{confirmation}</li>
      <li>{cancellation}</li>
    </ul>
  );
}
