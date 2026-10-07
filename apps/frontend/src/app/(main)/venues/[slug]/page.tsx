import BreadCrumbs from "@/components/layout/BreadCrumbs";
import ScoreBadge from "@/components/layout/ScoreBadge";
import { MapPin } from "lucide-react";
import CardWithMap from "@/app/(main)/venues/[slug]/_components/CardWithMap";
import WorkingHours from "@/app/(main)/venues/[slug]/_components/WorkingHours";
import ContactInfo from "@/app/(main)/venues/[slug]/_components/ContactInfo";
import {
  getFacilityBySlug,
  getFacilityScheduleBySlug,
  getFacilityServicesById,
} from "@/services/facilities";
import { notFound } from "next/navigation";
import FacilityDetailsTab from "@/app/(main)/venues/[slug]/_components/FacilityDetailsTab";
import { getStaffMembersByFacilityId } from "@/services/staff";
import { getFacilityReviews } from "@/services/reviews";
import { ApiError } from "@/lib/api";
import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import { CategoryDot } from "@/app/(main)/_components/SmallFacilityPreviewCard";
import Link from "next/link";
import type { Route } from "next";
import { buttonVariants } from "@/components/ui/button";

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
  const meta = CATEGORY_METADATA[category];

  const [services, staff, reviews] = await Promise.all([
    getFacilityServicesById(facilityId),
    getStaffMembersByFacilityId(facilityId),
    getFacilityReviews(facilityId),
  ]);
  return (
    <div className="w-full">
      <BreadCrumbs />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CategoryDot color={meta.color} />
              {meta.label}
            </span>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{name}</h1>
              <Link
                href={`/venues/${slug}/book` as Route}
                className={buttonVariants({ size: "lg" })}
              >
                Choose a time
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <ScoreBadge score={score} />
              {reviews.length > 0 && (
                <span className="nums">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin aria-hidden className="size-3.5" />
                {city} · {address}
              </span>
            </div>
            {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
          </header>

          <FacilityDetailsTab staff={staff} services={services} reviews={reviews} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <CardWithMap address={address} latitude={latitude} longitude={longitude} />
          <WorkingHours hours={schedule} />
          <ContactInfo phone={phone} email={email} />
        </aside>
      </div>
    </div>
  );
}

export default Page;
