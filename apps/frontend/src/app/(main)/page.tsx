import SearchPanel from "@/components/layout/SearchPanel";
import { Button } from "@/components/ui/button";
import { Circle, Dot } from "lucide-react";
import s from "./main.module.css";
import { RotatingCategory } from "@/components/layout/RotatingCategory";
import SmallFacilityPreviewCard from "@/components/layout/SmallFacilityPreviewCard";
import BigFacilityPreviewCard from "@/app/(main)/venues/_components/BigFacilityPreviewCard";
import { getFacilities } from "@/services/facilities";
import { getCategories } from "@/services/categories";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from "@/lib/utils";
import { cookies } from "next/headers";
import { CATEGORY_METADATA } from "@slotbook/shared/facility";
import Link from "next/link";
const CATEGORY_WORDS = [
  "manicure",
  "for a haircut",
  "an english lesson",
  "coloring",
  "guitar lessons",
  "soccer",
];

async function Page() {
  const cookieStore = await cookies();
  const local = cookieStore.get("_sb_country")?.value || "PL";
  const [facilities, categories] = await Promise.all([
    getFacilities({ country: local, limit: 8 }),
    getCategories({ country: local, limit: 4 }),
  ]).catch();
  return (
    <div>
      <section className="flex flex-col justify-center gap-3 text-center">
        <h1 className="mt-10 flex items-center justify-center gap-2 text-6xl">
          Book
          <RotatingCategory CATEGORY_WORDS={CATEGORY_WORDS} />
        </h1>
        <p className="text-l text-gray-400">Books without waiting and "I will recall u later".</p>
        <div className="mx-20 mt-10 mb-0">
          <SearchPanel />
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap justify-center gap-2">
            <Suspense
              fallback={Array.from({ length: 5 }).map((index) => (
                <Skeleton key={`skel-cat-${index}`} className="w-20" />
              ))}
            >
              {categories.map((category) => (
                <Button
                  key={CATEGORY_METADATA[category.categoryName].label}
                  variant={"outline"}
                  style={
                    {
                      "--icon-color-temp": CATEGORY_METADATA[category.categoryName].color,
                    } as React.CSSProperties
                  }
                  className={
                    "text-medium text-center hover:border-(--icon-color-temp) hover:bg-[color-mix(in_oklch,var(--icon-color-temp)_15%,white)]"
                  }
                >
                  <Dot className={`size-7 [&>circle]:text-(--icon-color-temp)`} />
                  {CATEGORY_METADATA[category.categoryName].label}
                  <span className="text-xs text-gray-400">{category.count}</span>
                </Button>
              ))}
            </Suspense>
          </div>
        </div>
      </section>
      <main className="mt-20 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-semibold">Close to you</h1>
          <div className="mt-5 flex flex-wrap gap-8">
            {facilities.map((facility) => (
              <SmallFacilityPreviewCard key={facility.id} facility={facility} />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Promoted</h1>
          <div className="mt-5 flex flex-col gap-3">
            {facilities.slice(1, 6).map((facility) => (
              <BigFacilityPreviewCard facility={facility} />
            ))}
          </div>
        </div>
      </main>
      <footer className="mt-20 w-full">
        <div className="mx-auto my-0 max-w-3xl text-center">
          <p className="m-0 text-xl font-semibold">How it works</p>
          <p className="mt-2 text-gray-600">
            Slots come directly from the venue's schedule, so you see actual availability — not
            "we'll call you back to confirm." Bookings are open 30 days ahead, confirmation comes
            via Telegram, and you can cancel up to 2 hours before the start.
          </p>
        </div>
        <div className="mt-20 overflow-hidden rounded-md border">
          <div className="gpa-4 flex flex-wrap items-center justify-between bg-muted p-4">
            <div>
              <p className="m-0 text-xl font-semibold">Have your own venue?</p>
              <p className="mt-2 text-gray-600">
                Set up your services, staff, and working hours — the schedule builds itself.
              </p>
            </div>
            <Button className="" variant={"default"}>
              Add your venue
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;
