import {
  daysAndThereNames,
  type FacilityScheduleResponse,
} from "@slotbook/shared/facilitySchedule";

export function convertRawResponseFacilitySchedule(rawSchema: FacilityScheduleResponse[]): Array<{
  dayOfTheWeek: string;
  timeIntervals: Array<string>;
}> {
  const grouped = Object.groupBy(rawSchema, ({ dayOfTheWeek }) => dayOfTheWeek);

  const weekdayFmt = new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" });
  const MONDAY = Date.UTC(2024, 0, 1);

  const dayName = (dow: number) => weekdayFmt.format(MONDAY + ((dow + 6) % 7) * 86400000);

  const dateTimeFormat = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const final = [];
  for (const [name, values] of Object.entries(grouped)) {
    const temp: {
      dayOfTheWeek: string;
      timeIntervals: Array<string>;
    } = {
      dayOfTheWeek: dayName(Number(name)),
      timeIntervals: [],
    };

    for (let i = 0; i < values.length; i++) {
      const res = dateTimeFormat.formatRange(
        new Date(`1970-01-01T${values[i].startTime}`),
        new Date(`1970-01-01T${values[i].endTime}`),
      );
      temp.timeIntervals.push(res);
    }
    final.push(temp);
  }

  return final;
}

function WorkingHours({ hours }: { hours: FacilityScheduleResponse[] }) {
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
