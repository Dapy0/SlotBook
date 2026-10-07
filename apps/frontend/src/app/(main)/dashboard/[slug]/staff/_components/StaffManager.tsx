"use client";
import { useState } from "react";
import type { ManagedStaffMemberResponse, ServiceResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddStaffForm } from "./AddStaffForm";
import { StaffRow } from "./StaffRow";
import { StaffServicesForm } from "./StaffServicesForm";
import { StaffScheduleEditor } from "./StaffScheduleEditor";

type Panel = { staffId: string; kind: "services" | "schedule" } | null;

type Props = {
  facilityId: string;
  staff: ManagedStaffMemberResponse[];
  services: ServiceResponse[];
  emptyTitle: string;
  emptyText: string;
};

export function StaffManager({ facilityId, staff, services, emptyTitle, emptyText }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const serviceNameById = new Map(services.map((s) => [s.id, s.name]));
  const closePanel = () => setPanel(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {!isAdding && <Button onClick={() => setIsAdding(true)}>
            <Plus aria-hidden />
            Add staff
          </Button>}
      </div>

      {isAdding && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Add staff member</h2>
          <AddStaffForm facilityId={facilityId} onDone={() => setIsAdding(false)} />
        </div>
      )}

      {staff.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-12 text-center">
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-clip rounded-xl border border-border bg-card">
          {staff.map((member) => {
            const open = panel?.staffId === member.id ? panel.kind : null;
            return (
              <li key={member.id}>
                <StaffRow
                  facilityId={facilityId}
                  member={member}
                  serviceNames={member.serviceIds.map((id) => serviceNameById.get(id) ?? "Unknown")}
                  onOpenServices={() => setPanel({ staffId: member.id, kind: "services" })}
                  onOpenSchedule={() => setPanel({ staffId: member.id, kind: "schedule" })}
                />
                {open === "services" && (
                  <div className="bg-muted/50 p-5">
                    <StaffServicesForm
                      facilityId={facilityId}
                      staffId={member.id}
                      services={services}
                      initialServiceIds={member.serviceIds}
                      onDone={closePanel}
                    />
                  </div>
                )}
                {open === "schedule" && (
                  <div className="bg-muted/50 p-5">
                    <StaffScheduleEditor
                      facilityId={facilityId}
                      staffId={member.id}
                      onDone={closePanel}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
