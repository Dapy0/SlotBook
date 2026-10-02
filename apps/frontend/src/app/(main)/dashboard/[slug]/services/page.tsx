import { notFound } from "next/navigation";
import type { ServiceResponse } from "@slotbook/shared";
import { getMe } from "@/lib/session";
import { ServicesManager } from "./_components/ServicesManager";
import { getFacilityServicesForOwner } from "@/services/service.server";

export default async function FacilityServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((facility) => facility.slug == slug);
  if (!facility) notFound();
  const tz = facility.timezone;
  const services: ServiceResponse[] = await getFacilityServicesForOwner(facility.id);

  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-sm text-gray-500">
          {activeCount} active · {services.length - activeCount} hidden from clients
        </p>
      </header>

      <ServicesManager facilityId={facility.id} currency={facility.currency} services={services} />
    </div>
  );
}
