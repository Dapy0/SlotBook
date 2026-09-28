import AppointmentItem from "@/app/(main)/account/appointments/_components/AppointmentItem";
import { BookedBanner } from "@/app/(main)/account/appointments/_components/BookedBanner";
import { getMineBookings } from '@/services/booking.server';
import Link from "next/link";
const TABS = [
  { scope: "upcoming", label: "Upcoming" },
  { scope: "past", label: "Past" },
] as const;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; booked?: string }>;
}) {
  const { scope: rawScope, booked } = await searchParams;
  const scope = rawScope === "past" ? "past" : "upcoming";
  const myBookings = await getMineBookings(scope);
  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">My appointments</h1>
        <p className="text-sm text-gray-500">All your visits in one place</p>
      </header>
      {booked && <BookedBanner />}
      <nav className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => {
          const isActive = tab.scope === scope;
          return (
            <Link
              key={tab.scope}
              href={`?scope=${tab.scope}`}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {myBookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium text-gray-900">
           {scope === "upcoming" ? "You have no upcoming appointments" : "No past appointments"}
          </p>
          {scope === "upcoming" && (
            <Link href="/venues" className="text-sm font-medium text-primary hover:underline">
              Find a venue and book →
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {myBookings.map((booking) => (
            <li key={booking.id}>
              <AppointmentItem booking={booking} isHighlighted={booking.id === booked} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
