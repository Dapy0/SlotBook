"use client";

import {
  WEEKDAY_BY_NAME,
  type FacilityScheduleEntryResponse,
  type FacilityWeekScheduleResponse,
} from "@slotbook/shared";
import { useState } from "react";
type PlaceholderRange = { id: string; from: string; to: string; error?: string };
type Day = {
  day: number;
  label: string;
  enabled: boolean;
  ranges: PlaceholderRange[];
};
const PLACEHOLDER_WEEK: Day[] = [
  {
    day: 1,
    label: "Mon",
    enabled: true,
    ranges: [
      { id: "mon-1", from: "08:00", to: "09:00" },
      { id: "mon-2", from: "10:00", to: "12:00" },
    ],
  },
  {
    day: 2,
    label: "Tue",
    enabled: false,
    ranges: [{ id: "tue-1", from: "09:00", to: "17:00" }],
  },
  {
    day: 3,
    label: "Wed",
    enabled: true,
    ranges: [
      { id: "wed-1", from: "09:00", to: "17:00" },
      {
        id: "wed-2",
        from: "12:00",
        to: "13:00",
        error: "overlaps with another entry on the same day",
      },
    ],
  },
  {
    day: 4,
    label: "Thu",
    enabled: true,
    ranges: [{ id: "thu-1", from: "09:00", to: "17:00" }],
  },
  {
    day: 5,
    label: "Fri",
    enabled: true,
    ranges: [{ id: "fri-1", from: "09:00", to: "17:00" }],
  },
  {
    day: 6,
    label: "Sat",
    enabled: false,
    ranges: [{ id: "sat-1", from: "09:00", to: "17:00" }],
  },
  {
    day: 7,
    label: "Sun",
    enabled: false,
    ranges: [{ id: "sun-1", from: "09:00", to: "17:00" }],
  },
];
function weekFromResponse(schedule: FacilityWeekScheduleResponse): Day[] {
  return Object.entries(WEEKDAY_BY_NAME).map(([label, day]) => {
    const ranges = schedule
      .filter((e) => e.dayOfTheWeek === day)
      .sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0))
      .map((e) => ({ id: e.id, from: e.startTime.slice(0, 5), to: e.endTime.slice(0, 5) }));

    return ranges.length > 0
      ? { day, label, enabled: true, ranges }
      : { day, label, enabled: false, ranges: [] };
  });
}

function ScheduleSelection({ schedule }: { schedule: FacilityWeekScheduleResponse }) {
  const [week, setWeek] = useState<Day[]>(() => weekFromResponse(schedule));
  console.log(week);
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {PLACEHOLDER_WEEK.map((d) => (
          <div
            key={d.day}
            className={`flex items-start justify-between gap-4 px-6 py-4 ${
              !d.enabled ? "bg-gray-50" : ""
            }`}
          >
            {/* чекбокс дня */}
            <label className="flex items-center gap-3 py-1.5">
              <input type="checkbox" defaultChecked={d.enabled} className="size-4 accent-primary" />
              <span
                className={`text-sm font-medium ${d.enabled ? "text-gray-900" : "text-gray-400"}`}
              >
                {d.label}
              </span>
            </label>

            {/* периоды дня */}
            <div className="flex flex-col items-end gap-2">
              {d.ranges.map((r) => {
                const inputClass = `rounded-lg border px-3 py-1.5 text-sm text-gray-900 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 ${
                  r.error
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-primary"
                }`;

                return (
                  <div key={r.id} className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">From</span>
                        <input
                          type="time"
                          defaultValue={r.from}
                          disabled={!d.enabled}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">To</span>
                        <input
                          type="time"
                          defaultValue={r.to}
                          disabled={!d.enabled}
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove period for ${d.label}`}
                        disabled={!d.enabled || d.ranges.length === 1}
                        className="size-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        ×
                      </button>
                    </div>
                    {r.error && <span className="text-xs text-red-500">{r.error}</span>}
                  </div>
                );
              })}

              <button
                type="button"
                disabled={!d.enabled}
                className="text-xs font-medium text-primary hover:underline disabled:text-gray-300 disabled:no-underline"
              >
                + Add period
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleSelection;
