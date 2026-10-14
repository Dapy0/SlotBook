"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  createFacilityRequestSchema,
  FACILITY_CATEGORIES,
  updateFacilityRequestSchema,
  type FacilityCategory,
  type FacilityResponse,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Input, Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { createFacility, updateFacility } from "@/services/facilities";

const Form = "form";

const CATEGORY_LABELS: Record<FacilityCategory, string> = {
  BEAUTY: "Beauty",
  SPORT_FITNESS: "Sport & fitness",
  MEDICAL: "Medical",
  AUTO: "Auto",
  EDUCATION: "Education",
  OTHER: "Other",
};

const CURRENCIES = ["PLN", "EUR", "USD", "GBP", "INR"];

const TIMEZONES: string[] = Intl.supportedValuesOf("timeZone");

type Props = {
  facility?: FacilityResponse;
};

type FormValues = {
  name: string;
  slug: string;
  category: FacilityCategory;
  description: string;
  country: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
};
type FieldErrors = Partial<Record<keyof FormValues, string>>;

function initialValues(facility?: FacilityResponse): FormValues {
  if (facility) {
    return {
      ...facility,
      latitude: String(facility.latitude),
      longitude: String(facility.longitude),
    };
  }

  return {
    name: "",
    slug: "",
    category: "OTHER",
    description: "",
    country: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    timezone: "Europe/Warsaw",
    currency: "PLN",
  };
}
function parseCoordinate(input: string): number | null {
  const trimmed = input.trim().replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function FacilityForm({ facility }: Props) {
  const router = useRouter();
  const isEdit = facility !== undefined;
  const [values, setValues] = useState<FormValues>(() => initialValues(facility));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setSaved(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    const latitude = parseCoordinate(values.latitude);
    const longitude = parseCoordinate(values.longitude);
    if (latitude === null || longitude === null) {
      setErrors({
        ...(latitude === null && { latitude: "Enter a number, e.g. 52.2297" }),
        ...(longitude === null && { longitude: "Enter a number, e.g. 21.0122" }),
      });
      return;
    }

    const payload = {
      name: values.name,
      category: values.category,
      description: values.description,
      country: values.country,
      city: values.city,
      address: values.address,
      latitude,
      longitude,
      phone: values.phone,
      email: values.email,
      timezone: values.timezone,
      currency: values.currency,
    };

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const checked = updateFacilityRequestSchema.safeParse({ ...payload, slug: values.slug });
        if (!checked.success) {
          setErrors({ slug: "This address is already taken" });
          return;
        }
        setErrors({});

        let changes: Partial<typeof checked.data> = {};
        for (const key of Object.keys(checked.data) as (keyof typeof checked.data)[]) {
          if (checked.data[key] !== facility[key]) {
            changes = { ...changes, [key]: checked.data[key] };
          }
        }
        if (Object.keys(changes).length === 0) return;

        const updated = await updateFacility(facility.id, changes);
        setSaved(true);
        if (updated.slug !== facility.slug) {
          router.replace(`/dashboard/${updated.slug}/settings` as Route);
        }
        router.refresh();
      } else {
        const checked = createFacilityRequestSchema.safeParse(payload);
        if (!checked.success) {
          setErrors({ slug: "This address is already taken" });
          return;
        }
        setErrors({});

        const created = await createFacility(checked.data);
        router.push(`/dashboard/${created.slug}` as Route);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError && isEdit) {
        setErrors({ slug: "This address is already taken. Try another one." });
      } else {
        setFormError(
          err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      <Section title="Basics">
        <Field id="name" label="Venue name" error={errors.name}>
          <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>

        {isEdit && (
          <Field
            id="slug"
            label="Public address"
            hint={`slotbook.app/venues/${values.slug || "…"}`}
            error={errors.slug}
          >
            <Input id="slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
        )}

        <Field id="category" label="Category" error={errors.category}>
          <select
            id="category"
            value={values.category}
            onChange={(e) => set("category", e.target.value as FacilityCategory)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {FACILITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="description"
          label="Description"
          hint="Up to 1000 characters"
          error={errors.description}
        >
          <textarea
            id="description"
            rows={4}
            maxLength={1000}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="country"
            label="Country code"
            hint="Two letters, e.g. PL"
            error={errors.country}
          >
            <Input
              id="country"
              maxLength={2}
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </Field>
          <Field id="city" label="City" error={errors.city}>
            <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
        </div>
        <Field id="address" label="Street address" error={errors.address}>
          <Input
            id="address"
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        {/* Координаты: MVP — два поля. Карту Mapbox с булавкой можно добавить позже. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="latitude" label="Latitude" error={errors.latitude}>
            <Input
              id="latitude"
              inputMode="decimal"
              className="nums"
              value={values.latitude}
              onChange={(e) => set("latitude", e.target.value)}
            />
          </Field>
          <Field id="longitude" label="Longitude" error={errors.longitude}>
            <Input
              id="longitude"
              inputMode="decimal"
              className="nums"
              value={values.longitude}
              onChange={(e) => set("longitude", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Contacts">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" label="Phone" error={errors.phone}>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Time and money">
        {/* TODO F8: при правке, если у заведения есть брони, timezone и currency
            лучше заблокировать (решение 10.5.9). Откуда форма узнает, что брони есть? */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="timezone" label="Time zone" error={errors.timezone}>
            <select
              id="timezone"
              value={values.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>
          <Field id="currency" label="Currency" error={errors.currency}>
            <select
              id="currency"
              value={values.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span role="status" className="text-sm text-success">
            Changes saved
          </span>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create draft venue"}
        </Button>
      </div>
    </Form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <legend className="px-1 font-heading text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
