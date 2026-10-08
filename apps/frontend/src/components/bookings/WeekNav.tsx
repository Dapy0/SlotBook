import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  title: string;
  from: string; // "YYYY-MM-DD"
  to: string;
  hrefFor: (changes: { from?: string }) => string;
};

export function WeekNav({ title, from, to, hrefFor }: Props) {
  // TODO 1: подпись диапазона через formatCalendarDate: "1 Oct – 7 Oct 2026"
  const rangeLabel = `${from} – ${to}`;

  // TODO 2: from - 7 и from + 7 через addDaysToIso
  const prevHref = hrefFor({ from: undefined });
  const nextHref = hrefFor({ from: undefined });
  // TODO 3: "This week" — ссылка без from (сброс на сегодня)
  const todayHref = hrefFor({ from: undefined });

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{rangeLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={prevHref as Route}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label="Previous week"
        >
          <ArrowLeft className="size-4" />
          Prev
        </Link>
        <Link
          href={todayHref as Route}
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          This week
        </Link>
        <Link
          href={nextHref as Route}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label="Next week"
        >
          Next
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </header>
  );
}
