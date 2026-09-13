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
import { getCookie, getLocation } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

const supportedCounties = [
  { label: "🌍", value: null },
  { label: "Poland", value: "PL" },
  { label: "Germany", value: "DE" },
  { label: "Moldova", value: "MD" },
  { label: "Romania", value: "RO" },
];

export function Header({
  navBtns,
  rightBtns,
}: {
  navBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
  rightBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
}) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    getLocation().then((vale) => {
      setLocation(vale.country);
      router.refresh();
    });
  }, [location]);

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
            <Button key={btn.linkHref} variant={btn.variant}>
              {" "}
              <Link href={btn.linkHref ?? ""}>{btn.value}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<Spinner />}>
            <Select
              items={supportedCounties}
              onValueChange={(val) => {
                if (!val) return;
                document.cookie = `_sb_country=${val}`;
                setLocation(val);
              }}
              value={location ?? null}
            >
              <SelectTrigger className="w-full max-w-48 [&_svg]:hidden!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {supportedCounties.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Suspense>
          {!isLoading && user ? (
            <ProfileMenu user={user} profilePicture={""} onLogout={logout} />
          ) : (
            rightBtns?.map((btn) => (
              <Button key={btn.linkHref} variant={btn.variant}>
                {" "}
                <Link href={btn.linkHref ?? ""}>{btn.value}</Link>
              </Button>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
