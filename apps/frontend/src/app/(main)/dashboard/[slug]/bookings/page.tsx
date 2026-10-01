import Link from "next/link";
import {
  addDaysToIso,
  BOOKING_STATUSES,
  formatCalendarDate,
  todayInTimeZone,
  type BookingStatus,
  type FacilityBookingResponse,
} from "@slotbook/shared";
import { BookingRow } from "@/components/bookings/BookingRow";
import { StaffFilter } from "@/components/bookings/StaffFilter";
import type { Route } from "next";
import { getMe } from "@/lib/session";
import { add, addDays, formatDate } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getFacilityBookings } from "@/services/booking.server";
import { getStaffMembersByFacilityId } from "@/services/staff";
import { notFound } from "next/navigation";
import { groupByLocalDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const STATUS_FILTERS: { value: BookingStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "canceled", label: "Canceled" },
];

type SearchParams = { from?: string; status?: BookingStatus; staff?: string };
const isIsoDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isStatus = (v: string | undefined): v is BookingStatus =>
  !!v && (BOOKING_STATUSES as readonly string[]).includes(v);

export default async function FacilityBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((facility) => facility.slug == slug);
  if (!facility) notFound();
  const tz = facility.timezone;

  const from = isIsoDate(query.from) ? query.from : todayInTimeZone(tz);
  const to = addDaysToIso(from, 6);

  const status = isStatus(query.status) ? query.status : undefined;
  const staffId = query.staff || undefined;

  const [bookings, staff] = await Promise.all([
    getFacilityBookings(facility.id, { from, to, status, staffMemberId: staffId }),
    getStaffMembersByFacilityId(facility.id),
  ]);

  const days = groupByLocalDate(bookings, tz);

  const hrefWith = (changes: Partial<SearchParams>) => {
    const next = new URLSearchParams();
    const merged: SearchParams = { from: query.from, status, staff: staffId, ...changes };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `?${qs}` : "?";
  };

  const rangeLabel = `${formatCalendarDate(from, "d MMM")} – ${formatCalendarDate(to, "d MMM yyyy")}`;
  const prevFrom = addDaysToIso(from, -7);
  const nextFrom = addDaysToIso(from, 7);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">{rangeLabel}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div>
            <Button variant={"outline"}>
              <Link href={hrefWith({ from: prevFrom }) as Route}>
                <ArrowLeft className="inline size-4 text-center text-gray-400" />
                Prev
              </Link>
            </Button>
            <Button variant={"default"}>
              <Link href={hrefWith({ from: undefined }) as Route}>This week</Link>
            </Button>

            <Button variant={"outline"}>
              <Link href={hrefWith({ from: nextFrom }) as Route}>
                Next
                <ArrowRight className="inline size-4 text-center text-gray-400" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
          {STATUS_FILTERS.map((f) => {
            const isActive = (f.value ?? undefined) === status;

            return (
              <Link
                key={f.label}
                href={hrefWith({ status: f.value ?? undefined }) as Route}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
        <StaffFilter staff={staff} value={staffId ?? null} />
      </div>

      {days.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-gray-500">
          No bookings for this week
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <section key={day.date} className="flex flex-col gap-2">
              {/* TODO 15: заголовок дня, например "Monday, 5 Oct" + число броней */}
              <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                {formatCalendarDate(day.date, "EEEE, d MMM")} · {day.bookings.length}
              </h2>
              <div className="divide-y rounded-lg border bg-white">
                {day.bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} timeZone={facility.timezone} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
