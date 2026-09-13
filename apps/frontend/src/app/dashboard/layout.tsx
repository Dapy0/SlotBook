"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/bookings", label: "Bookings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-gray-100 px-4 py-6">
        <Link
          href="/"
          className="mb-8 block px-2 font-sans text-xl font-bold tracking-tight text-gray-900"
        >
          slot<span className="text-primary">book</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md  px-3 py-2 text-lg transition ${
                  isActive
                    ? "bg-gray-100 font-medium text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 px-10 py-8">{children}</div>
    </div>
  );
}
