import ScoreBadge from '@/components/layout/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_METADATA, type FacilityResponseDTO } from '@slotbook/shared/facility';

function SmallFacilityPreviewCard({
  facility,
  score,
}: {
  facility: FacilityResponseDTO;
  score: number;
}) {
  const { name, address, city, category } = facility;
  return (
    <div className="relative rounded-md p-4 max-w-60 border  overflow-hidden min-w-60">
      <div className="absolute inset-0  z-5 w-full h-full  bg-linear-to-t from-gray-100 to-gray-50"></div>{' '}
      {/*Gradient*/}
      {/* <img src="" alt="" /> */}
      <div className="relative z-10">
        <div className="flex justify-between items-center ">
          {' '}
          <Badge variant={'outline'} className="text-pink-500 rounded-md bg-pink-100 shadow-s">
            {CATEGORY_METADATA[category].label}
          </Badge>
          <ScoreBadge score={score.toFixed(2)} />
        </div>
        <div className="flex flex-col mt-6">
          <h3 className={'text-lg font-bold'}>{name}</h3>
          <p className={'text-md text-gray-600'}>
            {city}, {address}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SmallFacilityPreviewCard;
