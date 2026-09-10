import Link from 'next/link';
import { MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MapPinOff className="size-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Venue not found</h1>
        <p className="max-w-sm text-muted-foreground">
          This venue doesn&apos;t exist or may have been removed. Check the link, or browse other
          venues near you.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
        <Link href="/categories">
          <Button>Browse venues</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
