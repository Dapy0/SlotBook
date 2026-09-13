import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={retry}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
