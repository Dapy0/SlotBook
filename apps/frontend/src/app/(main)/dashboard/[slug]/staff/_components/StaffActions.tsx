"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { patchStaffMembersForOwner } from "@/services/staff";
import { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";

type Props = {
  facilityId: string;
  staffId: string;
  name: string;
  isActive: boolean;
  onOpenServices: () => void;
  onOpenSchedule: () => void;
};

export function StaffActions({
  facilityId,
  staffId,
  name,
  isActive,
  onOpenServices,
  onOpenSchedule,
}: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(nextIsActive: boolean) {
    setIsPending(true);
    setError(null);
    try {
      await patchStaffMembersForOwner(facilityId, staffId, { isActive: nextIsActive });
      router.refresh();
    } catch (err) {
      // 409 means upcoming bookings block the change; anything else is a generic failure.
      setError(
        err instanceof ApiError && err.status === 409
          ? "This person still has upcoming bookings. Cancel them first, then remove them."
          : "Couldn't update this staff member. Try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">Remove {name} from the team?</span>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => changeStatus(false)}
          >
            Remove
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsConfirming(false)}>
            Cancel
          </Button>
        </div>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button size="sm" variant="outline" onClick={onOpenServices}>
          Services
        </Button>
        <Button size="sm" variant="outline" onClick={onOpenSchedule}>
          Schedule
        </Button>
        {isActive ? (
          <Button size="sm" variant="ghost" onClick={() => setIsConfirming(true)}>
            Remove
          </Button>
        ) : (
          <Button size="sm" disabled={isPending} onClick={() => changeStatus(true)}>
            Rehire
          </Button>
        )}
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
