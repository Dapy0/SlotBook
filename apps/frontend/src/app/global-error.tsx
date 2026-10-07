"use client";
import "./globals.css";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-4">
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">
            The page couldn&apos;t load. Try again, and if it keeps happening, come back in a few
            minutes.
          </p>
          {error.digest && (
            <p className="nums text-sm text-muted-foreground">Error code: {error.digest}</p>
          )}
          <Button onClick={retry}>Try again</Button>
        </main>
      </body>
    </html>
  );
}
