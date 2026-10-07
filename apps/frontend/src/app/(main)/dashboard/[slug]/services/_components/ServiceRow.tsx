"use client";
import type { ServiceResponse } from "@slotbook/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { durationFormatter, moneyFormatterFromCents } from "@/lib/format";
import { ActiveToggle } from "./ActiveToggle";
import { convertMinutesToTime } from "@/lib/utils";

type Props = {
  facilityId: string;
  service: ServiceResponse;
  onEdit: () => void;
};

export function ServiceRow({ facilityId, service, onEdit }: Props) {
  const { id, name, description, category, durationMinutes, priceCents, currency, isActive } =
    service;

  const duration = `${durationFormatter.format({
    hours: convertMinutesToTime(service.durationMinutes)[0],
    minutes: convertMinutesToTime(service.durationMinutes)[1],
  })}`;

  return (
    <div
      className={`grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center ${
        isActive ? "" : "bg-muted/50"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`m-0 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
            {name}
          </p>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
            {category}
          </Badge>
          {!isActive && (
            <Badge variant="outline" className="border-border bg-muted text-xs text-muted-foreground">
              Hidden
            </Badge>
          )}
        </div>
        {description && <p className="m-0 line-clamp-1 text-sm text-muted-foreground">{description}</p>}
        <p className="m-0 text-sm text-muted-foreground">
          {duration} ·{" "}
          <span className="font-semibold">{moneyFormatterFromCents(priceCents, currency)}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 sm:justify-end">
        <ActiveToggle facilityId={facilityId} serviceId={id} isActive={isActive} />
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}
