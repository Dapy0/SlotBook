import { notFound } from "next/navigation";
import { getMe } from "@/lib/session";
import { FacilityForm } from "@/components/facility/FacilityForm";
import { getManagedFacility } from "@/services/facilities.server";
import { PublicationCard } from "./_components/PublicationCard";
import { DangerZone } from "./_components/DangerZone";

export default async function FacilitySettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userAuth = await getMe();
  const owned = userAuth?.ownedFacilities.find((f) => f.slug === slug);
  if (!owned) notFound();

  const facility = await getManagedFacility(owned.id);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Venue profile, visibility and removal.</p>
      </header>

      <PublicationCard
        facilityId={facility.id}
        slug={facility.slug}
        isPublished={facility.isPublished}
      />

      <FacilityForm facility={facility} />

      <DangerZone facilityId={facility.id} facilityName={facility.name} />
    </div>
  );
}
