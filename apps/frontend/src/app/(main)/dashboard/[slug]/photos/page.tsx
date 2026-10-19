import { notFound } from "next/navigation";
import { getMe } from "@/lib/session";
import { getManagedFacility } from "@/services/facilities.server";
import { FACILITY_IMAGE_MAX_COUNT } from "@slotbook/shared";
import { FacilityImagesManager } from "./_components/FacilityImagesManager";

export default async function FacilityPhotosPage({
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
    <div className="flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Photos</h1>
        <p className="text-sm text-muted-foreground">
          Up to {FACILITY_IMAGE_MAX_COUNT} photos. The first one is the cover clients see first.
        </p>
      </header>

      <FacilityImagesManager facilityId={facility.id} initialImages={facility.images} />
    </div>
  );
}
