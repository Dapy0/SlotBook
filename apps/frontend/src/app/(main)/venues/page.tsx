import BigFacilityPreviewCard from '@/components/layout/BigFacilityPreviewCard';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import FiltersSidebar from '@/components/layout/FiltersSidebar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategories } from '@/services/categories';
import { getFacilities } from '@/services/facilities';
import { CATEGORY_BY_SLUG } from '@slotbook/shared/facility';
import { SearchIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { count } from 'drizzle-orm';

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  let { category = '' } = await searchParams;
  const cookieStore = await cookies();
  const local = cookieStore.get('_sb_country')?.value || 'PL';
  const categoryName = CATEGORY_BY_SLUG[category];
  const facilities = await getFacilities({ country: local, category: categoryName });
  const categories = await getCategories({ country: local });
  const countAll = categories.reduce((prev, next) => {
    return prev + next.count;
  }, 0);
  categories.push({
    categoryName: 'ALL',
    count: countAll,
  });
  return (
    <div className="">
      <BreadCrumbs crumbsList={['categories', category]} />
      <div className="flex items-baseline gap-2 mb-6">
        <h1 className="text-3xl font-bold">{category} Venues</h1>
        <span className="text-gray-400 text-lg">
          {categories.find((el) => el.categoryName == categoryName)?.count || 0} of {countAll}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        <FiltersSidebar activeCategory={categoryName} counts={categories} />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input placeholder="Refine results" className="pl-9" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">SORT BY</span>
              <Select defaultValue="rating">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">By rating</SelectItem>
                  <SelectItem value="distance">By distance</SelectItem>
                  <SelectItem value="price">By price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {facilities.map((facility) => (
              <BigFacilityPreviewCard key={facility.name} score={4.6} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
