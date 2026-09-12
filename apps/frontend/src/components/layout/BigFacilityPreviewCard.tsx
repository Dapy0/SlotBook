import ScoreBadge from '@/components/layout/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FacilityResponseDTO } from '@slotbook/shared/facility';
import { MapPinIcon } from 'lucide-react';
import Link from 'next/link';

function BigFacilityPreviewCard({ facility }: { facility: FacilityResponseDTO }) {
  const { name, address, city, category, score, reviewsCount, description } = facility;
  return (
    <Link
      href={`venues/${facility.id}`}
      className="relative rounded-md grid grid-cols-[1fr_300px]  border  overflow-hidden w-full"
    >
      <div className="absolute inset-0  z-5 w-full h-full  bg-linear-to-t from-gray-100 to-gray-50"></div>
      {/* <img src="" alt="" /> */}
      <div className="relative z-40 p-4 flex flex-col gap-6">
        <div className="flex items-center  gap-2">
          {' '}
          <Badge variant={'default'} className="text-cyan-500 rounded-md bg-cyan-100 shadow-s">
            Sport
          </Badge>
          <Badge variant={'default'} className="text-gray-500 rounded-md bg-gray-200 shadow-s">
            Rent a racket
          </Badge>
          <Badge variant={'default'} className="text-gray-500 rounded-md bg-gray-200 shadow-s">
            Rent a field
          </Badge>
        </div>
        <div className="flex flex-col  gap-1">
          <h3 className={'text-xl font-bold'}>{name}</h3>
          <div className="flex gap-3 items-center">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={score} />
            <span className="text-xs text-gray-600">{reviewsCount} reviews</span>
            <span className="flex text-gray-600 text-sm gap-0.5 items-center">
              <MapPinIcon size={13} />
              {city} · {address}
            </span>
            <span className="text-sm text-gray-600">4.7 km</span>
          </div>
          <p className={'text-sm text-gray-700'}>{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={'outline'}>All services and time</Button>
          <span className="text-xs text-gray-600">3 services in price list</span>
        </div>
      </div>
      <div className="relative z-40 flex flex-col justify-start rounded-none border-l">
        <Button
          variant={'ghost'}
          className={
            'rounded-none flex justify-between items-center px-3 py-1 h-auto border-b-gray-300'
          }
        >
          <span className="flex flex-col gap-1 items-start">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="font-bold text-sm">80,00 zl</span>
        </Button>
        <Button
          variant={'ghost'}
          className={
            'rounded-none flex justify-between items-center px-3 py-1 h-auto border-b-gray-300'
          }
        >
          <span className="flex flex-col gap-1 items-start">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="font-bold text-sm">80,00 zl</span>
        </Button>
        <Button
          variant={'ghost'}
          className={
            'rounded-none flex justify-between items-center px-3 py-1 h-auto border-b-gray-300'
          }
        >
          <span className="flex flex-col gap-1 items-start">
            <span className="text-sm">Court rent</span>
            <span className="text-xs font-light text-gray-600">60 min</span>
          </span>
          <span className="font-bold text-sm">80,00 zl</span>
        </Button>
        <div className="px-3 py-1 h-full flex flex-col justify-center">
          <Button variant={'default'} className={'w-full'}>
            Select time
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default BigFacilityPreviewCard;
