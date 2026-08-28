'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WeeklyScheduleForm, type ScheduleEntry } from '@/components/schedule/WeeklyScheduleForm';
import { getFacilitySchedule, putFacilitySchedule } from '@/services/facilitySchedule';

export default function FacilitySchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<ScheduleEntry[] | null>(null);

  useEffect(() => {
    getFacilitySchedule(id)
      .then(setInitialData)
      .catch((err) => {
        console.error('Failed to load schedule:', err);
        setInitialData([]);
      });
  }, [id]);

  if (!initialData) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-heading text-3xl font-medium text-foreground">Facility Working Hours</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set which days this facility is open and its working hours per day.
      </p>

      <WeeklyScheduleForm
        initialData={initialData}
        onSubmit={(data) => putFacilitySchedule(id, data).then(() => undefined)}
      />
    </div>
  );
}
