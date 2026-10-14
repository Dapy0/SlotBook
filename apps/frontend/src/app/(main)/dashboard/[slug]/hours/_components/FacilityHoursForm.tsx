"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeWeekScheduleRequest, Weekday } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Input as TextInput } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { putFacilitySchedule } from "@/services/facilitySchedule";

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

const MAX_INTERVALS_PER_DAY = 3;

type Interval = { startTime: string; endTime: string }; // "HH:MM:SS", как в API
type Week = Record<Weekday, Interval[]>; // пустой массив = выходной

type Props = {
  facilityId: string;
  initialEntries: ChangeWeekScheduleRequest;
};

function toWeek(entries: ChangeWeekScheduleRequest): Week {
  void entries;
  return { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
}

function toEntries(week: Week): ChangeWeekScheduleRequest {
  void week;
  return [];
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
    void day;
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

    // TODO H5: проверить через changeWeekScheduleRequestSchema (пересечения, start < end)
    //   до отправки и показать первую ошибку в setError.
    // TODO H6: putFacilitySchedule(facilityId, toEntries(week)) → setSaved(true) → router.refresh().
    // TODO H7: ApiError с code "SCHEDULE_CONFLICT" → в details список { staffMemberId, dayOfTheWeek }.
    //   Сейчас ApiError не хранит details (см. README, правка lib/api.ts).
    //   Покажи в setConflicts строки вида «Wednesday: a staff member works outside these hours».
    //   Как показать имя сотрудника, если в details только id?
    void putFacilitySchedule;
    void toEntries;
    void ApiError;
    void router;
    void facilityId;
    setIsSubmitting(false);
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
