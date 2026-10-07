import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-start justify-center gap-5 px-4">
      <Link href="/" className="font-heading text-xl font-bold tracking-tight">
        slot<span className="text-brand-ink">book</span>
      </Link>
      <p className="nums font-heading text-6xl font-bold text-brand-ink">404</p>
      <h1 className="text-3xl font-bold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="text-muted-foreground">
        The link may be broken or the page was moved. Start again from venues near you.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/venues" className={buttonVariants()}>
          Browse venues
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
