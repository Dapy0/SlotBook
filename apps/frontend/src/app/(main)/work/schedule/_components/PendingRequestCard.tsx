"use client";
import { useState } from "react";
import type { ScheduleRequestResponse, StaffScheduleEntryResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { ScheduleRequestStatusBadge } from "@/components/schedule/ScheduleRequestStatusBadge";
import { formatDayShifts, WEEKDAYS } from "@/lib/schedule";
import { ApiError } from "@/lib/api";
import { withdrawScheduleRequest } from '@/services/scheduleRequests';
import { useRouter } from 'next/navigation';

type Props = {
  request: ScheduleRequestResponse;
  currentSchedule: StaffScheduleEntryResponse[];
};

export function PendingRequestCard({ request, currentSchedule }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleWithdraw() {
    try {
      await withdrawScheduleRequest(request.id);
      router.refresh();
    } catch (error) {
      throw new Error(
        error instanceof ApiError
          ? error.message
          : "Couldn't withdraw the schedule. Check your connection and try again.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">Waiting for the owner's review</p>
          <p className="text-sm text-muted-foreground nums">
            Sent {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <ScheduleRequestStatusBadge status={request.status} />
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="py-1 font-medium">Day</th>
            <th className="py-1 font-medium">Now</th>
            <th className="py-1 font-medium">Requested</th>
          </tr>
        </thead>
        <tbody>
          {WEEKDAYS.map((day) => {
            const now = formatDayShifts(currentSchedule, day.value);
            const next = formatDayShifts(request.entries, day.value);
            const changed = now !== next;
            if (changed) {
              return (
                <tr key={day.value} className="border-t">
                  <td className="py-1.5">{day.label}</td>
                  <td className="py-1.5 text-muted-foreground nums">{now ?? "Off"}</td>
                  <td
                    className={`py-1.5 nums ${changed ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    {next ?? "Off"}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>

      {request.staffNote && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          <span className="font-medium">Your note: </span>
          {request.staffNote}
        </p>
      )}

      {isConfirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-sm">Withdraw this request?</p>
          <Button size="sm" variant="outline" onClick={() => setIsConfirming(false)}>
            Keep it
          </Button>
          <Button size="sm" variant="destructive" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="self-end"
          onClick={() => setIsConfirming(true)}
        >
          Withdraw request
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
