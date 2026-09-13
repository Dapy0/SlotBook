"use client";
import BookingSummaryCard from "@/components/layout/BookingSummaryCard";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertMinutesToTime, formatMoney } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import type { AvailabilitySlot } from "@slotbook/shared/availability";
import type { FacilityResponse } from "@slotbook/shared/facility";
import type { ResponseFacilityScheduleSchema } from "@slotbook/shared/facilitySchedule";
import type { ServiceResponseDTO } from "@slotbook/shared/service";
import type { StaffMemberResponseDTO } from "@slotbook/shared/staffMembers";
import { useCallback, useEffect, useState } from "react";
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDaysFromWithSchedule(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      key: date.toLocaleDateString("sv-SE"),
      weekday: weekdayShort[date.getDay()],
      day: date.getDate(),
    };
  });
}
const days = buildDaysFromWithSchedule(30);
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function BookForm({
  facility,
  service,
  staffMembers,
  initialStaff,
  initialDate,
  initialTime,
}: {
  facility: FacilityResponse & {
    facilitySchedule: ResponseFacilityScheduleSchema[];
  };
  staffMembers: StaffMemberResponseDTO[];
  service: ServiceResponseDTO;
  initialStaff: string | null;
  initialDate: string | null;
  initialTime: string | null;
}) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(initialStaff);
  const [selectedDay, setSelectedDay] = useState<string | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const fetchSlots = useCallback(() => {
    if (!selectedStaff || !selectedDay) {
      setSlots([]);
      return;
    }
    setIsLoadingSlots(true);

    getAvailability(facility.id, selectedStaff, service.id, selectedDay)
      .then(setSlots)
      .catch((err) => {
        setSlots([]);
        setIsLoadingSlots(false);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedStaff, selectedDay, facility, service]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  async function handleBookSlot(startTime: string, staffMemberId: string, serviceId: string) {
    try {
      await createBooking(facility.id, {
        staffMemberId,
        serviceId,
        startDatetime: startTime,
      });

      fetchSlots();
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSelectedTime(null);
    }
  }
  // const availableCount = timeSlots.filter((s) => s.available).length;
  const formatter = new Intl.DurationFormat("en", { style: "narrow" });
  return (
    <div>
      <BreadCrumbs crumbsList={["categories", "hair", "Padel Club", "Booking"]} />
      <div className="flex gap-10">
        <div className="flex flex-col gap-6">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {facility.name} ·{" "}
              {formatter.format({
                hours: convertMinutesToTime(service.durationMinutes)[0],
                minutes: convertMinutesToTime(service.durationMinutes)[1],
              })}{" "}
              · {formatMoney(service.priceCents, service.currency)}
            </p>
          </header>

          {/* Staff select */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Staff member</p>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-full max-w-72">
                <SelectValue placeholder="Select a staff member">
                  {staffMembers.find((staffMember) => staffMember.id === selectedStaff)?.name ||
                    "Select a staff member"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {staffMembers.map((staffMember) => (
                    <SelectItem key={staffMember.name} value={staffMember.id}>
                      {staffMember.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Date picker */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Date · Booking open for the next 30 days
            </p>
            <div className="flex max-w-2xl gap-2 overflow-x-scroll pb-1">
              {days.map((d) => {
                const isSelected = d.key === selectedDay;
                return (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDay(d.key)}
                    className={`flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium uppercase ${
                        isSelected ? "text-orange-100" : "text-gray-400"
                      }`}
                    >
                      {d.weekday}
                    </span>
                    <span className="text-base font-semibold">{d.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {isLoadingSlots ? (
            <h1>Select staff and day first</h1>
          ) : slots.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Available time
                </p>
                <p className="text-xs text-gray-400">
                  {slots.length} of {30} available
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isSelected = slot.start === selectedTime;
                  return (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedTime(slot.start)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {formatTime(slot.start)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Booked slots are unavailable. Booking closes one hour before the start time.
              </p>
            </div>
          ) : (
            <h1>Staff isnt working this day</h1>
          )}
        </div>
        <div className="w-72 shrink-0">
          <BookingSummaryCard
            businessName={facility.name}
            city={facility.city}
            address={facility.address}
            score={facility.score}
            reviewsCount={facility.reviewsCount}
            service={service.name}
            duration={formatter.format({
              hours: convertMinutesToTime(service.durationMinutes)[0],
              minutes: convertMinutesToTime(service.durationMinutes)[1],
            })}
            date={
              (selectedDay && new Date(selectedDay)?.toLocaleDateString("pl-PL")) ||
              "Select something"
            }
            time={(selectedTime && formatTime(selectedTime)) || "Select something"}
            price={formatMoney(service.priceCents, service.currency)}
            onConfirm={() => {
              if (selectedTime && selectedStaff) {
                handleBookSlot(selectedTime, selectedStaff, service.id);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BookForm;
