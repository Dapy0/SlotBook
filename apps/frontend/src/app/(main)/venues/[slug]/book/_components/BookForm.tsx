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
import { durationFormatter, moneyFormatter } from "@/lib/format";
import { convertMinutesToTime, convertToSelectFormat } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import type { AvailabilitySlot } from "@slotbook/shared/availability";
import type { FacilityDataForBookingResponse, FacilityResponse } from "@slotbook/shared/facility";
import type { FacilityScheduleResponse } from "@slotbook/shared/facilitySchedule";
import type { ServiceResponseDTO } from "@slotbook/shared/service";
import type { StaffMemberResponseDTO } from "@slotbook/shared/staffMembers";
import { MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  bookingData,
  initialService,
  initialStaff,
  initialDate,
  initialTime,
}: {
  bookingData: FacilityDataForBookingResponse;
  initialService: string | null;
  initialStaff: string | null;
  initialDate: string | null;
  initialTime: string | null;
}) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(initialStaff);
  const [selectedService, setSelectedService] = useState<string | null>(initialService);
  const [selectedDay, setSelectedDay] = useState<string | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  // const fetchSlots = useCallback(() => {
  //   if (!selectedStaff || !selectedDay) {
  //     setSlots([]);
  //     return;
  //   }
  //   setIsLoadingSlots(true);

  //   getAvailability(facility.id, selectedStaff, service.id, selectedDay)
  //     .then(setSlots)
  //     .catch((err) => {
  //       setSlots([]);
  //       setIsLoadingSlots(false);
  //     })
  //     .finally(() => setIsLoadingSlots(false));
  // }, [selectedStaff, selectedDay, facility, service]);

  // useEffect(() => {
  //   fetchSlots();
  // }, [fetchSlots]);

  // async function handleBookSlot(startTime: string, staffMemberId: string, serviceId: string) {
  //   try {
  //     await createBooking(facility.id, {
  //       staffMemberId,
  //       serviceId,
  //       startDatetime: startTime,
  //     });

  //     fetchSlots();
  //   } catch (err) {
  //     console.log(err instanceof Error ? err.message : "Failed to create booking");
  //   } finally {
  //     setSelectedTime(null);
  //   }
  // }
  const { name, services, staff, reviewsCount, city, address, score } = bookingData;
  const allowedServiceIds = useMemo(() => {
    if (!selectedStaff) {
      return null;
    }
    return new Set(
      services.filter((service) => service.staffMemberIds.includes(selectedStaff)).map((s) => s.id),
    );
  }, [selectedStaff, services]);
  const allowedStaffIds = useMemo(() => {
    if (!selectedService) return null;
    const service = services.find((s) => s.id === selectedService);
    return service ? new Set(service.staffMemberIds) : null;
  }, [selectedService, services]);

  const staffOptions = useMemo(
    () => [
      { label: "Any staff member", value: null },
      ...convertToSelectFormat(staff, "name", "id"),
    ],
    [staff],
  );
  const serviceOptions = useMemo(
    () => [{ label: "Any service", value: null }, ...convertToSelectFormat(services, "name", "id")],
    [services],
  );

  return (
    <div>
      <BreadCrumbs crumbsList={["categories", "hair", "Padel Club", "Booking"]} />
      <div className="flex gap-10">
        <div className="flex flex-col gap-6">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-sm text-gray-600">
                <MapPinIcon size={13} />
                {city} · {address}
              </span>
              {/* <span className="text-sm text-gray-600">4.7 km</span> */}
            </div>
          </header>
          {/* Staff select */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Select Staff</p>
            <Select items={staffOptions} value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-full max-w-72">
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {staffOptions.map((staffMember) => (
                  <SelectItem
                    key={staffMember.label}
                    value={staffMember.value}
                    disabled={
                      staffMember.value !== null &&
                      allowedStaffIds !== null &&
                      !allowedStaffIds.has(staffMember.value)
                    }
                  >
                    {staffMember.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Service Select */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Select Service</p>
            <Select
              items={serviceOptions}
              value={selectedService}
              defaultValue={null}
              onValueChange={setSelectedService}
            >
              <SelectTrigger className="w-full max-w-72">
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {serviceOptions.map((service) => (
                  <SelectItem
                    key={service.label}
                    value={service.value}
                    disabled={
                      service.value !== null &&
                      allowedServiceIds !== null &&
                      !allowedServiceIds.has(service.value)
                    }
                  >
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Date picker */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Select Date</p>

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
            <p className="mt-2 text-xs font-light tracking-wide text-gray-400 uppercase">
              Booking open for the next 30 days
            </p>
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
          {/* <BookingSummaryCard
            businessName={name}
            city={city}
            address={address}
            score={score}
            reviewsCount={reviewsCount}
            service={selectedService ?? ''}
            duration={durationFormatter.format({
              hours: convertMinutesToTime(service.durationMinutes)[0],
              minutes: convertMinutesToTime(service.durationMinutes)[1],
            })}
            date={
              (selectedDay && new Date(selectedDay)?.toLocaleDateString("pl-PL")) ||
              "Select something"
            }
            time={(selectedTime && formatTime(selectedTime)) || "Select something"}
            price={moneyFormatter(service.priceCents, service.currency)}
            onConfirm={() => {
              if (selectedTime && selectedStaff) {
                handleBookSlot(selectedTime, selectedStaff, service.id);
              }
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default BookForm;
