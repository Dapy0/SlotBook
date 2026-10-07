import type { FacilityScheduleEntryResponse } from "@slotbook/shared";

function convertRawResponseFacilitySchedule(rawSchema: FacilityScheduleEntryResponse[]): Array<{
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

function WorkingHours({ hours }: { hours: FacilityScheduleEntryResponse[] }) {
  const schedule = convertRawResponseFacilitySchedule(hours);
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-sans text-sm font-semibold">Opening hours</h2>
      {schedule.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          This venue hasn&apos;t published its hours yet.
        </p>
      ) : (
        <dl className="mt-2 flex flex-col divide-y divide-border">
          {schedule.map((row) => (
            <div key={row.dayOfTheWeek} className="flex items-start justify-between gap-3 py-2 text-sm">
              <dt className="text-muted-foreground">{row.dayOfTheWeek}</dt>
              <dd className="nums flex flex-col items-end gap-0.5 font-medium">
                {row.timeIntervals.length === 0
                  ? <span className="text-muted-foreground">Closed</span>
                  : row.timeIntervals.map((interval) => <span key={interval}>{interval}</span>)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default WorkingHours;
