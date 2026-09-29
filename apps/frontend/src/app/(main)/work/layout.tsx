import { notFound, redirect } from "next/navigation";
import { getMe } from "@/lib/session";
import { NavLinks, type NavItem } from '@/app/(main)/dashboard/_components/NavLinks';

export default async function WorkLayout({ children }: { children: React.ReactNode }) {
  const userAuth = await getMe();
  if (userAuth == null) {
    redirect("/login");
  }
  if (userAuth.staffMembership == null) {
    return notFound();
  }
  const membership = userAuth.staffMembership;

  const base = `/work`;
  const navItems: NavItem[] = [
    { href: `${base}`, label: "Today", exact: true },
    { href: `${base}/bookings`, label: "Bookings" },
    { href: `${base}/schedule`, label: "Schedule" },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
          Staff area
        </span>
        <h1 className="text-2xl font-bold text-gray-900">{membership.facilityName}</h1>

        {membership.isActive === false && (
          <p className="w-fit rounded-md bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
            Your account is deactivated in this venue. New bookings are not accepted.
          </p>
        )}
      </header>

      <NavLinks items={navItems} orientation="horizontal" />

      <main className="min-w-0">{children}</main>
    </div>
  );
}
