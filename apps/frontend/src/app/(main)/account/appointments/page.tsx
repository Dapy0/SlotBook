'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Status = 'confirmed' | 'pending' | 'cancelled';

type Booking = {
  service: string;
  business: string;
  staff: string;
  date: string;
  time: string;
  price: string;
  status: Status;
};

const upcoming: Booking[] = [
  {
    service: 'Single Tone Coloring',
    business: 'Studio Nord',
    staff: 'Anna K.',
    date: '28 Aug 2026',
    time: '11:00',
    price: '320,00 zł',
    status: 'confirmed',
  },
  {
    service: 'Court Rental',
    business: 'Padel Kraków',
    staff: 'Tomasz L.',
    date: '30 Aug 2026',
    time: '19:00',
    price: '80,00 zł',
    status: 'pending',
  },
];

const past: Booking[] = [
  {
    service: "Men's Haircut",
    business: 'Studio Nord',
    staff: 'Marek W.',
    date: '14 Aug 2026',
    time: '10:30',
    price: '90,00 zł',
    status: 'cancelled',
  },
  {
    service: 'Oral Hygiene',
    business: 'Klinika Dentim',
    staff: 'Marta S.',
    date: '2 Aug 2026',
    time: '09:00',
    price: '250,00 zł',
    status: 'confirmed',
  },
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    confirmed: 'bg-green-50 text-green-600',
    pending: 'bg-amber-50 text-amber-600',
    cancelled: 'bg-red-50 text-red-600',
  };
  const labels: Record<Status, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
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

function BookingRow({ booking, variant }: { booking: Booking; variant: 'upcoming' | 'past' }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{booking.service}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {booking.business} · {booking.staff} · {booking.date}, {booking.time}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-900">{booking.price}</span>
        <StatusBadge status={booking.status} />

        {variant === 'upcoming' && (
          <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-50">
            Cancel
          </Button>
        )}

        {variant === 'past' && (
          <>
            <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-50">
              Book again
            </Button>
            {booking.status === 'confirmed' && (
              <Button className="bg-primary text-white hover:bg-primary/90">Leave a review</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Page() {
  const [tab, setTab] = useState('upcoming');

  return (
    <div className="min-w-0 flex-1">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      <Tabs value={tab} onValueChange={setTab} className="mt-4 w-full">
        <TabsList variant="line">
          <TabsTrigger value="upcoming">
            <span className="flex items-center gap-1.5">
              Upcoming
              <span className="text-gray-400 font-light text-xs">{upcoming.length}</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="past">
            <span className="flex items-center gap-1.5">
              Past
              <span className="text-gray-400 font-light text-xs">{past.length}</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {upcoming.map((booking, i) => (
                <BookingRow key={i} booking={booking} variant="upcoming" />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {past.map((booking, i) => (
                <BookingRow key={i} booking={booking} variant="past" />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-3 text-xs text-gray-400">
        Cancellation is possible no later than 2 hours before the start. Reviews can only be left
        for completed bookings.
      </p>
    </div>
  );
}

export default Page;
