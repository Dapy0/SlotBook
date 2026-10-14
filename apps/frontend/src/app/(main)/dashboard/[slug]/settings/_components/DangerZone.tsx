"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { deleteFacility } from "@/services/facilities";

type Props = {
  facilityId: string;
  facilityName: string;
};

export function DangerZone({ facilityId, facilityName }: Props) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = false;

  async function handleDelete() {
    try {
      await deleteFacility(facilityId);
      setIsPending(true);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      error instanceof ApiError
        ? setError(error.message)
        : setError("Couldn't delete the schedule. Check your connection and try again.");
    }
    setIsPending(false);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-destructive/40 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-destructive">Delete venue</h2>
        <p className="text-sm text-muted-foreground">
          Only a venue without bookings can be deleted. This can&apos;t be undone.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-name">
          Type <span className="font-semibold">{facilityName}</span> to confirm
        </Label>
        <TextInput
          id="confirm-name"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <Button variant="destructive" onClick={handleDelete} disabled={!canDelete || isPending}>
          {isPending ? "Deleting…" : "Delete venue"}
        </Button>
      </div>
    </section>
  );
}
