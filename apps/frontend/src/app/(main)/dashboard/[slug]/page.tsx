import { BookingRow } from "@/components/bookings/BookingRow";
import { getMe } from "@/lib/session";
import { getFacilityBookings } from "@/services/booking.server";
import type { Route } from "next";
import Link from "next/link";
import {
  moneyFormatterFromCents,
} from "../../../../lib/format";
import { formatInTimeZone } from "date-fns-tz";

export default async function FacilityOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((facility) => facility.slug == slug)!;
  const today = formatInTimeZone(new Date(), facility.timezone, "yyyy-MM-dd");

  const [todayBookings, pendingBookings] = await Promise.all([
    getFacilityBookings(facility.id, {
      from: today,
      to: today,
    }),
    getFacilityBookings(facility.id, {
      from: today,
      status: "pending",
    }),
  ]);
  const todayConfirmed = todayBookings.filter((booking) => booking.status == "confirmed");
  const todayAllRevenue = todayConfirmed.reduce((prev, curr) => prev + curr.priceCents, 0);
  const stats = [
    { label: "Today", value: todayBookings.length, hint: "bookings" },
    { label: "Pending", value: pendingBookings.length, hint: "need confirmation" },
    {
      label: "Today's revenue",
      value: moneyFormatterFromCents(todayAllRevenue, facility.currency),
      hint: "confirmed only",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-lg border bg-white p-4">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            <span className="text-xs text-gray-400">{stat.hint}</span>
          </div>
        ))}
      </div>

      {pendingBookings.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Waiting for confirmation</h2>
            <Link
              href={`/dashboard/${slug}/bookings?status=pending` as Route}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y rounded-lg border border-amber-200 bg-white">
            {pendingBookings.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={facility.timezone} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Today</h2>
          <Link
            href={`/dashboard/${slug}/bookings` as Route}
            className="text-sm font-medium text-primary hover:underline"
          >
            All bookings →
          </Link>
        </div>
        {todayBookings.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">
            No bookings today
          </div>
        ) : (
          <div className="divide-y rounded-lg border bg-white">
            {todayBookings.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={facility.timezone} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
