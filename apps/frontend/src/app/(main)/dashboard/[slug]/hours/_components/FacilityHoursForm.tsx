"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  changeWeekScheduleRequestSchema,
  weekdaySchema,
  type ChangeWeekScheduleRequest,
  type Weekday,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Input as TextInput } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { putFacilitySchedule } from "@/services/facilitySchedule";
import z from "zod";

const Form = "form"; // в проекте можно писать тег формы напрямую

const DAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];
const LAST_MINUTE = 23 * 60 + 59;

const toMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}:00`;

const dayLabel = (day: Weekday) => DAYS.find((d) => d.value === day)?.label ?? `Day ${day}`;

const scheduleConflictDetailsSchema = z.array(
  z.object({ staffMemberId: z.string(), dayOfTheWeek: weekdaySchema }),
);

const MAX_INTERVALS_PER_DAY = 3;

type Interval = { startTime: string; endTime: string };
type Week = Record<Weekday, Interval[]>;

type Props = {
  facilityId: string;
  initialEntries: ChangeWeekScheduleRequest;
};

function toWeek(entries: ChangeWeekScheduleRequest): Week {
  const grouped = Object.groupBy(entries, (e) => e.dayOfTheWeek);
  const week: Week = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

  for (const { value: day } of DAYS) {
    week[day] = (grouped[day] ?? [])
      .map(({ startTime, endTime }) => ({ startTime, endTime }))
      .toSorted((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return week;
}
function toEntries(week: Week): ChangeWeekScheduleRequest {
  return DAYS.flatMap(({ value: day }) =>
    week[day].map(({ startTime, endTime }) => ({ dayOfTheWeek: day, startTime, endTime })),
  );
}

export function FacilityHoursForm({ facilityId, initialEntries }: Props) {
  const router = useRouter();
  const [week, setWeek] = useState<Week>(() => toWeek(initialEntries));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function updateInterval(day: Weekday, index: number, patch: Partial<Interval>) {
    setSaved(false);
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].map((iv, i) => (i === index ? { ...iv, ...patch } : iv)),
    }));
  }

  function addInterval(day: Weekday) {
    setSaved(false);
    setError(null);
    const intervals = week[day];

    if (intervals.length === 0) {
      setWeek((prev) => ({ ...prev, [day]: [{ startTime: "09:00:00", endTime: "18:00:00" }] }));
      return;
    }

    const latestEnd = Math.max(...intervals.map((iv) => toMinutes(iv.endTime)));
    const start = latestEnd + 60;
    if (start >= LAST_MINUTE) {
      setError(`${dayLabel(day)}: no time left after ${fromMinutes(latestEnd).slice(0, 5)}`);
      return;
    }
    const end = Math.min(start + 60, LAST_MINUTE);

    setWeek((prev) => ({
      ...prev,
      [day]: [...prev[day], { startTime: fromMinutes(start), endTime: fromMinutes(end) }],
    }));
  }

  function removeInterval(day: Weekday, index: number) {
    setSaved(false);
    setWeek((prev) => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setConflicts([]);

    const entries = toEntries(week);
    const checked = changeWeekScheduleRequestSchema.safeParse(entries);
    if (!checked.success) {
      const issue = checked.error.issues[0];
      const index = issue?.path[0];
      const day = typeof index === "number" ? entries[index]?.dayOfTheWeek : undefined;
      const message = issue?.message ?? "Check the hours";
      setError(day ? `${dayLabel(day)}: ${message}` : message);
      return;
    }

    setIsSubmitting(true);
    try {
      await putFacilitySchedule(facilityId, checked.data);
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const parsed = scheduleConflictDetailsSchema.safeParse(err);
        if (parsed.success) {
          const days = [...new Set(parsed.data.map((c) => c.dayOfTheWeek))].toSorted(
            (a, b) => a - b,
          );
          setConflicts(days.map((d) => `${dayLabel(d)}: a staff member works outside these hours`));
          return;
        }
      }
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {DAYS.map(({ value: day, label }) => {
          const intervals = week[day];
          const isClosed = intervals.length === 0;
          return (
            <li key={day} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
              <span className="w-28 shrink-0 pt-2 text-sm font-medium">{label}</span>

              <div className="flex flex-1 flex-col gap-2">
                {isClosed && <span className="pt-2 text-sm text-muted-foreground">Closed</span>}

                {intervals.map((iv, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      type="time"
                      aria-label={`${label} interval ${i + 1} opens`}
                      className="w-32 nums"
                      value={iv.startTime.slice(0, 5)}
                      onChange={(e) =>
                        updateInterval(day, i, { startTime: `${e.target.value}:00` })
                      }
                    />
                    <span aria-hidden className="text-muted-foreground">
                      –
                    </span>
                    <TextInput
                      type="time"
                      aria-label={`${label} interval ${i + 1} closes`}
                      className="w-32 nums"
                      value={iv.endTime.slice(0, 5)}
                      onChange={(e) => updateInterval(day, i, { endTime: `${e.target.value}:00` })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterval(day, i)}
                      aria-label={`Remove ${label} interval ${i + 1}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                {intervals.length < MAX_INTERVALS_PER_DAY && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => addInterval(day)}
                  >
                    {isClosed ? "Open this day" : "Add break"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {conflicts.length > 0 && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm">
          <p className="font-medium">These hours don&apos;t cover your staff schedules:</p>
          <ul className="mt-2 list-disc pl-5">
            {conflicts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-success">Hours saved</span>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save hours"}
        </Button>
      </div>
    </Form>
  );
}
