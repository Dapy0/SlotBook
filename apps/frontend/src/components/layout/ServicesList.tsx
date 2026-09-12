import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { convertMinutesToTime, formatMoney } from '@/lib/utils';
import type { ServiceResponseDTO } from '@slotbook/shared/service';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function groupByCategory(
  services: ServiceResponseDTO[],
): { section: string; items: ServiceResponseDTO[] }[] {
  return Array.from(
    Map.groupBy(services, (s) => s.category),
    ([section, items]) => ({ section, items }),
  );
}



export default function ServicesList({
  services,
  query = '',
}: {
  services: ServiceResponseDTO[];
  query?: string;
}) {
  const pathname = usePathname();
  const prettifyItems = groupByCategory(services);
  const q = query.trim().toLowerCase();
  const formatter = new Intl.DurationFormat('en', { style: 'narrow' });

  const filteredGroups = prettifyItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="w-full rounded-sm border border-gray-200 bg-white shadow-sm">
      {filteredGroups.length === 0 && (
        <p className="px-6 py-8 text-center text-sm text-gray-400">
          No services match your search.
        </p>
      )}

      {filteredGroups.map((group, i) => {
        return (
          <div key={group.section} className={i > 0 ? 'border-t border-gray-200' : ''}>
            <p className="px-6 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.section}
            </p>
            <div className="divide-y divide-gray-100">
              {group.items.map((service) => {
                const query = new URLSearchParams();
                query.append('service', service.id);
                return (
                  <div key={service.name} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        {/* {service.badge && (
                      <Badge className="bg-teal-50 text-xs font-medium text-teal-600">
                        {service.badge}
                      </Badge>
                    )} */}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatter.format({
                          hours: convertMinutesToTime(service.durationMinutes)[0],
                          minutes: convertMinutesToTime(service.durationMinutes)[1],
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(service.priceCents, service.currency)}
                      </span>
                      <Link href={`${pathname}/book?${query}`}>
                        <Button>Book</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
