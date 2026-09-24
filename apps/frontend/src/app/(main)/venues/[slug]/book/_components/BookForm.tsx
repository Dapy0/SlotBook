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
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { durationFormatter, moneyFormatter } from "@/lib/format";
import { convertMinutesToTime, convertToSelectFormat, isoStringToWallTime } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import { Button } from "@base-ui/react";
import type { AvailabilityResponse } from "@slotbook/shared";
import type { FacilityDataForBookingResponse } from "@slotbook/shared";
import { MapPinIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Slot = AvailabilityResponse["days"][number]["slots"][number];
type Selection = {
  staff: string | null;
  service: string | null;
  date: string | null;
  slot: Slot | null;
};
function parseCalendarDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return { day: d.getUTCDate(), weekday: d.getUTCDay() };
}

function formatCalendarDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: "UTC" });
}
function formatWallTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
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
  const router = useRouter();
  const pathName = usePathname();
  const { id, name, services, staff, reviewsCount, city, address, score, timezone } = bookingData;

  const [selection, setSelection] = useState<Selection>({
    staff: initialStaff,
    service: initialService,
    date: initialDate,
    slot: null,
  });

  const [availability, setAvailability] = useState<{
    key: string;
    data: AvailabilityResponse;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const pendingInitialTime = useRef(initialTime);

  const requestKey =
    selection.staff && selection.service ? `${selection.staff}:${selection.service}` : null;
  const slots = availability?.key === requestKey ? availability.data : null;
  const isLoadingSlots = requestKey !== null && slots === null;
  const selectedDaySlots = slots?.days.find((d) => d.date === selection.date);
  console.log(selectedDaySlots);
  const hasAnySlots = slots?.days.some((d) => d.slots.length > 0) ?? false;
  const selectedServiceData = services.find((s) => s.id === selection.service);
  useEffect(() => {
    if (!selection.staff || !selection.service) return;
    const key = `${selection.staff}:${selection.service}`;
    let ignore = false;

    getAvailability(id, { staffId: selection.staff, serviceId: selection.service })
      .then((data) => {
        if (ignore) return;
        setAvailability({ key, data });

        const time = pendingInitialTime.current;
        if (time) {
          pendingInitialTime.current = null;
          setSelection((prev: any) => {
            const day = data.days.find((d) => d.date === prev.date);
            const slot = day?.slots.find((s) => formatWallTime(s.startsAt, timezone) === time);
            return { ...prev, slot: slot ?? null };
          });
        }
      })
      .catch(() => {
        if (!ignore) setError("Could not load available time");
      });

    return () => {
      ignore = true;
    };
  }, [id, selection.staff, selection.service, reloadToken, timezone]);
  const handleSelectStaff = (staffId: string | null) =>
    setSelection((prev) => ({ ...prev, staff: staffId, date: null, slot: null }));

  const handleSelectService = (serviceId: string | null) =>
    setSelection((prev) => ({ ...prev, service: serviceId, date: null, slot: null }));

  const handleSelectDate = (date: string) =>
    setSelection((prev) => ({ ...prev, date, slot: null }));

  const handleSelectSlot = (slot: Slot) => setSelection((prev: Selection) => ({ ...prev, slot }));

  async function handleConfirm() {
    const { staff: staffId, service: serviceId, slot } = selection;
    if (!staffId || !serviceId || !slot || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking(id, {
        staffMemberId: staffId,
        serviceId,
        startsAt: slot.startsAt,
      });
      toast.add({ title: "Booking created! Waiting for confirmation." });
      router.push(`/account/appointments?booked=${booking.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathName)}`);
        return;
      }
      if (err instanceof ApiError && err.status === 409) {
        setError("This time was just taken. Please choose another one.");
        setSelection((prev) => ({ ...prev, slot: null }));
        setReloadToken((t) => t + 1);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  }
  const allowedServiceIds = useMemo(() => {
    if (!selection.staff) return null;
    return new Set(
      services.filter((s) => s.staffMemberIds.includes(selection.staff!)).map((s) => s.id),
    );
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
                {staffOptions.map((option) => (
                  <SelectItem
                    key={option.value ?? "any"}
                    value={option.value}
                    disabled={
                      option.value !== null &&
                      allowedStaffIds !== null &&
                      !allowedStaffIds.has(option.value)
                    }
                  >
                    {option.label}
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
                {serviceOptions.map((option) => (
                  <SelectItem
                    key={option.value ?? "any"}
                    value={option.value}
                    disabled={
                      option.value !== null &&
                      allowedServiceIds !== null &&
                      !allowedServiceIds.has(option.value)
                    }
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Date picker */}
          {requestKey === null ? (
            <p className="text-sm text-gray-500">Select staff and service first</p>
          ) : isLoadingSlots ? (
            <p className="text-sm text-gray-500">Loading available time…</p>
          ) : !hasAnySlots ? (
            <p className="text-sm text-gray-500">No free time in the next 30 days</p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Select Date</p>
                <div className="flex max-w-2xl gap-2 overflow-x-auto pb-1">
                  {slots!.days.map((day) => {
                    const { day: dayOfMonth, weekday } = parseCalendarDate(day.date);
                    const isSelected = day.date === selection.date;
                    const isDisabled = day.slots.length === 0;
                    return (
                      <Button
                        key={day.date}
                        disabled={isDisabled}
                        onClick={() => handleSelectDate(day.date)}
                        className={`flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                        } ${isDisabled ? "border-gray-100! bg-gray-100! text-gray-400!" : ""}`}
                      >
                        <span
                          className={`text-[11px] font-medium uppercase ${
                            isSelected ? "text-orange-100" : "text-gray-400"
                          }`}
                        >
                          {dayOfMonth}
                        </span>
                        <span className="text-md font-medium">{weekdayShort[weekday]}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs font-light tracking-wide text-gray-400 uppercase">
                  Booking open for the next 30 days · times in {timezone}
                </p>
              </div>

              {selectedDaySlots && (
                <div className="flex flex-wrap gap-2">
                  {selectedDaySlots.slots.map((slot) => {
                    const key = selectedDaySlots.date + slot.startsAt.toISOString();
                    const isSelected =
                      selection.slot?.startsAt.getTime() === slot.startsAt.getTime();
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                        }`}
                      >
                        {formatWallTime(slot.startsAt, timezone)} –{" "}
                        {formatWallTime(slot.endsAt, timezone)}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {isBooked && (
            <div className="text-green-600">Booking created! Waiting for confirmation.</div>
          )}
          {error && <div className="text-red-500">{error}</div>}
        </div>

        <div className="w-72 shrink-0">
          <BookingSummaryCard
            businessName={name}
            city={city}
            address={address}
            score={score}
            reviewsCount={reviewsCount}
            service={selectedServiceData?.name ?? "Select something"}
            duration={
              selectedServiceData
                ? durationFormatter.format({
                    hours: convertMinutesToTime(selectedServiceData.durationMinutes)[0],
                    minutes: convertMinutesToTime(selectedServiceData.durationMinutes)[1],
                  })
                : "Select something"
            }
            date={selection.date ? formatCalendarDate(selection.date) : "Select something"}
            time={
              selection.slot
                ? `${formatWallTime(selection.slot.startsAt, timezone)} – ${formatWallTime(selection.slot.endsAt, timezone)}`
                : "Select something"
            }
            price={
              selectedServiceData
                ? moneyFormatter(selectedServiceData.priceCents, selectedServiceData.currency)
                : "-"
            }
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}

export default BookForm;
