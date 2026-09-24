import { BookedBanner } from "@/app/(main)/account/appointments/_components/BookedBanner";
import { getMineBookings } from "@/services/booking";
import { cookies } from 'next/headers';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const { booked } = await searchParams;
  const cookieStore = await cookies();
  const myBookings = await getMineBookings(cookieStore.toString());
  return (
    <div className="flex flex-col gap-6">
      {booked && <BookedBanner />}
      {myBookings.map((booking) => {
        return <div className="border p-3">{booking.status}</div>;
      })}
    </div>
  );
}
