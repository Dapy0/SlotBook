"use client";
import { cn } from "@/lib/utils";
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

// Vertical rail on desktop; on phones the same links become a scrollable tab bar.
export function NavLinks({ items, orientation = "vertical" }: Props) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className={cn(
        "-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 md:mx-0 md:px-0",
        orientation === "vertical" && "md:flex-col md:overflow-visible md:border-b-0",
      )}
    >
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative shrink-0 border-b-[3px] px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              orientation === "vertical" &&
                "md:rounded-md md:border-b-0 md:py-2 md:before:absolute md:before:inset-y-1.5 md:before:left-0 md:before:w-[3px] md:before:rounded-full",
              isActive
                ? "border-primary text-foreground md:bg-accent md:before:bg-primary"
                : "border-transparent text-muted-foreground hover:text-foreground md:hover:bg-accent/60",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
