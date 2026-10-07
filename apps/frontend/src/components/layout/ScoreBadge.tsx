import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

// One quiet style for every score: the number matters, not a traffic-light color.
function ScoreBadge({ styles = "", score }: { styles?: string; score: number | null }) {
  if (score == null) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground",
          styles,
        )}
      >
        New
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground nums",
        styles,
      )}
    >
      <Star aria-hidden className="size-3 fill-primary stroke-primary" />
      <span aria-hidden>{score.toFixed(1)}</span>
      <span className="sr-only">Rated {score.toFixed(1)} out of 5</span>
    </span>
  );
}

export default ScoreBadge;
