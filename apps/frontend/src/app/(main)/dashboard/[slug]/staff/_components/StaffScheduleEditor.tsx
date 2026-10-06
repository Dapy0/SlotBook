"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { WeeklyScheduleForm, type ScheduleEntry } from "@/components/schedule/WeeklyScheduleForm";

type Props = {
  facilityId: string;
  staffId: string;
  onDone: () => void;
};

// Шаг 7: недельное расписание сотрудника.
// Переиспользуем WeeklyScheduleForm (один интервал в день — ограничение MVP).
export function StaffScheduleEditor({ facilityId, staffId, onDone }: Props) {
  const [initial, setInitial] = useState<ScheduleEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // TODO 7.3: загрузи текущее расписание при открытии панели:
  //           useEffect → getStaffSchedule(facilityId, staffId) → setInitial(...)
  //           Ответ содержит id, createdAt, staffMemberId. Что из этого нужно форме?
  //           Время приходит как "09:00:00", а <input type="time"> ждёт "09:00".
  //           Подумай, что будет, если панель закроют до ответа сервера.
  void setInitial;
  void setLoadError;

  async function handleSubmit(entries: ScheduleEntry[]) {
    // TODO 7.4: putStaffSchedule(facilityId, staffId, entries), затем router.refresh().
    //           WeeklyScheduleForm сама покажет ошибку, если ты пробросишь исключение.
    void entries;
    throw new Error(`TODO: save schedule for ${staffId} in ${facilityId}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {loadError ? (
        <p className="text-sm text-red-500">{loadError}</p>
      ) : initial === null ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner /> Loading schedule…
        </div>
      ) : (
        // WeeklyScheduleForm читает initialData только при первом рендере,
        // поэтому рендерим её, когда данные уже пришли
        <WeeklyScheduleForm initialData={initial} onSubmit={handleSubmit} />
      )}
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Close
        </Button>
      </div>
    </div>
  );
}
