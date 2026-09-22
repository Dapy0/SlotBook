"use client";
import ReviewsList from "@/app/(main)/venues/[slug]/_components/ReviewsList";
import ServicesList from "@/app/(main)/venues/[slug]/_components/ServicesList";
import StaffList from "@/components/layout/StaffList";
import { TabsTrigger, TabsContent, Tabs, TabsList } from "@/components/ui/tabs";
import type { ReviewResponse, ServiceResponse, StaffMemberPublicResponse } from "@slotbook/shared";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

function FacilityDetailsTab({
  services,
  staff,
  reviews,
}: {
  services: ServiceResponse[];
  staff: StaffMemberPublicResponse[];
  reviews: ReviewResponse[];
}) {
  const [activeTab, setActiveTab] = useState("services");
  const [query, setQuery] = useState("");

  const showSearch = activeTab === "services" || activeTab === "staff" || activeTab === "reviews";
  const searchPlaceholder =
    activeTab === "services"
      ? "Search services"
      : activeTab === "staff"
        ? "Search staff"
        : "Search reviews";

  return (
    <div className="w-full max-w-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex w-full items-center gap-4">
          <TabsList variant="line">
            <TabsTrigger value="services">
              Services{" "}
              <span className="text-xs font-light text-gray-400">{services.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="staff">
              Staff <span className="text-xs font-light text-gray-400">{staff.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews{" "}
              <span className="text-xs font-light text-gray-400">{reviews.length || 0}</span>
            </TabsTrigger>
          </TabsList>

          {showSearch && (
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-56 rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none"
              />
              <SearchIcon
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
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
          <ReviewsList reviews={reviews} query={query} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FacilityDetailsTab;
