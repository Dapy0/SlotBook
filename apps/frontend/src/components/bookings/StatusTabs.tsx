import Link from "next/link";
import type { Route } from "next";
import type { BookingStatus } from "@slotbook/shared";

const STATUS_FILTERS: { value: BookingStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "canceled", label: "Canceled" },
];

type Props = {
  status: BookingStatus | undefined;
  hrefFor: (changes: { status?: BookingStatus }) => string;
};

export function StatusTabs({ status, hrefFor }: Props) {
  return (
    <nav className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1" aria-label="Filter by status">
      {STATUS_FILTERS.map((f) => {
        // TODO 4: активна ли вкладка
        const isActive = false;
        return (
          <Link
            key={f.label}
            href={hrefFor({ status: f.value }) as Route}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
