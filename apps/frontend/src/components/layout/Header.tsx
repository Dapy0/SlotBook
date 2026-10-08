"use client";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/authContext";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { setCountry } from "@/app/actions/setCountry";
import type { Route } from "next";
import type { CountryOption } from "@/lib/sharedSchemas";

type NavButton<M extends string> = VariantProps<typeof buttonVariants> & {
  linkHref: Route<M> | URL;
  value: string;
};

export function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

const displayNamesCache = new Map<string, Intl.DisplayNames>();

export function countryName(code: string, locale = "en"): string {
  let dn = displayNamesCache.get(locale);
  if (!dn) {
    dn = new Intl.DisplayNames([locale], { type: "region" });
    displayNamesCache.set(locale, dn);
  }
  return dn.of(code.toUpperCase()) ?? code;
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="SlotBook home"
      className={cn(
        "rounded-md font-heading text-xl font-bold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      slot<span className="text-brand-ink">book</span>
    </Link>
  );
}

export function Header<T extends string>({
  navBtns,
  rightBtns,
  countries,
  country,
}: {
  navBtns?: NavButton<T>[];
  rightBtns?: NavButton<T>[];
  countries?: CountryOption[];
  country?: string;
}) {
  const { me, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const items = countries
    ? countries.map((option) => ({
        value: option.country,
        label: `${countryFlag(option.country)} ${countryName(option.country)}`,
      }))
    : null;

  const isSignedIn = !isLoading && me;
  const mobileLinks = [...(navBtns ?? []), ...(isSignedIn ? [] : (rightBtns ?? []))];

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 sm:flex">
          {navBtns?.map((btn) => {
            const href = btn.linkHref.toString();
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={btn.linkHref as Route<T>}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-[3px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity",
                  isActive && "after:opacity-100",
                )}
              >
                {btn.value}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {countries && items && (
            <Select
              items={items}
              value={country}
              disabled={isPending}
              onValueChange={(value) => {
                if (!value || value === country) return;
                startTransition(() => setCountry(value));
              }}
            >
              <SelectTrigger aria-label="Country" className="w-auto max-w-48 [&_svg]:hidden!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {isSignedIn ? (
            <ProfileMenu me={me} profilePicture={""} onLogout={logout} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              {rightBtns?.map((btn) => (
                <Link
                  key={btn.linkHref.toString()}
                  href={btn.linkHref as Route<T>}
                  className={buttonVariants({ variant: btn.variant })}
                >
                  {btn.value}
                </Link>
              ))}
            </div>
          )}
          {mobileLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open menu"
                className={cn(buttonVariants({ variant: "outline", size: "icon" }), "sm:hidden")}
              >
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  {mobileLinks.map((btn) => (
                    <DropdownMenuItem
                      key={btn.linkHref.toString()}
                      render={<Link href={btn.linkHref as Route<T>} />}
                    >
                      {btn.value}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
