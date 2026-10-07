"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS: { value: 1 | 2 | 3 | 4 | 5 | 6 | 7; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export type ScheduleEntry = {
  dayOfTheWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;
};

type DayRow = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type WeeklyScheduleFormProps = {
  initialData: ScheduleEntry[];
  onSubmit: (data: ScheduleEntry[]) => Promise<void>;
};

function buildInitialRows(initialData: ScheduleEntry[]): DayRow[] {
  return DAYS.map(({ value }) => {
    const existing = initialData.find((d) => d.dayOfTheWeek === value);
    return existing
      ? { enabled: true, startTime: existing.startTime, endTime: existing.endTime }
      : { enabled: false, startTime: "09:00:00", endTime: "18:00:00" };
  });
}

export function WeeklyScheduleForm({ initialData, onSubmit }: WeeklyScheduleFormProps) {
  const [rows, setRows] = useState<DayRow[]>(() => buildInitialRows(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateRow(index: number, patch: Partial<DayRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const enabledRows = rows
      .map((row, i) => ({ ...row, dayOfTheWeek: DAYS[i].value }))
      .filter((row) => row.enabled);

    if (enabledRows.length === 0) {
      setError("Enable at least one working day");
      return;
    }
    for (const row of enabledRows) {
      if (row.startTime >= row.endTime) {
        setError(
          `Start time must be before end time (${DAYS.find((d) => d.value === row.dayOfTheWeek)?.label})`,
        );
        return;
      }
    }

    const payload: ScheduleEntry[] = enabledRows.map(({ dayOfTheWeek, startTime, endTime }) => ({
      dayOfTheWeek,
      startTime: startTime.length == 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length == 5 ? `${endTime}:00` : endTime,
    }));

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {DAYS.map((day, i) => {
        const row = rows[i];
        return (
          <div
            key={day.value}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-card p-4"
          >
            <label className="flex w-full items-center gap-2 text-sm font-medium sm:w-32">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => updateRow(i, { enabled: e.target.checked })}
                className="size-4"
              />
              {day.label}
            </label>

            <div className="flex items-center gap-2">
              <Label htmlFor={`start-${day.value}`} className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id={`start-${day.value}`}
                type="time"
                disabled={!row.enabled}
                value={row.startTime}
                onChange={(e) => updateRow(i, { startTime: e.target.value })}
                className="w-28"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor={`end-${day.value}`} className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id={`end-${day.value}`}
                type="time"
                disabled={!row.enabled}
                value={row.endTime}
                onChange={(e) => updateRow(i, { endTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>
        );
      })}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Schedule saved
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save schedule"}
      </Button>
    </form>
  );
}
