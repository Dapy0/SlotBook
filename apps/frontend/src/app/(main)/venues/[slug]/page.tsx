import BreadCrumbs from "@/components/layout/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import ScoreBadge from "@/components/layout/ScoreBadge";
import { MapPinIcon, type LucideIcon } from "lucide-react";
import CardWithMap from "@/app/(main)/venues/[slug]/_components/CardWithMap";
import WorkingHours from "@/app/(main)/venues/[slug]/_components/WorkingHours";
import ContactInfo from "@/app/(main)/venues/[slug]/_components/ContactInfo";
import {
  getFacilityById,
  getFacilityBySlug,
  getFacilityScheduleById,
  getFacilityScheduleBySlug,
  getFacilityServicesById,
} from "@/services/facilities";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import FacilityDetailsTab from "@/app/(main)/venues/[slug]/_components/FacilityDetailsTab";
import { getStaffMembersByFacilityId } from "@/services/staff";
import { getFacilityReviews } from "@/services/reviews";
import { ApiError } from "@/lib/api";
import { CATEGORY_METADATA } from "@/app/(main)/_common/types";

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [facility, schedule] = await Promise.all([
    getFacilityBySlug(slug),
    getFacilityScheduleBySlug(slug),
  ]).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });
  const {
    id: facilityId,
    name,
    category,
    score,
    city,
    address,
    description,
    latitude,
    longitude,
    phone,
    email,
  } = facility;
  const Icon = Icons[
    CATEGORY_METADATA[category].icon as keyof typeof Icons
  ] as unknown as LucideIcon;

  const [services, staff, reviews] = await Promise.all([
    getFacilityServicesById(facilityId),
    getStaffMembersByFacilityId(facilityId),
    getFacilityReviews(facilityId),
  ]);
  return (
    <div className="mx-auto w-full">
      <BreadCrumbs />
      <div className="flex items-start gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center gap-2">
            {}
            <Badge variant="outline" className={CATEGORY_METADATA[category].badgeClassName}>
              <Icon />
              {CATEGORY_METADATA[category].label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <div className="flex items-center gap-3">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={score} />
            <span className="text-xs text-gray-600">{reviews.length} reviews</span>
            <span className="flex items-center gap-0.5 text-sm text-gray-600">
              <MapPinIcon size={13} />
              {city} · {address}
            </span>
            {/* <span className="text-sm text-gray-600">4.7 km</span> */}
          </div>
          <p className={"text-sm text-gray-700"}>{description}</p>

          <main className="mt-6 flex flex-col gap-3">
            <FacilityDetailsTab staff={staff} services={services} reviews={reviews} />
          </main>
        </div>
        <div className="flex w-80 shrink-0 flex-col gap-3">
          <CardWithMap address={address} latitude={latitude} longitude={longitude} />
          <WorkingHours hours={schedule} />
          <ContactInfo phone={phone} email={email} />
        </div>
      </div>
    </div>
  );
}

export default Page;
