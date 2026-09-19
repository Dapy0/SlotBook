"use client";
import ScheduleSelection from "@/app/(main)/dashboard/schedule/_components/ScheduleSelection";
import { Button } from "@/components/ui/button";
import { getFacilitySchedule } from "@/services/facilitySchedule";
import type { FacilityResponse, FacilityScheduleEntryResponse, FacilityWeekScheduleResponse } from "@slotbook/shared";
import { useEffect, useState } from "react";

function SchedulePageClient({ myFacilities }: { myFacilities: FacilityResponse[] }) {
  const [activeFacility, setActiveFacility] = useState<string | null>(null);
  const [selectedFacilitySchedule, setSelectedFacilitySchedule] =
    useState<FacilityWeekScheduleResponse>();

  useEffect(() => {
    if (!activeFacility) {
      return;
    }
    getFacilitySchedule(activeFacility).then(setSelectedFacilitySchedule);
  }, [activeFacility]);
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
      {selectedFacilitySchedule && <ScheduleSelection schedule={selectedFacilitySchedule} />}

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

export default SchedulePageClient;
