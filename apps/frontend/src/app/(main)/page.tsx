import SearchPanel from '@/components/layout/SearchPanel';
import { Button } from '@/components/ui/button';
import { Circle, Dot } from 'lucide-react';
import s from './main.module.css';
import { RotatingCategory } from '@/components/layout/RotatingCategory';
const CATEGORY_WORDS = [
  'manicure',
  'for a haircut',
  'an english lesson',
  'coloring',
  'guitar lessons',
  'soccer',
];

function Page() {
  return (
    <div>
      <section className="text-center flex flex-col gap-3 justify-center">
        <h1 className="flex items-center justify-center gap-2 text-6xl mt-10">
          Book
          <RotatingCategory CATEGORY_WORDS={CATEGORY_WORDS} />
        </h1>
        <p className="text-l text-gray-400">Books without waiting and "I will recall u later".</p>
        <div className="mx-20 mb-0 mt-10">
          <SearchPanel />
        </div>
        <div className="mt-5">
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORY_WORDS.map((word) => (
              <Button
                key={word + 'category'}
                variant={'outline'}
                className={'text-center text-medium hover:bg-purple-50 hover:border-purple-200'}
              >
                <Dot className={' size-7 [&>circle]:text-purple-400'} />
                {word}
                <span className="text-gray-400 text-xs">4</span>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
