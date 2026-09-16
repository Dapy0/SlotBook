import BookForm from "@/app/(main)/venues/[slug]/book/_components/BookForm";

import { ApiError } from "@/lib/api";
import { getDataForBooking, getFacilityById } from "@/services/facilities";
import { notFound } from "next/navigation";
import { getServiceByFacilityIdServiceId } from "@/services/service";
import { getStaffMembersByFacilityId } from "@/services/staff";
import { staffMembers } from "../../../../../../../backend/src/db/schema/staffMember";

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service: string; staff?: string; date?: string; time?: string }>;
}) {
  const { slug: facilityId } = await params;
  const { date, service, staff, time } = await searchParams;
  const [bookingData] = await Promise.all([
    getDataForBooking(facilityId).catch((err) => {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }),
  ]);

  return (
    <BookForm
      bookingData={bookingData}
      initialStaff={staff ?? null}
      initialService={service ?? null}
      initialDate={date ?? null}
      initialTime={time ?? null}
    />
  );
}

export default Page;
