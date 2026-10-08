import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent">
        <MapPinOff aria-hidden className="size-8 text-brand-ink" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Venue not found</h1>
        <p className="max-w-sm text-muted-foreground">
          This venue doesn&apos;t exist or may have been removed. Check the link, or browse other
          venues.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
        <Link href="/venues" className={buttonVariants()}>
          Browse venues
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
