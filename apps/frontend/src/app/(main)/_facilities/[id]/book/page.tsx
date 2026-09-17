"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStaffMembersByFacilityId } from "@/services/staff";
import { getServicesByFacilityId } from "@/services/service";
import { createBooking } from "@/services/booking";
import type { StaffMemberResponseDTO } from "@slotbook/shared/staffMembers";
import type { ServiceResponseDTO } from "@slotbook/shared/service";
import type { BookingResponse } from "@slotbook/shared/bookings";

export default function CreateBookingPage() {
  const { id } = useParams<{ id: string }>();

  const [staff, setStaff] = useState<StaffMemberResponseDTO[]>([]);
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [staffMemberId, setStaffMemberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startDatetime, setStartDatetime] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<BookingResponse | null>(null);

  useEffect(() => {
    getStaffMembersByFacilityId(id).then(setStaff);
    getServicesByFacilityId(id).then(setServices);
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);

    if (!staffMemberId || !serviceId || !startDatetime) {
      setError("Fill in all fields");
      return;
    }

    // datetime-local не содержит offset — берём offset текущего браузера
    const isoWithOffset = new Date(startDatetime).toISOString();

    setIsSubmitting(true);
    try {
      const booking = await createBooking(id, {
        staffMemberId,
        serviceId,
        startDatetime: isoWithOffset,
      });
      setCreated(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-heading text-3xl font-medium text-foreground">Book an Appointment</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label>Staff member</Label>
          <Select value={staffMemberId} onValueChange={(value) => setStaffMemberId(value ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  Staff — {s.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Service</Label>
          <Select value={serviceId} onValueChange={(value) => setServiceId(value ?? "")}>
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
          <Label htmlFor="startDatetime">Date & time</Label>
          <Input
            id="startDatetime"
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {created && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
            Booking created — status: {created.status}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Booking…" : "Book now"}
        </Button>
      </form>
    </div>
  );
}
