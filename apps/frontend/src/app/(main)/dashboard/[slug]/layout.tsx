import { notFound, redirect } from "next/navigation";

import { getMe } from "@/lib/session";
import { NavLinks, type NavItem } from "@/app/(main)/dashboard/_components/NavLinks";
import Link from "next/link";
import type { Route } from "next";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function FacilityDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userAuth = await getMe();
  if (userAuth == null) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`);
  }
  const facility = userAuth.ownedFacilities.find((ele) => ele.slug === slug);
  if (!facility) {
    return notFound();
  }
  const base = `/dashboard/${slug}`;
  // Settings is not built yet, so it is not linked.
  const navItems: NavItem[] = [
    { href: `${base}`, label: "Overview", exact: true },
    { href: `${base}/bookings`, label: "Bookings" },
    { href: `${base}/services`, label: "Services" },
    { href: `${base}/staff`, label: "Staff" },
  ];

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:gap-10">
      <aside className="flex w-full shrink-0 flex-col gap-4 md:sticky md:top-6 md:w-56 md:self-start">
        <div className="flex items-center justify-between gap-3 md:flex-col md:items-start">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="truncate font-heading text-lg font-bold">{facility.name}</span>
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
                facility.isPublished
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {facility.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <Link
            href={`/venues/${slug}` as Route}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
          >
            View public page
            <ExternalLink aria-hidden className="size-3.5" />
          </Link>
        </div>
        <NavLinks items={navItems} />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
