import FiltersSidebar from '@/components/layout/FiltersSidebar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';
import BigFacilityPreviewCard from '@/components/layout/BigFacilityPreviewCard';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
const FACILITIES = [
  {
    category: 'Education',
    tags: ['until 20:00', 'Online and offline'],
    name: 'MathLab Courses',
    score: 5.0,
    reviews: 31,
    city: 'Warszawa',
    address: 'Hoża 51',
    description: 'One-on-one maths and physics lessons: exam prep, 60 or 90 minutes.',
    services: [
      { name: 'Maths, one-on-one', duration: '60 min', price: '120,00 zl' },
      { name: 'Physics, exam prep', duration: '90 min', price: '170,00 zl' },
      { name: 'Homework review', duration: '30 min', price: '70,00 zl' },
    ],
  },
  {
    category: 'Medicine',
    tags: ['until 19:00', 'Kids welcome'],
    name: 'Klinika Dentim',
    score: 4.9,
    reviews: 213,
    city: 'Kraków',
    address: 'Karmelicka 8',
    distance: '0.8 km',
    description: 'Hygiene, treatment and consultations. Strictly by appointment, no queues.',
    services: [
      { name: 'Oral hygiene', duration: '60 min', price: '250,00 zl' },
      { name: 'Consultation', duration: '30 min', price: '100,00 zl' },
      { name: 'Cavity treatment', duration: '90 min', price: '450,00 zl' },
    ],
  },
  {
    category: 'Beauty',
    tags: ['until 18:00', 'Own parking'],
    name: 'Studio Nord',
    score: 4.8,
    reviews: 126,
    city: 'Kraków',
    address: 'Długa 12',
    distance: '1.2 km',
    description:
      'Haircuts, coloring and care in a quiet two-chair studio. One master, one client, no rush.',
    services: [
      { name: "Men's haircut", duration: '30 min', price: '90,00 zl' },
      { name: 'Single-tone coloring', duration: '120 min', price: '320,00 zl' },
      { name: 'Back massage', duration: '60 min', price: '150,00 zl' },
    ],
  },
  {
    category: 'Sport',
    tags: ['until 21:00', 'Mats provided'],
    name: 'Yoga Ośrodek',
    score: 4.7,
    reviews: 58,
    city: 'Kraków',
    address: 'Zabłocie 22',
    distance: '2.1 km',
    description: 'Small group classes in a bright studio by the river. Beginners always welcome.',
    services: [
      { name: 'Group class', duration: '60 min', price: '45,00 zl' },
      { name: 'Private class', duration: '60 min', price: '140,00 zl' },
    ],
  },
];

function Page() {
  return (
    <div className=" ">
      <BreadCrumbs crumbsList={['categories', 'hair']} />
      <div className="flex items-baseline gap-2 mb-6">
        <h1 className="text-3xl font-bold">All facilities</h1>
        <span className="text-gray-400 text-lg">
          {FACILITIES.length} of {FACILITIES.length}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        <FiltersSidebar />

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
            {FACILITIES.map((facility) => (
              <BigFacilityPreviewCard key={facility.name} score={4.6} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
