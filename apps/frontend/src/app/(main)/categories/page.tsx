import BreadCrumbs from '@/components/layout/BreadCrumbs';
import { Badge } from '@/components/ui/badge';
import {
  Scissors,
  Sparkles,
  Waves,
  Dumbbell,
  Music,
  GraduationCap,
  PersonStanding,
  Camera,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Hair',
    count: 24,
    Icon: Scissors,
    tags: ['Haircut', 'Coloring', 'Styling'],
    priceFrom: '40 zl',
  },
  {
    name: 'Nails & beauty',
    count: 18,
    Icon: Sparkles,
    tags: ['Manicure', 'Lashes', 'Brows'],
    priceFrom: '60 zl',
  },
  {
    name: 'Massage & spa',
    count: 12,
    Icon: Waves,
    tags: ['Relax massage', 'Sauna'],
    priceFrom: '120 zl',
  },
  {
    name: 'Sport & fitness',
    count: 31,
    Icon: Dumbbell,
    tags: ['Padel', 'Gym pass', 'Personal training'],
    priceFrom: '50 zl',
  },
  {
    name: 'Music lessons',
    count: 9,
    Icon: Music,
    tags: ['Guitar', 'Piano', 'Vocals'],
    priceFrom: '80 zl',
  },
  {
    name: 'Language lessons',
    count: 14,
    Icon: GraduationCap,
    tags: ['English', 'Polish', 'Spanish'],
    priceFrom: '70 zl',
  },
  {
    name: 'Kids activities',
    count: 7,
    Icon: PersonStanding,
    tags: ['Swimming', 'Dance'],
    priceFrom: '45 zl',
  },
  {
    name: 'Photography',
    count: 5,
    Icon: Camera,
    tags: ['Portrait', 'Studio rent'],
    priceFrom: '150 zl',
  },
];

function CategoriesPage() {
  return (
    <div>
      <BreadCrumbs crumbsList={['categories']} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
        {CATEGORIES.map(({ name, count, Icon, tags }) => (
          <Link
            key={name}
            className="group rounded-md border p-5 flex flex-col gap-4 text-left transition-colors hover:border-purple-200 hover:bg-purple-50"
            href={`categories/${'hair'}`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center justify-center size-11 rounded-md bg-gray-100 group-hover:bg-purple-100 transition-colors">
                <Icon className="size-5 text-gray-600 group-hover:text-purple-500 transition-colors" />
              </span>
              <Badge
                variant="default"
                className="text-gray-500 rounded-md bg-gray-200 shadow-s group-hover:text-purple-600 group-hover:bg-purple-100"
              >
                {count}
              </Badge>
            </div>
            <p className="font-medium">{name}</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 border rounded-md px-2 py-0.5 group-hover:border-purple-200 group-hover:text-purple-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;
