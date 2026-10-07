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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground nums">{rangeLabel}</p>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Week">
          <Link
            href={hrefWith({ from: prevFrom }) as Route}
            aria-label="Previous week"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeft aria-hidden />
          </Link>
          <Link
            href={hrefWith({ from: undefined }) as Route}
            className={buttonVariants({ variant: "outline" })}
          >
            This week
          </Link>
          <Link
            href={hrefWith({ from: nextFrom }) as Route}
            aria-label="Next week"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Status" className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => {
            const isActive = (f.value ?? undefined) === status;

            return (
              <Link
                key={f.label}
                href={hrefWith({ status: f.value ?? undefined }) as Route}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150",
                  isActive
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
        <StaffFilter staff={staff} value={staffId ?? null} />
      </div>

      {days.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No bookings this week{status ? ` with status “${status}”` : ""}.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <section key={day.date} className="flex flex-col gap-2">
              <h2 className="flex items-baseline gap-2 font-sans text-base font-semibold">
                {formatCalendarDate(day.date, "EEEE, d MMM")}
                <span className="text-sm font-normal text-muted-foreground nums">
                  {day.bookings.length} {day.bookings.length === 1 ? "booking" : "bookings"}
                </span>
              </h2>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
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
