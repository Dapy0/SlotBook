import { Badge } from '@/components/ui/badge';

const groups = [
  {
    section: 'Courts',
    items: [
      {
        title: 'Court Booking (1 court)',
        badge: 'Popular',
        duration: '60 min',
        price: '80 zł',
        cta: 'Book',
      },
      {
        title: 'Private Coaching',
        badge: 'Popular',
        duration: '60 min',
        price: '150 zł',
        cta: 'Book',
      },
    ],
  },
  {
    section: 'Rentals',
    items: [
      {
        title: 'Racket Rental',
        duration: 'per session',
        price: '20 zł',
        cta: 'Add',
      },
      {
        title: 'Ball Set Rental',
        duration: 'per session',
        price: '15 zł',
        cta: 'Add',
      },
    ],
  },
];

export default function ServicesList({ query = '' }: { query?: string }) {
  const q = query.trim().toLowerCase();

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.title.toLowerCase().includes(q)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="w-full rounded-sm border border-gray-200 bg-white shadow-sm">
      {filteredGroups.length === 0 && (
        <p className="px-6 py-8 text-center text-sm text-gray-400">
          No services match your search.
        </p>
      )}

      {filteredGroups.map((group, i) => (
        <div key={group.section} className={i > 0 ? 'border-t border-gray-200' : ''}>
          <p className="px-6 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {group.section}
          </p>
          <div className="divide-y divide-gray-100">
            {group.items.map((service) => (
              <div key={service.title} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{service.title}</span>
                    {service.badge && (
                      <Badge className="bg-teal-50 text-xs font-medium text-teal-600">
                        {service.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{service.duration}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">{service.price}</span>
                  <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700">
                    {service.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
