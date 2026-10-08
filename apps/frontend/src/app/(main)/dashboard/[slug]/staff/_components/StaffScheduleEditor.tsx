"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { WeeklyScheduleForm, type ScheduleEntry } from "@/components/schedule/WeeklyScheduleForm";
import { getStaffSchedule, putStaffSchedule } from "@/services/staffSchedule";
import type { ChangeWeekScheduleRequest } from "@slotbook/shared";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";

type Props = {
  facilityId: string;
  staffId: string;
  onDone: () => void;
};

// Переиспользуем WeeklyScheduleForm (один интервал в день — ограничение MVP).
export function StaffScheduleEditor({ facilityId, staffId, onDone }: Props) {
  const [initial, setInitial] = useState<ScheduleEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getStaffSchedule(facilityId, staffId)
      .then((res) => {
        setInitial(res);
      })
      .catch(() => setLoadError("Couldn't load the schedule. Close this panel and try again."));
  }, []);

  async function handleSubmit(entries: ChangeWeekScheduleRequest) {
    try {
      await putStaffSchedule(facilityId, staffId, entries);
      router.refresh();
    } catch (error) {
      // Re-throw every failure so the form never reports a save that did not happen.
      throw new Error(
        error instanceof ApiError
          ? error.message
          : "Couldn't save the schedule. Check your connection and try again.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : initial === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading schedule…
        </div>
      ) : (
        <WeeklyScheduleForm initialData={initial} onSubmit={handleSubmit} />
      )}
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Close
        </Button>
      </div>
    </div>
  );
}
