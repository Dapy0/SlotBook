import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dot } from 'lucide-react';
const SIDEBAR_CATEGORIES = [
  { name: 'All', count: 6 },
  { name: 'Beauty', count: 1 },
  { name: 'Sport', count: 2 },
  { name: 'Medicine', count: 1 },
  { name: 'Auto', count: 1 },
  { name: 'Education', count: 1 },
  { name: 'Other', count: 0 },
];
const CATEGORY_STYLES: Record<string, { badge: string; dot: string }> = {
  Education: { badge: 'text-amber-600 bg-amber-100', dot: 'text-amber-400' },
  Medicine: { badge: 'text-emerald-600 bg-emerald-100', dot: 'text-emerald-400' },
  Beauty: { badge: 'text-pink-600 bg-pink-100', dot: 'text-pink-400' },
  Sport: { badge: 'text-cyan-600 bg-cyan-100', dot: 'text-cyan-400' },
  Auto: { badge: 'text-blue-600 bg-blue-100', dot: 'text-blue-400' },
  Other: { badge: 'text-gray-500 bg-gray-200', dot: 'text-gray-400' },
};
function FiltersSidebar() {
  return (
    <aside className="w-65 shrink-0 flex flex-col gap-6 border rounded-md p-4 h-fit">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">CATEGORY</p>
        <div className="flex flex-col gap-1">
          {SIDEBAR_CATEGORIES.map(({ name, count }) => {
            const style = CATEGORY_STYLES[name];
            const isAll = name === 'All';
            return (
              <button
                key={name}
                className={`flex items-center justify-between text-sm rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-gray-100 ${
                  isAll ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  {style && <Dot className={`size-6 [&>circle]:${style.dot}`} />}
                  {name}
                </span>
                <span className="text-gray-400">{count}</span>
              </button>
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
