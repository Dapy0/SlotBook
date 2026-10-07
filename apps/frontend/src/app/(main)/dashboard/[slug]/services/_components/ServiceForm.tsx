"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createServiceRequestSchema,
  updateServiceRequestSchema,
  type CreateServiceRequest,
  type ServiceResponse,
  type UpdateServiceRequest,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fromCents, toCents } from "@/lib/utils";
import { moneyFormatterFromCents } from "@/lib/format";
import { createService, updateService } from "@/services/service";
import { ApiError } from "@/lib/api";

const DURATIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240];

type Props = {
  facilityId: string;
  currency: string;
  service?: ServiceResponse;
  onDone: () => void;
};
type FormValues = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: string;
  isActive: boolean;
};
type FieldErrors = Partial<Record<keyof FormValues, string>>;

function issuesToFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of issues) {
    const raw = issue.path[0];
    const key = (raw === "priceCents" ? "price" : raw) as keyof FormValues;
    result[key] ??= issue.message;
  }
  return result;
}

function initialValues(service: ServiceResponse | undefined, currency: string): FormValues {
  if (!service) {
    return {
      name: "",
      description: "",
      category: "",
      durationMinutes: 60,
      price: "",
      isActive: true,
    };
  }
  return {
    name: service.name,
    description: service.description,
    category: service.category,
    durationMinutes: service.durationMinutes,
    price: fromCents(service.priceCents, currency),
    isActive: service.isActive,
  };
}
export function ServiceForm({ facilityId, currency, service, onDone }: Props) {
  const router = useRouter();
  const isEdit = service !== undefined;

  const [values, setValues] = useState<FormValues>(() => initialValues(service, currency));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    const priceCents = toCents(values.price, currency);
    if (Number.isNaN(priceCents)) {
      setErrors({ price: "Enter a valid price, e.g. 80 or 12.50" });
      return;
    }

    const payload = {
      name: values.name,
      description: values.description,
      category: values.category,
      durationMinutes: values.durationMinutes,
      priceCents,
      isActive: values.isActive,
    };

    const checked = createServiceRequestSchema.safeParse(payload);
    if (!checked.success) {
      setErrors(issuesToFieldErrors(checked.error.issues));
      return;
    }
    setErrors({});

    let changes: Partial<typeof payload> = {};
    if (isEdit) {
      for (const key of Object.keys(payload) as (keyof typeof payload)[]) {
        if (payload[key] !== service[key]) {
          changes = { ...changes, [key]: payload[key] };
        }
      }
      if (Object.keys(changes).length === 0) {
        onDone();
        return;
      }
      const checkedChanges = updateServiceRequestSchema.safeParse(changes);
      if (!checkedChanges.success) {
        setErrors(issuesToFieldErrors(checkedChanges.error.issues));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateService(facilityId, service.id, changes);
      } else {
        await createService(facilityId, checked.data);
      }
      onDone();
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Men's haircut"
        />
        {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={2}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Classic cut with styling"
          className="rounded-md border border-input bg-card px-3 py-2 text-base shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
        {errors.description && (
          <span className="text-sm text-destructive">{errors.description}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="haircut"
        />
        {errors.category && <span className="text-sm text-destructive">{errors.category}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration">Duration</Label>
        <select
          id="duration"
          value={values.durationMinutes}
          onChange={(e) => set("durationMinutes", Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {/* TODO 8: тот же формат, что в ServiceRow (вынеси функцию в lib/format) */}
              {m} min
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="price">Price ({currency})</Label>
        <Input
          id="price"
          inputMode="decimal"
          value={values.price}
          onChange={(e) => set("price", e.target.value)}
          placeholder="80.00"
        />
        {errors.price && <span className="text-sm text-destructive">{errors.price}</span>}
      </div>

      <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="size-4"
        />
        Visible to clients
      </label>

      {formError && <p className="text-sm text-destructive sm:col-span-2">{formError}</p>}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create service"}
        </Button>
      </div>
    </form>
  );
}
