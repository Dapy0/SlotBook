import { convertRawResponseFacilitySchedule } from "@/lib/utils";
import type { ResponseFacilityScheduleSchema } from "@slotbook/shared/facilitySchedule";

function WorkingHours({ hours }: { hours: ResponseFacilityScheduleSchema[] }) {
  // const hours = [
  //   { day: 'Mon — Fri', time: '09:00 — 18:00' },
  //   { day: 'Sat', time: '10:00 — 16:00' },
  //   { day: 'Sun', time: 'Closed', muted: true },
  // ];
  if (hours.length === 0) {
    return (
      <div className="w-full max-w-xs rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-center text-xs font-semibold tracking-wide text-gray-700 uppercase">
          No Working Hours
        </p>
      </div>
    );
  }
  const schedule = convertRawResponseFacilitySchedule(hours);
  return (
    <div className="w-full max-w-xs rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Business Hours</p>

      <div className="mt-3 flex flex-col divide-y divide-gray-100">
        {schedule.map((row) => (
          <div key={row.dayOfTheWeek} className="flex items-center justify-between py-2.5 text-sm">
            <span className="self-start text-teal-600">{row.dayOfTheWeek}</span>
            <span
              className={`flex flex-col gap-0.5 ${row.timeIntervals.length === 0 ? "text-gray-400" : "font-medium text-gray-900"}`}
            >
              {row.timeIntervals.length === 0
                ? "Closed"
                : row.timeIntervals.map((interval) => (
                    <span key={hours[0].facilityId + interval}>{interval}</span>
                  ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkingHours;
