import BookForm from '@/components/layout/BookForm';
import BookingSummaryCard from '@/components/layout/BookingSummaryCard';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api';
import { getFacilityById } from '@/services/facilities';
import { notFound } from 'next/navigation';
import { getServiceByFacilityIdServiceId, getServicesByFacilityId } from '@/services/service';
import { getStaffMembersByFacilityId } from '@/services/staff';
const staffWorkers = [
  { label: 'Marek W. — Barber', value: 'marek' },
  { label: 'Maria K. — Stylist', value: 'maria' },
  { label: 'Andrew P. — Barber', value: 'andrew' },
];



const timeSlots = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: true },
  { time: '10:30', available: false },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '12:00', available: true },
  { time: '12:30', available: false },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: false },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: false },
  { time: '17:00', available: true },
  { time: '17:30', available: true },
];

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service: string; staff?: string; date?: string; time?: string }>;
}) {
  const { slug: facilityId } = await params;
  const { date, service, staff, time } = await searchParams;
  const facility = await getFacilityById(facilityId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });
  const staffMembers = await getStaffMembersByFacilityId(facilityId);
  console.log(facilityId, service);
  const selectedService = await getServiceByFacilityIdServiceId(facilityId, service);
  if (!selectedService) notFound();

  return (
    <BookForm
      facility={facility}
      service={selectedService}
      staffMembers={staffMembers}
      initialStaff={staff ?? null}
      initialDate={date ?? null}
      initialTime={time ?? null}
    />
  );
}

export default Page;
