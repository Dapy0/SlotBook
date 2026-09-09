import ScoreBadge from '@/components/layout/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_METADATA, type FacilityResponseDTO } from '@slotbook/shared/facility';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
function SmallFacilityPreviewCard({ facility }: { facility: FacilityResponseDTO }) {
  const { name, address, city, category, id } = facility;
  const Icon = Icons[
    CATEGORY_METADATA[category].icon as keyof typeof Icons
  ] as unknown as LucideIcon;

  return (
    <Link
      href={`venues/${id}`}
      className="relative rounded-md p-4 max-w-60 border  overflow-hidden min-w-60"
    >
      <div className="absolute inset-0  z-5 w-full h-full  bg-linear-to-t from-gray-100 to-gray-50"></div>{' '}
      {/*Gradient*/}
      {/* <img src="" alt="" /> */}
      <div className="relative z-10">
        <div className="flex justify-between items-center ">
          {' '}
          <Badge variant="outline" className={CATEGORY_METADATA[category].badgeClassName}>
            <Icon />
            {CATEGORY_METADATA[category].label}
          </Badge>
          <ScoreBadge score={facility.score} />
        </div>
        <div className="flex flex-col mt-6">
          <h3 className={'text-lg font-bold'}>{name}</h3>
          <p className={'text-md text-gray-600'}>
            {city}, {address}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default SmallFacilityPreviewCard;
