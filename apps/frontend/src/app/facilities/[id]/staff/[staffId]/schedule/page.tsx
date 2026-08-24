'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WeeklyScheduleForm, type ScheduleEntry } from '@/components/schedule/WeeklyScheduleForm';
import { getStaffSchedule, putStaffSchedule } from '@/services/staffSchedule';

export default function StaffSchedulePage() {
  const { id, staffId } = useParams<{ id: string; staffId: string }>();
  const [initialData, setInitialData] = useState<ScheduleEntry[] | null>(null);

  useEffect(() => {
    getStaffSchedule(id, staffId)
      .then(setInitialData)
      .catch(() => setInitialData([]));
  }, [id, staffId]);

  if (!initialData) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-heading text-3xl font-medium text-foreground">Staff Member Schedule</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Staff ID: <span className="font-(family-name:--font-geist-mono)">{staffId}</span>
      </p>

      <WeeklyScheduleForm
        initialData={initialData}
        onSubmit={(data) => putStaffSchedule(id, staffId, data).then(() => undefined)}
      />
    </div>
  );
}
