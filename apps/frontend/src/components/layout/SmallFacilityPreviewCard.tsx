import ScoreBadge from '@/components/layout/ScoreBadge';
import { Badge } from '@/components/ui/badge';

function SmallFacilityPreviewCard({ score }: { score: number }) {
  return (
    <div className="relative rounded-md p-4 max-w-60 border  overflow-hidden">
      <div className="absolute inset-0  z-5 w-full h-full  bg-linear-to-t from-gray-100 to-gray-50"></div>{' '}
      {/*Gradient*/}
      {/* <img src="" alt="" /> */}
      <div className="relative z-10">
        <div className="flex justify-between items-center  gap-17">
          {' '}
          <Badge variant={'outline'} className="text-pink-500 rounded-md bg-pink-100 shadow-s">
            Красота
          </Badge>
          <ScoreBadge score={score} />
        </div>
        <div className="flex flex-col mt-6">
          <h3 className={'text-lg font-bold'}>Hair studio</h3>
          <p className={'text-md text-gray-600'}>Warsaw, Dolna 1</p>
        </div>
      </div>
    </div>
  );
}

export default SmallFacilityPreviewCard;
