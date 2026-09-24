import { BookedBanner } from '@/app/(main)/account/appointments/_components/BookedBanner';

// app/(main)/account/appointments/page.tsx
export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const { booked } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      {booked && <BookedBanner />}
      {/* здесь будет список из GET /bookings/mine (S3) */}
    </div>
  );
}
