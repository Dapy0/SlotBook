"use client";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState, useTransition } from "react";
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
  const { user, me, isLoading, logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const items = countries
    ? countries.map((option) => ({
        value: option.country,
        label: `${countryFlag(option.country)} ${countryName(option.country)}`,
      }))
    : null;
  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="align-center mx-auto my-0 flex max-w-7xl justify-between gap-4 p-4">
        <button className="text- cursor-pointer border-0 bg-none p-0 font-sans text-xl font-bold tracking-tight">
          <Link href={"/"}>
            slot
            <span className="text-primary">book</span>
          </Link>
        </button>
        <nav className="ml-auto flex gap-4">
          {navBtns?.map((btn) => (
            <Button key={btn.linkHref as Route<T>} variant={btn.variant}>
              {" "}
              <Link href={btn.linkHref as Route<T>}>{btn.value}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {countries && (
            <Select
              items={items!}
              value={country}
              disabled={isPending}
              onValueChange={(value) => {
                if (!value || value === country) return;
                startTransition(() => setCountry(value));
              }}
            >
              <SelectTrigger className="w-full max-w-48 [&_svg]:hidden!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {items!.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {!isLoading && me ? (
            <ProfileMenu me={me} profilePicture={""} onLogout={logout} />
          ) : (
            rightBtns?.map((btn) => (
              <Button key={btn.linkHref as Route<T>} variant={btn.variant}>
                {" "}
                <Link href={btn.linkHref as Route<T>}>{btn.value}</Link>
              </Button>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
