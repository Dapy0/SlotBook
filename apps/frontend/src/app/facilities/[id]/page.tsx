import { getFacilityById, getFacilityServicesById } from '@/services/facilities';
import { formatPrice } from '@slotbook/shared/facilities';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';


type FacilityPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: FacilityPageProps): Promise<Metadata> {
  const { id } = await params;
  const facility = await getFacilityById(id);
  if (!facility) {
    return { title: 'Заведение не найдено — SlotBook' };
  }

  return {
    title: `${facility.name} — SlotBook`,
    description: facility.description ?? undefined,
  };
}

export default async function FacilityPage({ params }: FacilityPageProps) {
  const { id } = await params;
  const facility = await getFacilityById(id);

  if (!facility) {
    notFound();
  }

  const services = await getFacilityServicesById(facility.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <span className="font-(family-name:--font-geist-mono) text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {facility.category}
      </span>
      <h1 className="mt-3 font-heading text-4xl font-medium text-foreground">
        {facility.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {facility.city} · {facility.address}
      </p>

      {facility.description && (
        <p className="mt-6 text-sm leading-relaxed text-foreground">{facility.description}</p>
      )}

      <h2 className="mt-12 font-heading text-2xl font-medium text-foreground">
        Услуги
      </h2>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {services.map((service) => (
          <div key={service.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-card-foreground">{service.name}</p>
              {service.description && (
                <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
              )}
              <p className="mt-1 font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                {service.durationMinutes} мин
              </p>
            </div>
            <p className="shrink-0 font-heading text-lg font-medium text-foreground">
              {formatPrice(service.priceCents, service.currency)}
            </p>
          </div>
        ))}

        {services.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            У этого заведения пока нет доступных услуг
          </p>
        )}
      </div>
    </div>
  );
}
