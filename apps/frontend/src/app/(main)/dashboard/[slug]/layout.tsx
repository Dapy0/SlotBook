import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

import { getMe } from "@/lib/session";
import { NavLinks, type NavItem } from "@/app/(main)/dashboard/_components/NavLinks";

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
    redirect(`/login?next=${slug}`);
  }
  const facility = userAuth.ownedFacilities.find((ele) => ele.slug === slug);
  if (!facility) {
    return notFound();
  }
  const base = `/dashboard/${slug}`;
  const navItems: NavItem[] = [
    { href: `${base}`, label: "Overview", exact: true },
    { href: `${base}/bookings`, label: "Bookings" },
    { href: `${base}/services`, label: "Services" },
    { href: `${base}/staff`, label: "Staff" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
      <aside className="flex w-full shrink-0 flex-col gap-4 md:w-56">
        <div className="flex flex-col gap-1 border-b pb-4">
          <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">Venue</span>
          <span className="font-semibold text-gray-900">{facility.name}</span>
          <Badge
            variant="outline"
            className={`w-fit ${
              facility.isPublished
                ? "border-green-500 bg-green-100 text-green-600"
                : "border-gray-500 bg-gray-100 text-gray-600"
            } `}
          >
            {facility.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <NavLinks items={navItems} />
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
