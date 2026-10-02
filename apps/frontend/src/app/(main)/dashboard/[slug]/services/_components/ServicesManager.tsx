"use client";
import { useState } from "react";
import type { ServiceResponse } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "./ServiceForm";
import { ServiceRow } from "./ServiceRow";

type Props = {
  facilityId: string;
  currency: string;
  services: ServiceResponse[];
};

export function ServicesManager({ facilityId, currency, services }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
  };
  const startEdit = (id: string) => {
    setIsCreating(false);
    setEditingId(id);
  };
  const closeForms = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {!isCreating && <Button onClick={startCreate}>+ New service</Button>}
      </div>

      {isCreating && (
        <div className="rounded-lg border bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">New service</h2>
          <ServiceForm facilityId={facilityId} currency={currency} onDone={closeForms} />
        </div>
      )}

      {services.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium text-gray-900">No services yet</p>
          <p className="text-sm text-gray-500">Add your first service so clients can book it</p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-white overflow-clip">
          {services.map((service) => (
            <li key={service.id}>
              {editingId === service.id ? (
                <div className="bg-gray-50 p-5">
                  <ServiceForm
                    facilityId={facilityId}
                    currency={currency}
                    service={service}
                    onDone={closeForms}
                  />
                </div>
              ) : (
                <ServiceRow
                  facilityId={facilityId}
                  service={service}
                  onEdit={() => startEdit(service.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
