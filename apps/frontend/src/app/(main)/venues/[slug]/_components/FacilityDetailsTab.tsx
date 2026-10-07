"use client";
import ReviewsList from "@/app/(main)/venues/[slug]/_components/ReviewsList";
import ServicesList from "@/app/(main)/venues/[slug]/_components/ServicesList";
import StaffList from "@/components/layout/StaffList";
import { Input } from "@/components/ui/input";
import { TabsTrigger, TabsContent, Tabs, TabsList } from "@/components/ui/tabs";
import type { ReviewResponse, ServiceResponse, StaffMemberPublicResponse } from "@slotbook/shared";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

function TabCount({ value }: { value: number }) {
  return <span className="nums text-xs font-normal text-muted-foreground">{value}</span>;
}

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

  const searchPlaceholder =
    activeTab === "services"
      ? "Search services"
      : activeTab === "staff"
        ? "Search staff"
        : "Search reviews";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-4">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <TabsList>
          <TabsTrigger value="services">
            Services <TabCount value={services.length} />
          </TabsTrigger>
          <TabsTrigger value="staff">
            Staff <TabCount value={staff.length} />
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews <TabCount value={reviews.length} />
          </TabsTrigger>
        </TabsList>

        <div className="relative sm:w-60">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <TabsContent value="services">
        <ServicesList services={services} query={query} />
      </TabsContent>
      <TabsContent value="staff">
        <StaffList staff={staff} query={query} />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsList reviews={reviews} query={query} />
      </TabsContent>
    </Tabs>
  );
}

export default FacilityDetailsTab;
