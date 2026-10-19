import { notFound } from "next/navigation";
import { getMe } from "@/lib/session";
import { formatDayShifts, WEEKDAYS } from "@/lib/schedule";
import { ScheduleRequestStatusBadge } from "@/components/schedule/ScheduleRequestStatusBadge";
import { ReviewActions } from "./_components/ReviewActions";
import { getFacilityScheduleRequest } from "@/services/scheduleRequests.server";

export default async function ScheduleRequestDetailPage({
  params,
}: {
  params: Promise<{ slug: string; requestId: string }>;
}) {
  const { slug, requestId } = await params;
  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((f) => f.slug === slug);
  if (!facility) notFound();

  const request = await getFacilityScheduleRequest(facility.id, requestId); // TODO: 404 → notFound()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Schedule request</h1>
        <ScheduleRequestStatusBadge status={request.status} />
      </div>

      {request.staffNote && (
        <p className="text-sm text-muted-foreground">Note: {request.staffNote}</p>
      )}

      <table className="w-full rounded-xl border bg-card text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="p-2 text-left">Day</th>
            <th className="p-2 text-left">Now</th>
            <th className="p-2 text-left">Requested</th>
          </tr>
        </thead>
        <tbody>
          {WEEKDAYS.map((day) => (
            <tr key={day.value} className="border-t">
              <td className="p-2">{day.label}</td>
              <td className="p-2 nums">
                {formatDayShifts(request.currentSchedule, day.value) ?? "Off"}
              </td>
              <td className="p-2 nums">{formatDayShifts(request.entries, day.value) ?? "Off"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {request.status === "pending" && (
        <ReviewActions facilityId={facility.id} requestId={request.id} />
      )}
      {request.ownerComment && <p className="text-sm">Your comment: {request.ownerComment}</p>}
    </div>
  );
}
