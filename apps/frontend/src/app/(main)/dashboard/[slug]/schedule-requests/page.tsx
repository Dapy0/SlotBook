import NextLink from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { getMe } from "@/lib/session";
import { getFacilityScheduleRequests } from "@/services/scheduleRequests.server";
import { ScheduleRequestStatusBadge } from "@/components/schedule/ScheduleRequestStatusBadge";

export default async function ScheduleRequestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((f) => f.slug === slug);
  if (!facility) notFound();

  const requests = await getFacilityScheduleRequests(facility.id, { status: "pending" });
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold">Schedule requests</h1>

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests waiting for review.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id}>
              <NextLink
                href={`/dashboard/${slug}/schedule-requests/${r.id}` as Route}
                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-md"
              >
                <span className="font-medium">{/* TODO: staffName */}Staff member</span>
                <ScheduleRequestStatusBadge status={r.status} />
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
