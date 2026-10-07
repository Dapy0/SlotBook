import { buttonVariants } from "@/components/ui/button";
import { durationFormatter, moneyFormatterFromCents } from "@/lib/format";
import { convertMinutesToTime } from "@/lib/utils";
import type { ServiceResponse } from "@slotbook/shared";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

function groupByCategory(
  services: ServiceResponse[],
): { section: string; items: ServiceResponse[] }[] {
  return Array.from(
    Map.groupBy(services, (s) => s.category),
    ([section, items]) => ({ section, items }),
  );
}

export default function ServicesList({
  services,
  query = "",
}: {
  services: ServiceResponse[];
  query?: string;
}) {
  const pathname = usePathname();
  const prettifyItems = groupByCategory(services);
  const q = query.trim().toLowerCase();

  const filteredGroups = prettifyItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      {filteredGroups.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {q ? "No services match your search." : "This venue hasn't added services yet."}
        </p>
      )}

      {filteredGroups.map((group) => (
        <section key={group.section} className="border-t border-border first:border-t-0">
          <h2 className="bg-muted/60 px-5 py-2 font-sans text-sm font-semibold">{group.section}</h2>
          <ul className="divide-y divide-border">
            {group.items.map((service) => {
              const query = new URLSearchParams();
              query.append("service", service.id);
              const [hours, minutes] = convertMinutesToTime(service.durationMinutes);
              return (
                <li key={service.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                    <p className="nums mt-0.5 text-sm text-muted-foreground">
                      {durationFormatter.format({ hours, minutes })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <span className="nums font-semibold">
                      {moneyFormatterFromCents(service.priceCents, service.currency)}
                    </span>
                    <Link
                      href={`${pathname}/book?${query}` as Route}
                      aria-label={`Book ${service.name}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Book
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
