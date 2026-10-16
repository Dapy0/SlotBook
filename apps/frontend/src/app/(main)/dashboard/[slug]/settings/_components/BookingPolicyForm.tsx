"use client";
// Карточка «Booking rules» в Settings: между PublicationCard и FacilityForm.
import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BookingPolicyResponse,
  ConfirmationMode,
  UpdateBookingPolicyRequest,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { updateBookingPolicy } from "@/services/bookingPolicy";

const CANCEL_CUTOFF_OPTIONS = [
  { label: "Any time before start", value: 0 },
  { label: "1 hour before", value: 60 },
  { label: "2 hours before", value: 120 },
  { label: "12 hours before", value: 720 },
  { label: "24 hours before", value: 1440 },
  { label: "48 hours before", value: 2880 },
];
const LEAD_OPTIONS = [
  { label: "No minimum", value: 0 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "1 day", value: 1440 },
];
const HORIZON_OPTIONS = [
  { label: "1 week", value: 7 },
  { label: "2 weeks", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

type Props = {
  facilityId: string;
  policy: BookingPolicyResponse;
};
function getChanges(
  initial: BookingPolicyResponse,
  current: BookingPolicyResponse,
): UpdateBookingPolicyRequest {
  const changes: UpdateBookingPolicyRequest = {};
  if (current.confirmationMode !== initial.confirmationMode) {
    changes.confirmationMode = current.confirmationMode;
  }
  if (current.clientCancelCutoffMinutes !== initial.clientCancelCutoffMinutes) {
    changes.clientCancelCutoffMinutes = current.clientCancelCutoffMinutes;
  }
  if (current.bookingLeadMinutes !== initial.bookingLeadMinutes) {
    changes.bookingLeadMinutes = current.bookingLeadMinutes;
  }
  if (current.bookingHorizonDays !== initial.bookingHorizonDays) {
    changes.bookingHorizonDays = current.bookingHorizonDays;
  }
  return changes;
}

export function BookingPolicyForm({ facilityId, policy }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(policy);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changes = getChanges(policy, values);
  const isDirty = Object.keys(changes).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateBookingPolicy(facilityId, values);
      setSaved(true);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          return setError(error.message);
        }
        setError("Something went wrong with changing status");
      }
    }
    setIsPending(false);
  }

  function set<K extends keyof BookingPolicyResponse>(key: K, value: BookingPolicyResponse[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">Booking rules</h2>
        <p className="text-sm text-muted-foreground">
          Changes apply to new bookings. Existing bookings keep the rules they were made with.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Confirmation</legend>
        {(
          [
            [
              "manual",
              "I confirm each booking",
              "Clients see “Reserved” until you or staff confirm.",
            ],
            ["auto", "Confirm instantly", "Clients get a confirmed booking right away."],
          ] as [ConfirmationMode, string, string][]
        ).map(([mode, title, hint]) => (
          <label
            key={mode}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-checked:border-primary"
          >
            <input
              type="radio"
              name="confirmationMode"
              value={mode}
              checked={values.confirmationMode === mode}
              onChange={() => set("confirmationMode", mode)}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-sm text-muted-foreground">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <PolicySelect
          id="cutoff"
          label="Free cancellation"
          value={values.clientCancelCutoffMinutes}
          options={CANCEL_CUTOFF_OPTIONS}
          onChange={(v) => set("clientCancelCutoffMinutes", v)}
        />
        <PolicySelect
          id="lead"
          label="Minimum notice"
          value={values.bookingLeadMinutes}
          options={LEAD_OPTIONS}
          onChange={(v) => set("bookingLeadMinutes", v)}
        />
        <PolicySelect
          id="horizon"
          label="Open for booking"
          value={values.bookingHorizonDays}
          options={HORIZON_OPTIONS}
          onChange={(v) => set("bookingHorizonDays", v)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!isDirty || isPending}>
          {isPending ? "Saving…" : "Save rules"}
        </Button>
        {saved && (
          <span role="status" className="text-sm text-muted-foreground">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

function PolicySelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  options: { label: string; value: number }[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
