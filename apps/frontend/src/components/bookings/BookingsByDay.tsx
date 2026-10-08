import type { FacilityBookingResponse } from "@slotbook/shared";
import { BookingRow } from "@/components/bookings/BookingRow";

type Props = {
  bookings: FacilityBookingResponse[];
  timeZone: string;
  showStaff: boolean;
  emptyText?: string;
};

export function BookingsByDay({ bookings, timeZone, showStaff, emptyText = "No bookings" }: Props) {
  // TODO 5: сгруппировать по дню через groupByLocalDate(bookings, timeZone)
  const days: { date: string; bookings: FacilityBookingResponse[] }[] = [];

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-gray-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <section key={day.date} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            {/* TODO 6: formatCalendarDate(day.date, "EEEE, d MMM") */}
            {day.date} · {day.bookings.length}
          </h2>
          <div className="divide-y rounded-lg border bg-white">
            {day.bookings.map((b) => (
              <BookingRow key={b.id} booking={b} timeZone={timeZone} showStaff={showStaff} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
