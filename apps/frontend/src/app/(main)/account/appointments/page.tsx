import AppointmentItem from "@/app/(main)/account/appointments/_components/AppointmentItem";
import { BookedBanner } from "@/app/(main)/account/appointments/_components/BookedBanner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMineBookings } from "@/services/booking.server";
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
        <h1 className="text-3xl font-bold tracking-tight">My appointments</h1>
        <p className="text-muted-foreground">
          New bookings wait for the venue to confirm. You can cancel up to 2 hours before the
          start.
        </p>
      </header>
      {booked && <BookedBanner />}
      <nav aria-label="Appointments" className="flex gap-6 border-b border-border">
        {TABS.map((tab) => {
          const isActive = tab.scope === scope;
          return (
            <Link
              key={tab.scope}
              href={`?scope=${tab.scope}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative -mb-px border-b-[3px] pb-2.5 text-sm font-semibold transition-colors duration-150",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {myBookings.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-8">
          <h2 className="text-xl font-semibold">
            {scope === "upcoming" ? "No upcoming appointments" : "No past appointments yet"}
          </h2>
          <p className="text-muted-foreground">
            {scope === "upcoming"
              ? "When you book a time, it shows up here with its status."
              : "Visits you've had will be listed here."}
          </p>
          {scope === "upcoming" && (
            <Link href="/venues" className={buttonVariants()}>
              Find a venue
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
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
