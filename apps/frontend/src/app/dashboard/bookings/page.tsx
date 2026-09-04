'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Status = 'pending' | 'confirmed' | 'cancelled';

type Booking = {
  client: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: Status;
};

const bookings: Booking[] = [
  {
    client: 'Katarzyna N.',
    service: 'Single Tone Coloring',
    staff: 'Anna K.',
    date: '28 Aug',
    time: '11:00–13:00',
    status: 'pending',
  },
  {
    client: 'Piotr Z.',
    service: "Men's Haircut",
    staff: 'Marek W.',
    date: '28 Aug',
    time: '14:00–14:30',
    status: 'confirmed',
  },
  {
    client: 'Olga R.',
    service: 'Classic Back Massage',
    staff: 'Julia S.',
    date: '29 Aug',
    time: '10:00–11:00',
    status: 'confirmed',
  },
  {
    client: 'Adam L.',
    service: "Men's Haircut",
    staff: 'Marek W.',
    date: '30 Aug',
    time: '09:30–10:00',
    status: 'cancelled',
  },
];

const filters: { key: 'all' | Status; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: 'bg-amber-50 text-amber-600',
    confirmed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600',
  };
  const labels: Record<Status, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  };
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<'all' | Status>('all');

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bookings</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Incoming Bookings</h1>

      {/* Status filters */}
      <div className="mt-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {filtered.map((booking, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{booking.client}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {booking.service} · {booking.staff} · {booking.date}, {booking.time}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} />

                {booking.status === 'pending' && (
                  <>
                    <Button className="bg-primary text-white hover:bg-primary/90">Confirm</Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-900 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {booking.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-900 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-400">
              No bookings in this category.
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        The owner can cancel a booking at any time; the client — no later than 2 hours before the
        start.
      </p>
    </div>
  );
}
