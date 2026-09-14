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
import { countryFlag, countryName, type CountryOption } from "@slotbook/shared";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState, useTransition } from "react";
import { setCountry } from "@/app/actions/setCountry";
import type { Route } from "next";

type NavButton<M extends string> = VariantProps<typeof buttonVariants> & {
  linkHref: Route<M> | URL;
  value: string;
};

export function Header<T extends string>({
  navBtns,
  rightBtns,
  countries,
  country,
}: {
  navBtns?: NavButton<T>[];
  rightBtns?: NavButton<T>[];
  countries: CountryOption[];
  country: string;
}) {
  const { user, isLoading, logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const items = countries.map((option) => ({
    value: option.country,
    label: `${countryFlag(option.country)} ${countryName(option.country)}`,
  }));
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
          <Select
            items={items}
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
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {!isLoading && user ? (
            <ProfileMenu user={user} profilePicture={""} onLogout={logout} />
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
