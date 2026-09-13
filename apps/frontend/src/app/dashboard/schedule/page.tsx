"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const entities = [
  { key: "business", label: "Business" },
  { key: "anna", label: "Anna K." },
  { key: "marek", label: "Marek W." },
];

type DaySchedule = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

const initialSchedule: DaySchedule[] = [
  { day: "Monday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Tuesday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Wednesday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Thursday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Friday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Saturday", enabled: false, from: "10:00", to: "16:00" },
  { day: "Sunday", enabled: false, from: "10:00", to: "16:00" },
];

export default function SchedulePage() {
  const [activeEntity, setActiveEntity] = useState("business");
  const [schedule, setSchedule] = useState(initialSchedule);

  const toggleDay = (day: string) => {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d)));
  };

  const updateTime = (day: string, field: "from" | "to", value: string) => {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)));
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Schedule</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Working Hours</h1>

      {/* Entity switcher */}
      <div className="mt-4 flex gap-2">
        {entities.map((e) => (
          <button
            key={e.key}
            onClick={() => setActiveEntity(e.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeEntity === e.key
                ? "bg-primary text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Schedule rows */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {schedule.map((d) => (
            <div
              key={d.day}
              className={`flex items-center justify-between px-6 py-4 ${
                !d.enabled ? "bg-gray-50" : ""
              }`}
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={() => toggleDay(d.day)}
                  className="size-4 accent-primary"
                />
                <span
                  className={`text-sm font-medium ${d.enabled ? "text-gray-900" : "text-gray-400"}`}
                >
                  {d.day}
                </span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">From</span>
                  <input
                    type="time"
                    value={d.from}
                    disabled={!d.enabled}
                    onChange={(e) => updateTime(d.day, "from", e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">To</span>
                  <input
                    type="time"
                    value={d.to}
                    disabled={!d.enabled}
                    onChange={(e) => updateTime(d.day, "to", e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="mt-4 flex items-center gap-4">
        <Button className="bg-primary text-white hover:bg-primary/90">Save schedule</Button>
        <p className="text-xs text-gray-400">
          Slots are generated from these hours based on service duration. Booking horizon — 30 days.
        </p>
      </div>
    </div>
  );
}
