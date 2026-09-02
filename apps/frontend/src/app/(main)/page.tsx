import SearchPanel from '@/components/layout/SearchPanel';
import { Button } from '@/components/ui/button';
import { Circle, Dot } from 'lucide-react';
import s from './main.module.css';
import { RotatingCategory } from '@/components/layout/RotatingCategory';
import SmallFacilityPreviewCard from '@/components/layout/SmallFacilityPreviewCard';
import BigFacilityPreviewCard from '@/components/layout/BigFacilityPreviewCard';
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
      <main className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-semibold">Close to you</h1>
          <div className=" flex flex-wrap gap-8 mt-5">
            <SmallFacilityPreviewCard score={4.8} />
            <SmallFacilityPreviewCard score={4.8} />
            <SmallFacilityPreviewCard score={3.8} />
            <SmallFacilityPreviewCard score={3.8} />
            <SmallFacilityPreviewCard score={4.8} />
            <SmallFacilityPreviewCard score={4.8} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Promoted</h1>
          <div className=" flex flex-col gap-3 mt-5">
            <BigFacilityPreviewCard score={4.8} />
            <BigFacilityPreviewCard score={4.8} />
          </div>
        </div>
      </main>
      <footer className="w-full  mt-20">
        <div className="max-w-3xl my-0 mx-auto text-center  ">
          <p className="m-0 text-xl font-semibold">Как это работает</p>
          <p className="mt-2  text-gray-600">
            Слоты приходят из расписания заведения, поэтому вы видите настоящее свободное время, а
            не «перезвоним и уточним». Запись открыта на 30 дней вперёд, подтверждение приходит в
            Telegram, отменить можно не позднее чем за 2 часа до начала.
          </p>
        </div>
        <div className="border rounded-md overflow-hidden  mt-20">
          <div className="flex items-center justify-between gpa-4 p-4 bg-muted flex-wrap">
            <div>
              <p className="m-0 text-xl font-semibold">У вас своё заведение?</p>
              <p className="mt-2  text-gray-600">
                Заведите услуги, сотрудников и рабочие часы — расписание считается само.
              </p>
            </div>
            <Button className="" variant={'default'}>
              Подключить заведение
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;
