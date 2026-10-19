"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import type { FacilityImage } from "@slotbook/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  image: FacilityImage;
  index: number;
  total: number;
  disabled: boolean;
  deleting: boolean;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
};

export function ImageTile({ image, index, total, disabled, deleting, onMove, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Photo ${index + 1}`}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
      {index === 0 && <Badge className="absolute top-2 left-2">Cover</Badge>}

      <div className="flex items-center justify-between gap-1 border-t border-border bg-card p-1.5">
        {confirming ? (
          <>
            <span className="px-1 text-xs">Delete?</span>
            <div className="flex gap-1">
              <Button size="xs" variant="destructive" disabled={disabled} onClick={onDelete}>
                {deleting ? "Deleting…" : "Yes"}
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={disabled}
                onClick={() => setConfirming(false)}
              >
                No
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Move left"
                disabled={disabled || index === 0}
                onClick={() => onMove(-1)}
              >
                <ArrowLeft />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Move right"
                disabled={disabled || index === total - 1}
                onClick={() => onMove(1)}
              >
                <ArrowRight />
              </Button>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete photo"
              disabled={disabled}
              onClick={() => setConfirming(true)}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
