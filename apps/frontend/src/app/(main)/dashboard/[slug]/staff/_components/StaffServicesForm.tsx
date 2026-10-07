"use client";
import { useState } from "react";
import type { ServiceResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { setStaffServices } from "@/services/staff";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
      const isUnchanged =
        initialServiceIds.length === selected.size &&
        initialServiceIds.every((id) => selected.has(id));
      if (isUnchanged) {
        return onDone();
      }
      await setStaffServices(facilityId, staffId, { serviceIds: [...selected] });

      onDone();
      router.refresh();
    } catch (err) {
      void err;
      setError("Couldn't save the services. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // TODO 6.5: решение из плана — показывать ли скрытые услуги (isActive=false)?
  //           Если нет, отфильтруй их здесь. А если сотруднику уже назначена скрытая услуга?

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">This venue has no services yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={selected.has(service.id)}
                  onChange={() => toggle(service.id)}
                />
                <span className={service.isActive ? "text-foreground" : "text-muted-foreground"}>
                  {service.name}
                </span>
                {!service.isActive && <span className="ml-auto text-xs text-muted-foreground">Hidden</span>}
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <span className="text-sm text-destructive">{error}</span>}

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
