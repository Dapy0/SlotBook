import { LazyMap } from "@/app/(main)/venues/[slug]/_components/LazyMap";
import { buttonVariants } from "@/components/ui/button";
import { getMapLink } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface ICardWithMap {
  address: string;
  longitude: number;
  latitude: number;
}
function CardWithMap({ address, latitude, longitude }: ICardWithMap) {
  return (
    <section
      aria-label="Location"
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="h-48 w-full bg-muted">
        <LazyMap latitude={latitude} longitude={longitude} />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="min-w-0 truncate">{address}</span>
        <a
          href={getMapLink(address, latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Open in maps
          <ExternalLink aria-hidden />
        </a>
      </div>
    </section>
  );
}

export default CardWithMap;
