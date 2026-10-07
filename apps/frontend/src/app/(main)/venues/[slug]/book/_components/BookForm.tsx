"use client";
import BookingSummaryCard, { confirmLabel } from "@/components/layout/BookingSummaryCard";
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
import { durationFormatter, moneyFormatterFromCents } from "@/lib/format";
import { cn, convertMinutesToTime, convertToSelectFormat } from "@/lib/utils";
import { getAvailability } from "@/services/availability";
import { createBooking } from "@/services/booking";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/authContext";
import { createParams } from "@/lib/queryStrings";
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
  return { day: d.getUTCDate(), weekday: d.getUTCDay(), month: d.getUTCMonth() };
}

function formatCalendarDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function monthName(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    month: "long",
  });
}

// Groups a day's slots so a long list reads like an appointment book: morning, afternoon, evening.
function groupSlotsByPartOfDay(slots: Slot[], timeZone: string) {
  const parts = [
    { label: "Morning", slots: [] as Slot[] },
    { label: "Afternoon", slots: [] as Slot[] },
    { label: "Evening", slots: [] as Slot[] },
  ];
  for (const slot of slots) {
    const hour = Number(formatWallTime(slot.startsAt, timeZone).slice(0, 2));
    parts[hour < 12 ? 0 : hour < 17 ? 1 : 2].slots.push(slot);
  }
  return parts.filter((part) => part.slots.length > 0);
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
  const { me, isLoading: isAuthLoading } = useAuth();
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
        // Keep the whole selection in the return URL so nothing is lost after login.
        const back = `${pathName}?${createParams({
          service: serviceId,
          staff: staffId,
          date: selection.date,
          time: formatWallTime(slot.startsAt, timezone),
        })}`;
        router.push(`/login?next=${encodeURIComponent(back)}`);
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
      { label: "Choose a staff member", value: null },
      ...convertToSelectFormat(staff, "name", "id"),
    ],
    [staff],
  );
  const serviceOptions = useMemo(
    () => [
      { label: "Choose a service", value: null },
      ...convertToSelectFormat(services, "name", "id"),
    ],
    [services],
  );

  const slotGroups = useMemo(
    () => (selectedDaySlots ? groupSlotsByPartOfDay(selectedDaySlots.slots, timezone) : []),
    [selectedDaySlots, timezone],
  );

  const summaryTime = selection.slot
    ? `${formatWallTime(selection.slot.startsAt, timezone)} – ${formatWallTime(selection.slot.endsAt, timezone)}`
    : null;
  const summaryDuration = selectedServiceData
    ? durationFormatter.format({
        hours: convertMinutesToTime(selectedServiceData.durationMinutes)[0],
        minutes: convertMinutesToTime(selectedServiceData.durationMinutes)[1],
      })
    : null;
  const summaryPrice = selectedServiceData
    ? moneyFormatterFromCents(selectedServiceData.priceCents, selectedServiceData.currency)
    : null;
  const canConfirm = Boolean(selection.staff && selection.service && selection.slot);
  const needsLogin = !isAuthLoading && !me;

  return (
    <div className="pb-28 lg:pb-0">
      <BreadCrumbs />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Book at {name}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon aria-hidden className="size-3.5" />
              {city} · {address}
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <StepLabel step={1} htmlFor="book-service">
                Service
              </StepLabel>
              <Select
                items={serviceOptions}
                value={selection.service}
                onValueChange={handleSelectService}
              >
                <SelectTrigger id="book-service" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {serviceOptions.map((option) => (
                    <SelectItem
                      key={option.value ?? "none"}
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
            <div className="flex flex-col gap-2">
              <StepLabel step={2} htmlFor="book-staff">
                Staff member
              </StepLabel>
              <Select items={staffOptions} value={selection.staff} onValueChange={handleSelectStaff}>
                <SelectTrigger id="book-staff" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {staffOptions.map((option) => (
                    <SelectItem
                      key={option.value ?? "none"}
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
          </section>

          <section aria-labelledby="book-time-heading" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="book-time-heading" className="font-sans">
                <StepLabel step={3}>Date and time</StepLabel>
              </h2>
              <p className="text-sm text-muted-foreground">
                Open for the next 30 days. Times are in the venue&apos;s time zone ({timezone}).
              </p>
            </div>

            {requestKey === null ? (
              <EmptyNote>Choose a service and a staff member to see their free times.</EmptyNote>
            ) : isLoadingSlots ? (
              <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
                <span className="sr-only">Loading free times…</span>
                <div className="flex gap-2 overflow-hidden pt-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-18 w-14 shrink-0 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full max-w-md rounded-full" />
              </div>
            ) : !hasAnySlots ? (
              <EmptyNote>
                No free time with this staff member in the next 30 days. Try another staff member.
              </EmptyNote>
            ) : (
              <>
                <div
                  role="group"
                  aria-label="Date"
                  className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pt-6 pb-2 md:mx-0 md:px-0"
                >
                  {slots!.days.map((day, index) => {
                    const { day: dayOfMonth, weekday, month } = parseCalendarDate(day.date);
                    const prevMonth =
                      index > 0 ? parseCalendarDate(slots!.days[index - 1].date).month : null;
                    const isSelected = day.date === selection.date;
                    const isDisabled = day.slots.length === 0;
                    return (
                      <div key={day.date} className="relative shrink-0 snap-start">
                        {month !== prevMonth && (
                          <span className="absolute -top-6 left-0 text-xs font-semibold whitespace-nowrap text-muted-foreground">
                            {monthName(day.date)}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          aria-label={formatCalendarDate(day.date)}
                          onClick={() => handleSelectDate(day.date)}
                          className={cn(
                            "flex h-18 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-[color-mix(in_oklch,var(--primary),var(--border)_30%)] hover:bg-accent",
                            isDisabled &&
                              "cursor-not-allowed border-transparent bg-muted text-muted-foreground/60 hover:border-transparent hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
                            )}
                          >
                            {weekdayShort[weekday]}
                          </span>
                          <span className="nums font-heading text-xl leading-none font-bold">
                            {dayOfMonth}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!selectedDaySlots ? (
                  <EmptyNote>Pick a day to see the free times.</EmptyNote>
                ) : (
                  <div className="flex flex-col gap-5">
                    {slotGroups.map((group) => (
                      <div key={group.label} className="flex flex-col gap-2">
                        <h3 className="font-sans text-sm font-semibold text-muted-foreground">
                          {group.label}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {group.slots.map((slot) => {
                            const isSelected =
                              selection.slot?.startsAt.getTime() === slot.startsAt.getTime();
                            const start = formatWallTime(slot.startsAt, timezone);
                            const end = formatWallTime(slot.endsAt, timezone);
                            return (
                              <button
                                key={slot.startsAt.toISOString()}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={`${start} to ${end}`}
                                onClick={() => handleSelectSlot(slot)}
                                className={cn(
                                  "nums h-10 min-w-20 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card hover:border-[color-mix(in_oklch,var(--primary),var(--border)_30%)] hover:bg-accent",
                                )}
                              >
                                {start}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {isBooked && (
            <p role="status" className="text-success">
              Booking created. Waiting for the venue to confirm.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <BookingSummaryCard
          className="lg:sticky lg:top-6"
          businessName={name}
          city={city}
          address={address}
          score={score}
          reviewsCount={reviewsCount}
          service={selectedServiceData?.name ?? null}
          duration={summaryDuration}
          date={selection.date ? formatCalendarDate(selection.date) : null}
          time={summaryTime}
          price={summaryPrice}
          canConfirm={canConfirm}
          isSubmitting={isSubmitting}
          needsLogin={needsLogin}
          onConfirm={handleConfirm}
        />
      </div>

      {/* Thumb-reach confirm bar on phones; the full summary sits below the form. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{selectedServiceData?.name ?? "No service yet"}</p>
            <p className="nums truncate text-muted-foreground">
              {selection.date && summaryTime
                ? `${formatCalendarDate(selection.date)} · ${summaryTime}`
                : "Pick a date and time"}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
            aria-busy={isSubmitting}
            className="shrink-0"
          >
            {isSubmitting && <Spinner />}
            {confirmLabel(summaryTime, isSubmitting)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepLabel({
  step,
  htmlFor,
  children,
}: {
  step: number;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className="nums flex size-5 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground"
      >
        {step}
      </span>
      {children}
    </>
  );
  const className = "flex items-center gap-2 text-sm font-semibold";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {content}
    </label>
  ) : (
    <span className={className}>{content}</span>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export default BookForm;
