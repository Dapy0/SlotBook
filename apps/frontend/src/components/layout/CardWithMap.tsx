import { Map } from '@/components/layout/Map';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ICardWithMap {
  address: string;
  mapLink: string;
}
function CardWithMap({ address, mapLink }: ICardWithMap) {
  return (
    <div className=" rounded-sm border overflow-hidden flex flex-col w-min">
      <div className={'h-50 w-80'}>
        <Map />
      </div>
      <div className="flex  justify-between items-center px-4 py-3 bg-card text-sm">
        <span className="text-sm text-gray-600">{address}</span>
        <Button variant={'ghost'}>
          <Link className='' href={mapLink}>Open in maps</Link>
        </Button>
      </div>
    </div>
  );
}

export default CardWithMap;
