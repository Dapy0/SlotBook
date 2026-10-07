"use client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { updateService } from "@/services/service";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  facilityId: string;
  serviceId: string;
  isActive: boolean;
};

export function ActiveToggle({ facilityId, serviceId, isActive }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setIsPending(true);
    updateService(facilityId, serviceId, { isActive: !isActive })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to update service");
      })
      .finally(() => {
        setIsPending(false);
        router.refresh();
      });
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <Switch
        role="switch"
        checked={isActive}
        aria-label={isActive ? "Hide service" : "Show service"}
        disabled={isPending}
        size={"default"}
        aria-invalid={error == null ? "false" : true}
        onClick={toggle}
      ></Switch>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
