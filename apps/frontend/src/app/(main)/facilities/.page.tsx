import type { Metadata } from "next";
import Link from "next/link";
import { getFacilities } from "@/services/facilities";

export const metadata: Metadata = {
  title: "Facilities Catalog — SlotBook",
  description: "Find and book services nearby.",
};

export default async function FacilitiesPage() {
  // const facilities = await getFacilities();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="font-(family-name:--font-geist-mono) text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Каталог
      </p>
      <h1 className="mt-3 font-heading text-4xl font-medium text-foreground">Заведения</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {facilities.length} {facilities.length === 1 ? "заведение" : "заведений"} доступно для
        бронирования
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {facilities.map((facility) => (
          <Link
            key={facility.id}
            href={`/facilities/${facility.id}`}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="font-(family-name:--font-geist-mono) text-[11px] uppercase tracking-wider text-muted-foreground">
              {facility.category}
            </span>
            <h2 className="mt-2 font-heading text-xl font-medium text-card-foreground group-hover:text-primary">
              {facility.name}
            </h2>
            {facility.description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {facility.description}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {facility.city} · {facility.address}
            </p>
          </Link>
        ))}
      </div>

      {facilities.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No available facilities yet
        </div>
      )}
    </div>
  );
}
