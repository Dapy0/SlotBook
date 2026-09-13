import { Map } from "@/components/layout/Map";
import { Button } from "@/components/ui/button";
import { getMapLink } from "@/lib/utils";
import Link from "next/link";

interface ICardWithMap {
  address: string;
  longitude: number;
  latitude: number;
  // mapLink: string;
}
function CardWithMap({ address, latitude, longitude }: ICardWithMap) {
  return (
    <div className="flex w-min flex-col overflow-hidden rounded-sm border">
      <div className={"h-50 w-80"}>
        <Map latitude={latitude} longitude={longitude} />
      </div>
      <div className="flex items-center justify-between bg-card px-4 py-3 text-sm">
        <span className="text-sm text-gray-600">{address}</span>
        <Button variant={"ghost"}>
          <Link className="" href={getMapLink(address, latitude, longitude)}>
            Open in maps
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default CardWithMap;
