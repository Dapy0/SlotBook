"use client";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"] as const;

type Props = {
  value: number | null;
  onChange: (rating: number) => void;
  name?: string;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, name = "rating", disabled }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-1.5">
      <legend className="mb-1 text-sm font-medium">Your rating</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {LABELS.map((label, i) => {
          const rating = i + 1;
          return (
            <label
              key={rating}
              onMouseEnter={() => setHovered(rating)}
              className="cursor-pointer rounded-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
            >
              <input
                type="radio"
                name={name}
                value={rating}
                checked={value === rating}
                onChange={() => onChange(rating)}
                className="sr-only"
              />
              <StarIcon
                aria-hidden
                className={cn(
                  "size-8 transition-colors duration-100",
                  rating <= shown ? "fill-primary stroke-primary" : "fill-muted stroke-border",
                )}
              />
              <span className="sr-only">
                {rating} of 5 stars, {label}
              </span>
            </label>
          );
        })}
        {shown > 0 && (
          <span aria-hidden className="ml-2 text-sm text-muted-foreground">
            {LABELS[shown - 1]}
          </span>
        )}
      </div>
    </fieldset>
  );
}
