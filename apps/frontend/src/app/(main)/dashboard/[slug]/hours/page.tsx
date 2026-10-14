import { notFound } from "next/navigation";
import { getMe } from "@/lib/session";
import { FacilityHoursForm } from "./_components/FacilityHoursForm";
import { getFacilitySchedule } from "@/services/facilitySchedule";
import { getFacilityScheduleByFacilityId } from "@/services/facilitySchedule.server";
import type { ChangeWeekScheduleRequest } from "@slotbook/shared";

export default async function FacilityHoursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((f) => f.slug === slug);
  if (!facility) notFound();

  const hours = await getFacilityScheduleByFacilityId(facility.id);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Opening hours</h1>
        <p className="text-sm text-muted-foreground">
          Times are in {facility.timezone}. Add a second interval for a lunch break.
        </p>
      </header>

      <FacilityHoursForm facilityId={facility.id} initialEntries={hours} />
    </div>
  );
}
