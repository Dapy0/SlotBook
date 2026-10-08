import { notFound, redirect } from "next/navigation";
import { getMe } from "@/lib/session";
import { NavLinks, type NavItem } from "@/app/(main)/dashboard/_components/NavLinks";

export default async function WorkLayout({ children }: { children: React.ReactNode }) {
  const userAuth = await getMe();
  if (userAuth == null) {
    redirect(`/login?next=${encodeURIComponent("/work")}`);
  }
  console.log(userAuth.staffMembership);
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
        <p className="text-sm font-medium text-muted-foreground">Staff area</p>
        <h1 className="text-3xl font-bold tracking-tight">{membership.facilityName}</h1>

        {membership.isActive === false && (
          <p className="w-fit rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            Your account is deactivated in this venue. New bookings are not accepted.
          </p>
        )}
      </header>

      <NavLinks items={navItems} orientation="horizontal" />

      <div className="min-w-0">{children}</div>
    </div>
  );
}
