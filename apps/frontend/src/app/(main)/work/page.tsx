import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { todayInTimeZone, type FacilityBookingResponse } from "@slotbook/shared";
import { getStaffMe, getStaffMeBookings } from "@/services/staffMe.server";
import { BookingRow } from "@/components/bookings/BookingRow";

function formatRange(b: FacilityBookingResponse, tz: string) {
  return `${formatInTimeZone(b.startsAt, tz, "HH:mm")}–${formatInTimeZone(b.endsAt, tz, "HH:mm")}`;
}

export default async function WorkTodayPage() {
  const staffMe = await getStaffMe();
  const tz = staffMe.facility.timezone;
  const now = new Date();
  const today = todayInTimeZone(tz, now);

  const bookingsToday = await getStaffMeBookings({ from: today, to: today });

  const activeToday = bookingsToday.filter((b) => b.status !== "canceled");
  const pendingCount = activeToday.filter((b) => b.status === "pending").length;
  const next = activeToday.find((b) => b.endsAt > now) ?? null;
  const isNow = next !== null && next.startsAt <= now;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Today</h2>
        <p className="text-sm text-gray-500">{formatInTimeZone(now, tz, "EEEE, d MMMM")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Bookings today</p>
          <p className="text-3xl font-bold text-gray-900">{activeToday.length}</p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            pendingCount > 0 ? "border-amber-200 bg-amber-50" : "bg-white"
          }`}
        >
          <p className={`text-sm ${pendingCount > 0 ? "text-amber-700" : "text-gray-500"}`}>
            Waiting for confirmation
          </p>
          <p
            className={`text-3xl font-bold ${pendingCount > 0 ? "text-amber-700" : "text-gray-900"}`}
          >
            {pendingCount}
          </p>
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Next up</h3>
        {next ? (
          <div className="rounded-xl border bg-white p-4">
            <p className="flex items-center gap-2 font-mono text-xl font-semibold text-gray-900">
              {formatRange(next, tz)}
              {isNow && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-sans text-xs font-medium text-blue-700">
                  Now
                </span>
              )}
              {next.status === "pending" && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-sans text-xs font-medium text-amber-700">
                  Pending
                </span>
              )}
            </p>
            <p className="font-medium text-gray-900">{next.serviceName}</p>
            <p className="text-sm text-gray-500">{next.client.clientName}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-gray-500">
            No more bookings today
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">All today</h3>
          <Link href="/work/bookings" className="text-sm text-primary hover:underline">
            See the whole week →
          </Link>
        </div>
        {bookingsToday.length > 0 ? (
          <div className="divide-y rounded-xl border bg-white">
            {bookingsToday.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={tz} showStaff={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-gray-500">
            You have no bookings today
          </div>
        )}
      </section>
    </div>
  );
}
