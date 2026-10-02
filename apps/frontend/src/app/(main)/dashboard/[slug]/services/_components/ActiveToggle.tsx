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
        console.log(err);
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
        id="service-status"
        aria-label={isActive ? "Hide service" : "Show service"}
        disabled={isPending}
        size={"default"}
        aria-invalid={error == null ? "false" : true}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
          isActive ? "bg-primary" : "bg-gray-300"
        }`}
      ></Switch>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
