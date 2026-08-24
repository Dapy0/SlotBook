'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFacilityBookings } from '@/services/booking';
import type { BookingResponse } from '@slotbook/shared/bookings';

function formatDateTime(value: unknown): string {
  const date = new Date(value as string);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  canceled: 'bg-muted text-muted-foreground',
};

export default function FacilityBookingsPage() {
  const { id } = useParams<{ id: string }>();
  const [bookings, setBookings] = useState<BookingResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFacilityBookings(id)
      .then(setBookings)
      .catch((err) => {
        console.error('Failed to load bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
        setBookings([]);
      });
  }, [id]);

  if (!bookings) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-medium text-foreground">Bookings</h1>
        <span className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
          Total: {bookings.length}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <p className="font-medium text-card-foreground">
                {formatDateTime(booking.timeRange.start)}
                {booking.timeRange.end && ` – ${formatDateTime(booking.timeRange.end)}`}
              </p>
              <p className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                Staff: {booking.staffMemberId.slice(0, 8)} · Service:{' '}
                {booking.serviceId.slice(0, 8)} · Client: {booking.clientId.slice(0, 8)}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending
              }`}
            >
              {booking.status}
            </span>
          </div>
        ))}

        {bookings.length === 0 && !error && (
          <p className="p-6 text-center text-sm text-muted-foreground">No bookings yet</p>
        )}
      </div>
    </div>
  );
}
