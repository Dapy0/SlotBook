"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { patchStaffMembersForOwner } from "@/services/staff";
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
      console.log(err);
      setError("Worker still has future appointments. First cancel them and then fire them.");
    } finally {
      setIsPending(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Fire {name}?</span>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => changeStatus(false)}
          >
            Fire
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsConfirming(false)}>
            Cancel
          </Button>
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
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
            Fire
          </Button>
        ) : (
          <Button size="sm" disabled={isPending} onClick={() => changeStatus(true)}>
            Rehire
          </Button>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
