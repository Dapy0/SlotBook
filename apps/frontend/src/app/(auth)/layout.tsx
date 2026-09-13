import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header rightBtns={[{ variant: "outline", linkHref: "/categories", value: "Categories" }]} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
