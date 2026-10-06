"use client";
import { useState } from "react";
import type { ServiceResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";

type Props = {
  facilityId: string;
  staffId: string;
  services: ServiceResponse[];
  initialServiceIds: string[];
  onDone: () => void;
};

export function StaffServicesForm({
  facilityId,
  staffId,
  services,
  initialServiceIds,
  onDone,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialServiceIds));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(serviceId: string) {
    const newSet = new Set(selected);
    if (newSet.has(serviceId)) {
      newSet.delete(serviceId);
    } else {
      newSet.add(serviceId);
    }
    setSelected(newSet);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const setToArr = [...selected];
      if (initialServiceIds.every((v, i) => v === setToArr[i])) {
        return onDone();
      }
      
      // TODO 6.4: setStaffServices(facilityId, staffId, [...selected]), затем onDone() и router.refresh()
      void facilityId;
      void staffId;
    } catch (err) {
      void err;
      setError("TODO");
    } finally {
      setIsSubmitting(false);
    }
  }

  // TODO 6.5: решение из плана — показывать ли скрытые услуги (isActive=false)?
  //           Если нет, отфильтруй их здесь. А если сотруднику уже назначена скрытая услуга?

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {services.length === 0 ? (
        <p className="text-sm text-gray-500">This venue has no services yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={selected.has(service.id)}
                  onChange={() => toggle(service.id)}
                />
                <span className={service.isActive ? "text-gray-900" : "text-gray-400"}>
                  {service.name}
                </span>
                {!service.isActive && <span className="ml-auto text-xs text-gray-400">Hidden</span>}
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save services"}
        </Button>
      </div>
    </form>
  );
}
