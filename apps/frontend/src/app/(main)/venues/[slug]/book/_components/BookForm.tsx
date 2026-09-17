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
import { convertMinutesToTime, convertToSelectFormat, isoStringToWallTime } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import { Button } from "@base-ui/react";
import type { AvailabilityResponse, AvailabilitySlot } from "@slotbook/shared/availability";
import type { FacilityDataForBookingResponse, FacilityResponse } from "@slotbook/shared/facility";
import type { FacilityScheduleResponse } from "@slotbook/shared/facilitySchedule";
import type { ServiceResponseDTO } from "@slotbook/shared/service";
import type { StaffMemberResponseDTO } from "@slotbook/shared/staffMembers";
import { MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(initialTime);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>();
  const [slots, setSlots] = useState<AvailabilityResponse | null>();
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { id, name, services, staff, reviewsCount, city, address, score } = bookingData;
  const selectedServiceData = services.find((service) => service.id === selectedService);

  const fetchSlots = useCallback(() => {
    if (!selectedStaff || !selectedService) {
      setSlots(null);
      return;
    }
    setIsLoadingSlots(true);

    getAvailability(id, selectedStaff, selectedService)
      .then(setSlots)
      .finally(() => setIsLoadingSlots(false));
  }, [selectedStaff, selectedService]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

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
  const selectedDaySlots = slots?.days.find((d) => d.date === selectedDay)?.slots ?? [];
  return (
    <div className="">
      <BreadCrumbs crumbsList={["facilities", name , 'book']} />
      <div className="flex w-full justify-between gap-10">
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
          {!slots ? (
            <h1>Select staff and service first</h1>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Select Date</p>

                <div className="flex max-w-2xl gap-2 overflow-x-scroll pb-1">
                  {slots.days.map((day) => {
                    const isSelected = day.date === selectedDay;
                    const isDisabled = day.slots.length === 0;
                    return (
                      <Button
                        key={day.date}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDay(day.date);
                          setSelectedStartTime(null);
                          setSelectedEndTime(null);
                        }}
                        className={`flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                        } ${isDisabled ? "border-gray-100! bg-gray-100! text-gray-400!" : ""}`}
                      >
                        <span
                          className={`text-[11px] font-medium uppercase ${
                            isSelected ? "text-orange-100" : "text-gray-400"
                          } `}
                        >
                          {new Date(day.date).getDate()}
                        </span>
                        <span className="text-md font-medium">
                          {weekdayShort[new Date(day.date).getDay()]}
                        </span>
                      </Button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs font-light tracking-wide text-gray-400 uppercase">
                  Booking open for the next 30 days
                </p>
              </div>

              <div>
                {selectedDaySlots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDaySlots.map((slot) => {
                      const startTimeIso = slot.start.toISOString();
                      const endTimeIso = slot.end.toISOString();
                      const isSelected = startTimeIso === selectedStartTime;
                      return (
                        <button
                          key={startTimeIso}

                          onClick={() => {
                            setSelectedStartTime(startTimeIso);
                            setSelectedEndTime(endTimeIso);
                          }}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                          }`}
                        >
                          {`${isoStringToWallTime(startTimeIso)} - ${isoStringToWallTime(endTimeIso)}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="w-72 shrink-0">
          <BookingSummaryCard
            businessName={name}
            city={city}
            address={address}
            score={score}
            reviewsCount={reviewsCount}
            service={selectedServiceData ? selectedServiceData.name : "Select something"}
            duration={
              selectedServiceData
                ? durationFormatter.format({
                    hours: convertMinutesToTime(selectedServiceData?.durationMinutes)[0],
                    minutes: convertMinutesToTime(selectedServiceData?.durationMinutes)[1],
                  })
                : "Select something"
            }
            date={selectedDay ? new Date(selectedDay).toLocaleDateString() : "Select something"}
            time={
              selectedStartTime && selectedEndTime
                ? `${isoStringToWallTime(selectedStartTime)} - ${isoStringToWallTime(selectedEndTime)}`
                : "Select something"
            }
            price={
              selectedServiceData
                ? moneyFormatter(selectedServiceData.priceCents, selectedServiceData.currency)
                : "-"
            }
            onConfirm={() => {
              if (selectedStartTime && selectedStaff) {
                // handleBookSlot(selectedTime, selectedStaff, service.id);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BookForm;
