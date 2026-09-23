"use client";
import BookingSummaryCard from "@/components/layout/BookingSummaryCard";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { durationFormatter, moneyFormatter } from "@/lib/format";
import { convertMinutesToTime, convertToSelectFormat, isoStringToWallTime } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import { Button } from "@base-ui/react";
import type { AvailabilityResponse } from "@slotbook/shared";
import type { FacilityDataForBookingResponse } from "@slotbook/shared";
import { MapPinIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [slots, setSlots] = useState<AvailabilityResponse | null>();

  const [selection, setSelection] = useState({
    staff: initialStaff,
    service: initialService,
    date: initialDate,
    slot: initialTime ? { start: initialTime, end: "" } : null,
  });
  const [error, setError] = useState<string | null>(null);
  const handleReset = () => {
    setSelection({
      staff: null,
      date: null,
      slot: null,
      service: null,
    });
  };
  const handleSelectStaff = (staffId: string | null) => {
    setSelection({
      ...selection,
      staff: staffId,
      date: null,
      slot: null,
    });
  };
  const handleSelectService = (serviceId: string | null) => {
    setSelection({
      ...selection,
      service: serviceId,
      date: null,
      slot: null,
    });
  };
  const handleSelectDate = (date: string) => {
    setSelection({
      ...selection,

      date: date,
      slot: null,
    });
  };
  const handleSelectSlotTime = (start: string, end: string) => {
    setSelection({
      ...selection,
      slot: { start, end },
    });
  };
  const { id, name, services, staff, reviewsCount, city, address, score , timezone} = bookingData;
  const selectedServiceData = services.find((service) => service.id === selection.service);
  useEffect(() => {
    if (!selection.staff || !selection.service) {
      setSlots(null);
      return;
    }
    let ignore = false;

    getAvailability(id, { staffId: selection.staff, serviceId: selection.service })
      .then((res) => {
        if (!ignore) setSlots(res);
      })
      .finally(() => {
        // if (!ignore) setIsLoadingSlots(false);
      });
    return () => {
      ignore = true;
    };
  }, [id, selection.staff, selection.service]);

  async function handleBookSlot(startTime: Date, staffId: string, serviceId: string) {
    try {
      await createBooking(id, {
        staffMemberId: staffId,
        serviceId: serviceId,
        startsAt: startTime,
      });
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      console.log(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
    }
  }
  const allowedServiceIds = useMemo(() => {
    const staffId = selection.staff;
    if (!staffId) return null;

    const ids = new Set<string>();
    for (const service of services) {
      if (service.staffMemberIds.includes(staffId)) {
        ids.add(service.id);
      }
    }

    return ids;
  }, [selection.staff, services]);
  const allowedStaffIds = useMemo(() => {
    if (!selection.service) return null;
    const service = services.find((s) => s.id === selection.service);
    return service ? new Set(service.staffMemberIds) : null;
  }, [selection.service, services]);

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
  const selectedDaySlots = slots?.days.find((d) => d.date === selection.date)?.slots ?? [];
  return (
    <div className="">
      <BreadCrumbs />
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
            <Select items={staffOptions} value={selection.staff} onValueChange={handleSelectStaff}>
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
              value={selection.service}
              onValueChange={handleSelectService}
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
                    const isSelected = day.date === selection.date;
                    const isDisabled = day.slots.length === 0;
                    return (
                      <Button
                        key={day.date}
                        disabled={isDisabled}
                        onClick={() => {
                          handleSelectDate(day.date);
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
                      const startTimeIso = slot.startsAt.toISOString();
                      const endTimeIso = slot.endsAt.toISOString();
                      const isSelected = startTimeIso === selection.slot?.start;
                      return (
                        <button
                          key={startTimeIso}

                          onClick={() => {
                            handleSelectSlotTime(startTimeIso, endTimeIso);
                          }}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                          }`}
                        >
                          {`${isoStringToWallTime(startTimeIso, timezone)} - ${isoStringToWallTime(endTimeIso, timezone)}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {error && <div className="text-red-400">Error happen: {error}</div>}
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
            date={
              selection.date ? new Date(selection.date).toLocaleDateString() : "Select something"
            }
            time={
              selection.slot
                ? `${isoStringToWallTime(selection.slot.start)} - ${isoStringToWallTime(selection.slot.end)}`
                : "Select something"
            }
            price={
              selectedServiceData
                ? moneyFormatter(selectedServiceData.priceCents, selectedServiceData.currency)
                : "-"
            }
            onConfirm={() => {
              if (selection.slot && selection.staff && selection.service) {
                handleBookSlot(selection.slot.start, selection.staff, selection.service);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BookForm;
