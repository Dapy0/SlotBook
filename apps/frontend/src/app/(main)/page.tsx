import SearchPanel from "@/app/(main)/_components/SearchPanel";
import { buttonVariants } from "@/components/ui/button";
import { RotatingCategory } from "@/app/(main)/_components/RotatingCategory";
import SmallFacilityPreviewCard, {
  CategoryDot,
} from "@/app/(main)/_components/SmallFacilityPreviewCard";
import BigFacilityPreviewCard from "@/components/layout/BigFacilityPreviewCard";
import { getCitiesList, searchFacilities } from "@/services/facilities";
import { getCategories } from "@/services/categories";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { createParams } from "@/lib/queryStrings";
import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import type { Route } from "next";

const CATEGORY_WORDS = [
  "a manicure",
  "a haircut",
  "an English lesson",
  "a hair colouring",
  "a guitar lesson",
  "a football pitch",
];

const STEPS = [
  {
    title: "Pick a service",
    text: "Search by venue, service or city and open the price list.",
  },
  {
    title: "Choose a free time",
    text: "Slots come from the staff schedule, so every time you see is really open. Book up to 30 days ahead.",
  },
  {
    title: "The venue confirms",
    text: "Your booking appears in My appointments. Plans changed? Cancel any time before it starts.",
  },
];

async function Page() {
  const cookieStore = await cookies();
  const local = cookieStore.get("_sb_country")?.value || "PL";
  const [facilities, categories, citiesList] = await Promise.all([
    searchFacilities({ country: local, limit: 8, offset: 0 }),
    getCategories({ country: local }),
    getCitiesList({ country: local }),
  ]).catch();

  const countryLabel = new Intl.DisplayNames(["en"], { type: "region" }).of(local) ?? local;
  const topRated = [...facilities]
    .filter((facility) => facility.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-20 pb-8 md:gap-24">
      <section className="grid items-start gap-10 pt-4 md:pt-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="min-h-[4.3em] text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05] font-bold tracking-[-0.03em] sm:min-h-[3.2em]">
            Book <RotatingCategory CATEGORY_WORDS={CATEGORY_WORDS} />
            <br />
            in a slot that&apos;s actually free.
          </h1>
          <p className="max-w-[52ch] text-lg text-muted-foreground">
            Times come straight from each venue&apos;s staff schedule. No phone tag, no
            &ldquo;we&apos;ll call you back to confirm.&rdquo;
          </p>
          <SearchPanel cities={citiesList} />
        </div>

        <nav
          aria-label="Browse by category"
          className="rounded-xl border border-border bg-card p-2 lg:mt-2"
        >
          <p className="px-3 pt-2 pb-3 text-sm font-medium text-muted-foreground">
            Browse by category
          </p>
          <ul className="flex flex-col">
            {categories.map((category) => {
              const meta = CATEGORY_METADATA[category.categoryName];
              return (
                <li key={meta.slug} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/venues?${createParams({ category: meta.slug })}` as Route}
                    className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-150 outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <CategoryDot color={meta.color} />
                    <span className="font-medium">{meta.label}</span>
                    <span className="ml-auto text-sm text-muted-foreground nums">
                      {category.count} {category.count === 1 ? "venue" : "venues"}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              );
            })}
            {categories.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No venues in {countryLabel} yet.
              </li>
            )}
          </ul>
        </nav>
      </section>

      <section aria-labelledby="venues-heading" className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 id="venues-heading" className="text-3xl font-bold tracking-tight">
            Venues in {countryLabel}
          </h2>
          <Link href="/venues" className={buttonVariants({ variant: "link" })}>
            See all
            <ArrowRight aria-hidden />
          </Link>
        </div>
        {facilities.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((facility) => (
              <li key={facility.id}>
                <SmallFacilityPreviewCard facility={facility} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            No venues in {countryLabel} yet. Try another country in the header.
          </p>
        )}
      </section>

      {topRated.length > 0 && (
        <section aria-labelledby="top-heading" className="flex flex-col gap-6">
          <h2 id="top-heading" className="text-3xl font-bold tracking-tight">
            Top rated
          </h2>
          <div className="flex flex-col gap-4">
            {topRated.map((facility) => (
              <BigFacilityPreviewCard key={facility.id} facilityWithServices={facility} />
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="how-heading"
        className="grid gap-10 rounded-2xl bg-secondary px-6 py-10 text-secondary-foreground md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:px-10 md:py-14"
      >
        <div className="flex flex-col gap-3">
          <h2 id="how-heading" className="text-3xl font-bold tracking-tight">
            How booking works
          </h2>
          <p className="text-secondary-foreground/75">
            Real availability, from search to confirmation.
          </p>
        </div>
        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] gap-4 border-t border-secondary-foreground/15 py-5 first:border-t-0 first:pt-0 last:pb-0"
            >
              <span className="font-heading text-2xl font-bold text-primary nums">{i + 1}</span>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-secondary-foreground/75">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:p-10">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Run a venue?</h2>
          <p className="text-muted-foreground">
            Add your services, staff and working hours once. Clients then book the times your
            schedule really has free.
          </p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Manage your venue
          <ArrowRight aria-hidden />
        </Link>
      </section>
    </div>
  );
}

export default Page;
