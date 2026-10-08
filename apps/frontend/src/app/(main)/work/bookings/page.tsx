import Link from "next/link";
import type { Route } from "next";
import { addDaysToIso, formatCalendarDate, type BookingStatus } from "@slotbook/shared";
import { getStaffMe, getStaffMeBookings } from "@/services/staffMe.server";
import { BookingRow } from "@/components/bookings/BookingRow";
import { groupByLocalDate } from "@/lib/dates";
import { buildHref, parseWeekQuery } from "@/lib/bookingsQuery";

const STATUS_FILTERS: { value: BookingStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "canceled", label: "Canceled" },
];

const BASE = "/work/bookings";

export default async function WorkBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; status?: string }>;
}) {
  const query = await searchParams;
  const staffMe = await getStaffMe();
  const tz = staffMe.facility.timezone;

  const { from, to, status } = parseWeekQuery(query, tz);
  const bookings = await getStaffMeBookings({ from, to, status });
  const days = groupByLocalDate(bookings, tz);

  const current = { from: query.from, status };
  const hrefFor = (changes: Record<string, string | undefined>) =>
    buildHref(BASE, current, changes) as Route;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My bookings</h2>
          <p className="text-sm text-gray-500">
            {formatCalendarDate(from, "d MMM")} – {formatCalendarDate(to, "d MMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={hrefFor({ from: addDaysToIso(from, -7) })}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ← Prev
          </Link>
          <Link
            href={hrefFor({ from: undefined })}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
          >
            This week
          </Link>
          <Link
            href={hrefFor({ from: addDaysToIso(from, 7) })}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Next →
          </Link>
        </div>
      </div>

      <nav className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.value === status;
          return (
            <Link
              key={f.label}
              href={hrefFor({ status: f.value })}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-gray-500">
          No bookings this week
        </div>
      ) : (
        days.map((day) => (
          <section key={day.date} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              {formatCalendarDate(day.date, "EEEE, d MMM")} · {day.bookings.length}
            </h3>
            <div className="divide-y rounded-xl border bg-white">
              {day.bookings.map((b) => (
                <BookingRow key={b.id} booking={b} timeZone={tz} showStaff={false} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
