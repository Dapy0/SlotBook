import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  size?: "sm" | "md";
};

export function Stars({ rating, size = "sm" }: Props) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          aria-hidden
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            i < filled ? "fill-primary stroke-primary" : "fill-muted stroke-border",
          )}
        />
      ))}
    </div>
  );
}
