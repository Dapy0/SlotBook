"use client";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type Props = {
  items: NavItem[];
  orientation?: "vertical" | "horizontal";
};

export function NavLinks({ items, orientation = "vertical" }: Props) {
  const pathname = usePathname();
  return (
    <nav className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-1 border-b"}>
      {items.map((item) => {
       const isActive = item.exact
         ? pathname === item.href
         : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            className={
              orientation === "vertical"
                ? `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                : `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`
            }
          >
            {item.label}
          </Link>
        );
      })}

    </nav>
  );
}
