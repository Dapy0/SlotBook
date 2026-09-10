import BreadCrumbs from '@/components/layout/BreadCrumbs';
import { Badge } from '@/components/ui/badge';
import ScoreBadge from '@/components/layout/ScoreBadge';
import { MapPinIcon, type LucideIcon } from 'lucide-react';
import CardWithMap from '@/components/layout/CardWithMap';
import WorkingHours from '@/components/layout/WorkingHours';
import ContactInfo from '@/components/layout/ContactInfo';
import { getFacilityById, getFacilityServicesById } from '@/services/facilities';
import { notFound } from 'next/navigation';
// import StaffList from '@/components/layout/StaffList';
// import ReviewsList from '@/components/layout/ReviewsList';
import * as Icons from 'lucide-react';
import { CATEGORY_METADATA } from '@slotbook/shared/facility';
import FacilityDetailsTab from '@/components/layout/FacilityDetailsTab';
import { getStaffMembersByFacilityId } from '@/services/staff';
import { getFacilityReviews } from '@/services/reviews';

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const {
    id: facilityId,
    name,
    category,
    score,
    reviewsCount,
    city,
    timezoneIANA,
    address,
    description,
    latitude,
    longitude,
    facilitySchedule,
    phone,
    email,
  } = await getFacilityById(slug).catch(() => notFound());
  const Icon = Icons[
    CATEGORY_METADATA[category].icon as keyof typeof Icons
  ] as unknown as LucideIcon;

  const [services, staff, reviews] = await Promise.all([
    getFacilityServicesById(facilityId),
    getStaffMembersByFacilityId(facilityId),
    getFacilityReviews(facilityId),
  ]);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="w-full  mx-auto">
      <BreadCrumbs crumbsList={['facilities', name]} />
      <div className="flex gap-10 items-start">
        <div className="flex flex-col gap-2 flex-1 min-w-0 ">
          <div className="flex items-center gap-2 shrink-0">
            {}
            <Badge variant="outline" className={CATEGORY_METADATA[category].badgeClassName}>
              <Icon />
              {CATEGORY_METADATA[category].label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <div className="flex gap-3 items-center">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={score} />
            <span className="text-xs text-gray-600">{reviews.length} reviews</span>
            <span className="flex text-gray-600 text-sm gap-0.5 items-center">
              <MapPinIcon size={13} />
              {city} · {address}
            </span>
            {/* <span className="text-sm text-gray-600">4.7 km</span> */}
          </div>
          <p className={'text-sm text-gray-700'}>{description}</p>

          <main className="flex flex-col gap-3 mt-6">
            <FacilityDetailsTab staff={staff} services={services} reviews={reviews} />
          </main>
        </div>
        <div className="flex flex-col gap-3 w-80 shrink-0">
          <CardWithMap address={address} latitude={latitude} longitude={longitude} />
          <WorkingHours hours={facilitySchedule} />
          <ContactInfo phone={phone} email={email} />
        </div>
      </div>
    </div>
  );
}

export default Page;
