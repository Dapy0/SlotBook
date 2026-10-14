"use client";
import { useState } from "react";
import type {
  ChangeWeekScheduleRequest,
  ScheduleRequestResponse,
  ScheduleRequestStatus,
  StaffScheduleEntryResponse,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { ScheduleRequestStatusBadge } from "@/components/schedule/ScheduleRequestStatusBadge";
import { WeeklyScheduleForm } from "@/components/schedule/WeeklyScheduleForm";
import { submitMyScheduleRequests } from "@/services/scheduleRequests";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { PendingRequestCard } from '@/app/(main)/work/schedule/_components/PendingRequestCard';
import { RequestHistory } from '@/app/(main)/work/schedule/_components/RequestHistory';

type Props = {
  currentSchedule: StaffScheduleEntryResponse[];
  requests: ScheduleRequestResponse[];
  isActive: boolean;
};

export function ScheduleRequestSection({ currentSchedule, requests, isActive }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();
  const openRequest = requests.find((req) => req.status === "pending");
  const pastRequests: ScheduleRequestResponse[] = requests.filter(
    (req) => req.status !== "pending",
  );

  async function handleSubmit(entries: ChangeWeekScheduleRequest) {
    try {
      await submitMyScheduleRequests({
        entries,
        note: null,
      });
      router.refresh();
    } catch (error) {
      throw new Error(
        error instanceof ApiError
          ? error.message
          : "Couldn't send the schedule. Check your connection and try again.",
      );
    }
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Change my hours</h2>

      {openRequest ? (
        <PendingRequestCard request={openRequest} currentSchedule={currentSchedule} />
      ) : isFormOpen ? (
        <div className="rounded-xl border bg-card p-4">
          <WeeklyScheduleForm initialData={currentSchedule} onSubmit={handleSubmit} />
          <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button className="w-fit" disabled={!isActive} onClick={() => setIsFormOpen(true)}>
          Request new hours
        </Button>
      )}

      {pastRequests.length > 0 && (
        <RequestHistory requests={pastRequests} currentSchedule={currentSchedule} />
      )}
    </section>
  );
}
