"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function MainError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight">This page didn&apos;t load</h1>
      <p className="max-w-prose text-muted-foreground">
        Something went wrong on our side or the connection dropped. Your bookings are safe. Try
        again, or go back to the home page.
      </p>
      {error.digest && (
        <p className="nums text-sm text-muted-foreground">Error code: {error.digest}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>
          <RotateCw aria-hidden />
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
