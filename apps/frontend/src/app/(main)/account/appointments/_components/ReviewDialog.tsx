"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/ReviewForm";

type Props = {
  facilityId: string;
  bookingId: string;
  serviceName: string;
  facilityName: string;
};

export function ReviewDialog({ facilityId, bookingId, serviceName, facilityName }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openKey, setOpenKey] = useState(0);

  function open() {
    setOpenKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleSaved() {
    close();
    router.refresh();
  }

  const titleId = `review-title-${bookingId}`;
  return (
    <>
      <Button variant="outline" size="sm" onClick={open}>
        Leave a review
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-heading text-lg font-semibold">
              How was your visit?
            </h2>
            <p className="text-sm text-muted-foreground">
              {serviceName} at {facilityName}
            </p>
          </div>
          <ReviewForm
            key={openKey}
            facilityId={facilityId}
            bookingId={bookingId}
            onSaved={handleSaved}
            onCancel={close}
          />
        </div>
      </dialog>
    </>
  );
}
