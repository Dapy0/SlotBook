import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/session";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const userAuth = await getMe();
  if (userAuth == null) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const facilities = userAuth.ownedFacilities;

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">My venues</h1>
        <p className="text-muted-foreground">Manage bookings, services and staff.</p>
      </header>

      {facilities.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-card p-8">
          <h2 className="text-xl font-semibold">You don&apos;t manage a venue yet</h2>
          <p className="max-w-prose text-muted-foreground">
            Venue creation isn&apos;t open in the app yet. Once a venue is linked to your account,
            it appears here.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <li key={facility.id}>
              <Link
                href={`/dashboard/${facility.slug}` as Route}
                className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-[box-shadow,border-color] duration-200 outline-none hover:border-[color-mix(in_oklch,var(--primary),var(--border)_40%)] hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{facility.name}</h2>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
                      facility.isPublished
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <span aria-hidden className="size-1.5 rounded-full bg-current" />
                    {facility.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">/venues/{facility.slug}</p>
                <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-brand-ink">
                  Open dashboard
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
