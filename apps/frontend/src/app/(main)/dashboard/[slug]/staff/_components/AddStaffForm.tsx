"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { addStaffMembersForOwner } from "@/services/staff";

type Props = {
  facilityId: string;
  onDone: () => void;
};

export function AddStaffForm({ facilityId, onDone }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    setIsSubmitting(true);
    try {
      await addStaffMembersForOwner(facilityId, { email });
      onDone();
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("No SlotBook account uses this email. Ask them to sign up first.");
          return;
        }
        if (err.status === 409) {
          setError("This person is already on your team.");
          return;
        }
        if (err.status === 403) {
          setError("You can't add yourself: owners manage the venue, not staff slots.");
          return;
        }
      }
      setError("Couldn't add this person. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="anna@example.com"
          aria-invalid={error ? true : undefined}
        />
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}
