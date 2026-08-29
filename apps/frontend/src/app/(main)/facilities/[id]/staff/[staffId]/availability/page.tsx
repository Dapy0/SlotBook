// apps/frontend/src/app/facilities/[id]/staff/[staffId]/availability/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getServicesByFacilityId } from '@/services/service';
import { getAvailability } from '@/services/availability';
import { createBooking } from '@/services/booking';
import type { ServiceResponseDTO } from '@slotbook/shared/service';
import type { AvailabilitySlot } from '@slotbook/shared/availability';

function getTodayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function StaffAvailabilityPage() {
  const { id: facilityId, staffId } = useParams<{ id: string; staffId: string }>();

  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(getTodayDateString());

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingStart, setBookingStart] = useState<string | null>(null);
  const [justBooked, setJustBooked] = useState<string | null>(null);

  useEffect(() => {
    getServicesByFacilityId(facilityId).then(setServices);
  }, [facilityId]);

  const fetchSlots = useCallback(() => {
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    getAvailability(facilityId, staffId, serviceId, date)
      .then(setSlots)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
        setSlots([]);
      })
      .finally(() => setIsLoading(false));
  }, [facilityId, staffId, serviceId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  async function handleBookSlot(slot: AvailabilitySlot) {
    setBookingStart(slot.start);
    setError(null);
    setJustBooked(null);
    try {
      await createBooking(facilityId, {
        staffMemberId: staffId,
        serviceId,
        startDatetime: slot.start,
      });
      setJustBooked(slot.start);
      fetchSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingStart(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-heading text-3xl font-medium text-foreground">Available slots</h1>
      <p className="mt-1 text-sm text-muted-foreground">Staff — {staffId.slice(0, 8)}</p>

      <div className="mt-8 flex flex-wrap items-end gap-4">
        <div className="min-w-48 flex-1 space-y-1.5">
          <Label>Service</Label>
          <Select value={serviceId} onValueChange={(value) => setServiceId(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {justBooked && (
        <div className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          Booked {formatTime(justBooked)} — refreshed the list below
        </div>
      )}

      <div className="mt-8">
        {!serviceId && (
          <p className="text-sm text-muted-foreground">Pick a service to see available slots.</p>
        )}

        {serviceId && isLoading && <p className="text-sm text-muted-foreground">Loading slots…</p>}

        {serviceId && !isLoading && slots.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">No available slots for this date.</p>
        )}

        {slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <Button
                key={slot.start}
                variant="outline"
                disabled={bookingStart === slot.start}
                onClick={() => handleBookSlot(slot)}
              >
                {bookingStart === slot.start ? '…' : formatTime(slot.start)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
