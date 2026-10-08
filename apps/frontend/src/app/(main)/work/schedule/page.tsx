import { getStaffMe } from "@/services/staffMe.server";
import { moneyFormatterFromCents } from "@/lib/format";
import { formatDayShifts, WEEKDAYS } from "@/lib/schedule";

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default async function WorkSchedulePage() {
  const staffMe = await getStaffMe();
  const { facility, schedule, facilitySchedule, services } = staffMe;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Weekly schedule</h2>
          <p className="text-sm text-gray-500">
            Times are in the venue time zone ({facility.timezone}).
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-2 font-medium">Day</th>
                <th className="px-4 py-2 font-medium">Your hours</th>
                <th className="px-4 py-2 font-medium">Venue hours</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {WEEKDAYS.map((day) => {
                const mine = formatDayShifts(schedule, day.value);
                const venue = formatDayShifts(facilitySchedule, day.value);
                return (
                  <tr key={day.value}>
                    <td className="px-4 py-2 font-medium text-gray-900">{day.label}</td>
                    <td
                      className={`px-4 py-2 ${mine ? "font-mono text-gray-900" : "text-gray-400"}`}
                    >
                      {mine ?? "Day off"}
                    </td>
                    <td
                      className={`px-4 py-2 ${venue ? "font-mono text-gray-700" : "text-gray-400"}`}
                    >
                      {venue ?? "Closed"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="rounded-lg border border-dashed bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Want to change your hours? Schedule requests are coming soon.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-gray-900">My services</h2>
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-gray-500">
            No services assigned yet. Ask the venue owner to add them.
          </div>
        ) : (
          <ul className="divide-y rounded-xl border bg-white">
            {services.map((s) => (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  s.isActive ? "" : "opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-gray-900">
                    <span className="truncate">{s.name}</span>
                    {!s.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                        Hidden by venue
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{formatMinutes(s.durationMinutes)}</p>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {moneyFormatterFromCents(s.priceCents, facility.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
