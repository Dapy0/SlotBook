import ScoreBadge from "@/components/layout/ScoreBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacilityResponse } from "@slotbook/shared/facility";
import { MapPinIcon } from "lucide-react";
import Link from "next/link";

function BigFacilityPreviewCard({ facility }: { facility: FacilityResponse }) {
  const { name, address, city, category, score, reviewsCount, description } = facility;
  return (
    <Link
      href={`/venues/${facility.id}`}
      className="relative grid w-full grid-cols-[1fr_300px] overflow-hidden rounded-md border"
    >
      <div className="absolute inset-0 z-5 h-full w-full bg-linear-to-t from-gray-100 to-gray-50"></div>
      {/* <img src="" alt="" /> */}
      <div className="relative z-40 flex flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          {" "}
          <Badge variant={"default"} className="shadow-s rounded-md bg-cyan-100 text-cyan-500">
            Sport
          </Badge>
          <Badge variant={"default"} className="shadow-s rounded-md bg-gray-200 text-gray-500">
            Rent a racket
          </Badge>
          <Badge variant={"default"} className="shadow-s rounded-md bg-gray-200 text-gray-500">
            Rent a field
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className={"text-xl font-bold"}>{name}</h3>
          <div className="flex items-center gap-3">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={score} />
            <span className="text-xs text-gray-600">{reviewsCount} reviews</span>
            <span className="flex items-center gap-0.5 text-sm text-gray-600">
              <MapPinIcon size={13} />
              {city} · {address}
            </span>
            <span className="text-sm text-gray-600">4.7 km</span>
          </div>
          <p className={"text-sm text-gray-700"}>{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={"outline"}>All services and time</Button>
          <span className="text-xs text-gray-600">3 services in price list</span>
        </div>
      </div>
      <div className="relative z-40 flex flex-col justify-start rounded-none border-l">
        <Button
          variant={"ghost"}
          className={
            "flex h-auto items-center justify-between rounded-none border-b-gray-300 px-3 py-1"
          }
        >
          <span className="flex flex-col items-start gap-1">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="text-sm font-bold">80,00 zl</span>
        </Button>
        <Button
          variant={"ghost"}
          className={
            "flex h-auto items-center justify-between rounded-none border-b-gray-300 px-3 py-1"
          }
        >
          <span className="flex flex-col items-start gap-1">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="text-sm font-bold">80,00 zl</span>
        </Button>
        <Button
          variant={"ghost"}
          className={
            "flex h-auto items-center justify-between rounded-none border-b-gray-300 px-3 py-1"
          }
        >
          <span className="flex flex-col items-start gap-1">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="text-sm font-bold">80,00 zl</span>
        </Button>
        <div className="flex h-full flex-col justify-center px-3 py-1">
          <Button variant={"default"} className={"w-full"}>
            Select time
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default BigFacilityPreviewCard;
