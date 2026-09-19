"use client";
import { Button } from "@/components/ui/button";
import ScheduleSelection from "@/app/(main)/dashboard/_components/ScheduleSelection";
import { getFacilitySchedule } from "@/services/facilitySchedule";
import { getMyFacilities } from "@/services/facilities";
import { useEffect, useState } from "react";
import type { FacilityResponse, FacilityScheduleEntryResponse } from "@slotbook/shared";

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
  const [myFacilities, setMyFacilities] = useState<FacilityResponse[]>();
  const [facilitySchedule, setFacilitySchedule] = useState<FacilityScheduleEntryResponse>();
  const [activeFacility, setActiveFacility] = useState<string>();
  // const facilitySchedule = await getFacilitySchedule(myFacilities[0].id);
  useEffect(() => {
    getMyFacilities().then((res) => setMyFacilities(res));
  }, []);
  useEffect(() => {
    activeFacility ? getFacilitySchedule(activeFacility).then(setFacilitySchedule) : null;
  }, [activeFacility]);
  console.log(facilitySchedule);
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Schedule</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Working Hours</h1>

      {/* Entity switcher */}
      <div className="mt-4 flex max-w-xl gap-2 overflow-hidden overflow-x-scroll">
        {myFacilities &&
          myFacilities.map((e) => (
            <Button
              key={e.id}
              onClick={() => setActiveFacility(e.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFacility === e.id
                  ? "bg-primary text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {e.name}
            </Button>
          ))}
      </div>

      {/* Schedule rows */}
      {/* <ScheduleSelection schedule={facilitySchedule} /> */}
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
