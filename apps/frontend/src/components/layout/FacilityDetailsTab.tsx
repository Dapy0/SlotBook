'use client';
import ReviewsList from '@/components/layout/ReviewsList';
import ServicesList from '@/components/layout/ServicesList';
import StaffList from '@/components/layout/StaffList';
import { TabsTrigger, TabsContent, Tabs, TabsList } from '@/components/ui/tabs';
import type { ServiceResponseDTO } from '@slotbook/shared/service';
import type { StaffMemberResponseDTO } from '@slotbook/shared/staffMembers';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';

function FacilityDetailsTab({
  services,
  staff,
  // reviews,
}: {
  services: ServiceResponseDTO[];
  staff: StaffMemberResponseDTO[];
  // reviews;
}) {
  const [activeTab, setActiveTab] = useState('services');
  const [query, setQuery] = useState('');

  const showSearch = activeTab === 'services' || activeTab === 'staff';
  const searchPlaceholder = activeTab === 'services' ? 'Search services' : 'Search staff';

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList variant="line">
            <TabsTrigger value="services">
              Services{' '}
              <span className="text-gray-400 font-light text-xs">{services.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="staff">
              Staff <span className="text-gray-400 font-light text-xs">{staff.length || 0}</span>
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
          <ServicesList services={services} query={query} />
        </TabsContent>
        <TabsContent value="staff" className="mt-3">
          <StaffList staff={staff} query={query} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-3">
          <ReviewsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FacilityDetailsTab;
