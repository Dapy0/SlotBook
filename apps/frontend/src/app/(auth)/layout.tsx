import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/60">
      <Header
        navBtns={[
          { variant: "ghost", linkHref: "/venues", value: "Venues" },
          { variant: "ghost", linkHref: "/categories", value: "Categories" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-10 sm:items-center md:py-16">
        {children}
      </div>
    </div>
  );
}
