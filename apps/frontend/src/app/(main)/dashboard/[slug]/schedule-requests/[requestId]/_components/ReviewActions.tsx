"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveScheduleRequest, rejectScheduleRequest } from "@/services/scheduleRequests";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";

export function ReviewActions({
  facilityId,
  requestId,
}: {
  facilityId: string;
  requestId: string;
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function approve() {
    try {
      await approveScheduleRequest(facilityId, requestId);
      router.refresh();
    } catch (error) {
      error instanceof ApiError
        ? setError(error.message)
        : setError("Couldn't approve the schedule. Check your connection and try again.");
    }
  }
  async function reject() {
    try {
      await rejectScheduleRequest(facilityId, requestId, {
        comment,
      });
      router.refresh();
    } catch (error) {
      error instanceof ApiError
        ? setError(error.message)
        : setError("Couldn't reject the schedule. Check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      {isRejecting ? (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why are you rejecting it?"
            className="rounded-md border border-input px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRejecting(false)}>
              Back
            </Button>
            <Button variant="destructive" disabled={!comment.trim()} onClick={reject}>
              Reject
            </Button>
          </div>
        </>
      ) : (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsRejecting(true)}>
            Reject
          </Button>
          <Button onClick={approve}>Approve</Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
