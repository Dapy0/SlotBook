import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_METADATA, FACILITY_CATEGORIES } from '@slotbook/shared/facility';
import { Dot } from 'lucide-react';
import Link from 'next/link';

function FiltersSidebar({
  activeCategory,
  counts,
}: {
  activeCategory: (typeof FACILITY_CATEGORIES)[number];
  counts: Array<{
    categoryName: (typeof FACILITY_CATEGORIES)[number];
    count: number;
  }>;
}) {
  return (
    <aside className="w-65 shrink-0 flex flex-col gap-6 border rounded-md p-4 h-fit">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">CATEGORY</p>
        <div className="flex flex-col gap-1">
          {FACILITY_CATEGORIES.map((category) => {
            const { label, slug, color } = CATEGORY_METADATA[category];
            const isSelected = category === activeCategory;
            const hrefUrl = new URLSearchParams({
              category: slug,
            }).toString();
            const endpoint = `/venues?${hrefUrl}`;
            return (
              <Link href={endpoint}>
                <Button
                  variant={'ghost'}
                  key={category}
                  className={`flex items-center justify-between text-sm rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-gray-100 w-full ${
                    isSelected ? 'bg-gray-100 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>
                  <span className="text-gray-400">
                    {counts.find((el) => el?.categoryName === category)?.count ?? 0}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">CITY</p>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            <SelectItem value="krakow">Kraków</SelectItem>
            <SelectItem value="warszawa">Warszawa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">RATING</p>
        <div className="flex gap-2">
          <Button size="sm" variant="default">
            Any
          </Button>
          <Button size="sm" variant="outline">
            4.5+
          </Button>
          <Button size="sm" variant="outline">
            4.8+
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">PRICE FROM</p>
        <Select defaultValue="any">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="50">Up to 50 zl</SelectItem>
            <SelectItem value="100">Up to 100 zl</SelectItem>
            <SelectItem value="200">Up to 200 zl</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">AVAILABILITY</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox /> Slots available today
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox /> Open on weekends
          </label>
        </div>
      </div>
    </aside>
  );
}

export default FiltersSidebar;
