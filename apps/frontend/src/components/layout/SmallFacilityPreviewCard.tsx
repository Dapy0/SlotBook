import ScoreBadge from "@/components/layout/ScoreBadge";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_METADATA, type FacilityResponse } from "@slotbook/shared/facility";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
function SmallFacilityPreviewCard({ facility }: { facility: FacilityResponse }) {
  const { name, address, city, category, id, score } = facility;
  const Icon = Icons[
    CATEGORY_METADATA[category].icon as keyof typeof Icons
  ] as unknown as LucideIcon;

  return (
    <Link
      href={`venues/${id}`}
      className="relative max-w-60 min-w-60 overflow-hidden rounded-md border p-4"
    >
      <div className="absolute inset-0 z-5 h-full w-full bg-linear-to-t from-gray-100 to-gray-50"></div>{" "}
      {/*Gradient*/}
      {/* <img src="" alt="" /> */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          {" "}
          <Badge variant="outline" className={CATEGORY_METADATA[category].badgeClassName}>
            <Icon />
            {CATEGORY_METADATA[category].label}
          </Badge>
          <ScoreBadge score={score} />
        </div>
        <div className="mt-6 flex flex-col">
          <h3 className={"text-lg font-bold"}>{name}</h3>
          <p className={"text-md text-gray-600"}>
            {city}, {address}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default SmallFacilityPreviewCard;
