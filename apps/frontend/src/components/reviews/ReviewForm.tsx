"use client";
import { useState } from "react";
import type { CreateReviewRequest } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { createReview } from "@/services/reviews";
import { StarRatingInput } from "./StarRatingInput";

const COMMENT_MAX = 1000;

type Props = {
  facilityId: string;
  bookingId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function ReviewForm({ facilityId, bookingId, onSaved, onCancel }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === null || isPending) return;

    const text = comment.trim();
    const body: CreateReviewRequest = text ? { rating, comment: text } : { rating };

    setIsPending(true);
    setError(null);
    try {
      await createReview(facilityId, bookingId, body);
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Check your connection and try again.",
      );
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <StarRatingInput value={rating} onChange={setRating} disabled={isPending} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`review-comment-${bookingId}`}>What went well or not (optional)</Label>
        <textarea
          id={`review-comment-${bookingId}`}
          value={comment}
          maxLength={COMMENT_MAX}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          disabled={isPending}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <span className="self-end text-xs text-muted-foreground nums">
          {comment.length}/{COMMENT_MAX}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={rating === null || isPending}>
          {isPending ? "Sending…" : "Submit review"}
        </Button>
      </div>
    </form>
  );
}
