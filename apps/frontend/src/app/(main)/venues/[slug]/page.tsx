'use client';

import { useState } from 'react';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import type { FacilityResponseDTO } from '@slotbook/shared/facility';
import { Badge } from '@/components/ui/badge';
import ScoreBadge from '@/components/layout/ScoreBadge';
import { MapPinIcon, SearchIcon } from 'lucide-react';
import CardWithMap from '@/components/layout/CardWithMap';
import WorkingHours from '@/components/layout/WorkingHours';
import ContactInfo from '@/components/layout/ContactInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServicesList from '@/components/layout/ServicesList';
import StaffList from '@/components/layout/StaffList';
import ReviewsList from '@/components/layout/ReviewsList';
// import StaffList from '@/components/layout/StaffList';
// import ReviewsList from '@/components/layout/ReviewsList';

function Page({
  address,
  category,
  city,
  createdAt,
  description,
  email,
  id,
  images,
  isPublished,
  name,
  phone,
  slug,
  timezoneIANA,
}: FacilityResponseDTO) {
  const [activeTab, setActiveTab] = useState('services');
  const [query, setQuery] = useState('');

  const showSearch = activeTab === 'services' || activeTab === 'staff';
  const searchPlaceholder = activeTab === 'services' ? 'Search services' : 'Search staff';

  return (
    <div className="">
      <BreadCrumbs crumbsList={['categories', 'hair', name]} />
      <div className="flex gap-10">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={'default'} className="text-cyan-500 rounded-md bg-cyan-100 shadow-s">
              Sport
            </Badge>
            <Badge variant={'default'} className="text-cyan-500 rounded-md bg-cyan-100 shadow-s">
              Sport
            </Badge>
            <Badge variant={'default'} className="text-cyan-500 rounded-md bg-cyan-100 shadow-s">
              Sport
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">Padel Club</h1>
          <div className="flex gap-3 items-center">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={4.8} />
            <span className="text-xs text-gray-600">84 reviews</span>
            <span className="flex text-gray-600 text-sm gap-0.5 items-center">
              <MapPinIcon size={13} />
              Kraków · Wielicka 44
            </span>
            <span className="text-sm text-gray-600">4.7 km</span>
          </div>
          <p className={'text-sm text-gray-700'}>
            Four indoor courts, racket and ball rental, showers. Hourly booking, payment on site.
          </p>

          <main className="flex flex-col gap-3 mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList variant="line">
                  <TabsTrigger value="services">
                    Services <span className="text-gray-400 font-light text-xs">3</span>
                  </TabsTrigger>
                  <TabsTrigger value="staff">
                    Staff <span className="text-gray-400 font-light text-xs">2</span>
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews <span className="text-gray-400 font-light text-xs">68</span>
                  </TabsTrigger>
                </TabsList>

                {showSearch && (
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-56 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none"
                    />
                    <SearchIcon
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                )}
              </div>

              <TabsContent value="services" className="mt-3">
                <ServicesList query={query} />
              </TabsContent>
              <TabsContent value="staff" className="mt-3">
                <StaffList query={query} />
              </TabsContent>
              <TabsContent value="reviews" className="mt-3">
                <ReviewsList />
              </TabsContent>
            </Tabs>
          </main>
        </div>
        <div className="flex flex-col gap-3">
          <CardWithMap address={'Kraków · Wielicka 44'} mapLink="s" />
          <WorkingHours />
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}

export default Page;
