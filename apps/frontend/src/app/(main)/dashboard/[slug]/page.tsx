import { BookingRow } from "@/components/bookings/BookingRow";
import { getMe } from "@/lib/session";
import { getFacilityBookings } from "@/services/booking.server";
import type { Route } from "next";
import Link from "next/link";
import { moneyFormatterFromCents } from "../../../../lib/format";
import { formatInTimeZone } from "date-fns-tz";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link href={href as Route} className={buttonVariants({ variant: "link", size: "sm" })}>
        {linkLabel}
        <ArrowRight aria-hidden />
      </Link>
    </div>
  );
}

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
    { label: "Bookings today", value: todayBookings.length },
    { label: "Need confirmation", value: pendingBookings.length },
    {
      label: "Revenue today (confirmed)",
      value: moneyFormatterFromCents(todayAllRevenue, facility.currency),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          {formatInTimeZone(new Date(), facility.timezone, "EEEE, d MMMM")}
        </p>
      </header>

      <dl className="grid divide-y divide-border rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 px-5 py-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="nums font-heading text-2xl font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {pendingBookings.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Waiting for your confirmation"
            href={`/dashboard/${slug}/bookings?status=pending`}
            linkLabel="All pending"
          />
          <p className="-mt-1 text-sm text-muted-foreground">
            Clients see these as reserved until you confirm or cancel.
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-warning/40 bg-card">
            {pendingBookings.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={facility.timezone} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionHeader title="Today" href={`/dashboard/${slug}/bookings`} linkLabel="All bookings" />
        {todayBookings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            No bookings today.
          </p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {todayBookings.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={facility.timezone} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
