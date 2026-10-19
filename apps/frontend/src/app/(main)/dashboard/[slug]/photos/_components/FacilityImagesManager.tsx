"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import {
  FACILITY_IMAGE_ACCEPT,
  FACILITY_IMAGE_MAX_COUNT,
  type FacilityImage,
  type FacilityImagesResponse,
} from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { imageErrorText, validateImageFile } from "@/lib/imageErrors";
import {
  deleteFacilityImage,
  reorderFacilityImages,
  uploadFacilityImage,
} from "@/services/facilityImages";
import { ImageTile } from "./ImageTile";

type Props = {
  facilityId: string;
  initialImages: FacilityImage[];
};

type Pending = "upload" | "reorder" | `delete:${string}` | null;

export function FacilityImagesManager({ facilityId, initialImages }: Props) {
  const [images, setImages] = useState<FacilityImage[]>(initialImages);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFull = images.length >= FACILITY_IMAGE_MAX_COUNT;
  const busy = pending !== null;

  async function run(kind: Exclude<Pending, null>, action: () => Promise<FacilityImagesResponse>) {
    setPending(kind);
    setError(null);
    try {
      const res = await action();
      setImages(res.images);
    } catch (err) {
      setError(imageErrorText(err));
    } finally {
      setPending(null);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    await run("upload", () => uploadFacilityImage(facilityId, file));
  }

  function handleMove(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;

    const keys = images.map((img) => img.key);
    const [moved] = keys.splice(index, 1);
    if (moved === undefined) return;
    keys.splice(target, 0, moved);

    void run("reorder", () => reorderFacilityImages(facilityId, keys));
  }

  function handleDelete(key: string) {
    void run(`delete:${key}`, () => deleteFacilityImage(facilityId, key));
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground nums">
          {images.length} / {FACILITY_IMAGE_MAX_COUNT}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={FACILITY_IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy || isFull}>
          <ImagePlus aria-hidden />
          {pending === "upload" ? "Uploading…" : "Add photo"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No photos yet. Add the first one, it becomes the cover.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <ImageTile
              key={image.key}
              image={image}
              index={index}
              total={images.length}
              disabled={busy}
              deleting={pending === `delete:${image.key}`}
              onMove={(dir) => handleMove(index, dir)}
              onDelete={() => handleDelete(image.key)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
