import { CATEGORY_METADATA } from "@/app/(main)/_common/types";
import BreadCrumbs from "@/components/layout/BreadCrumbs";
import { getCategories } from "@/services/categories";
import * as Icons from "lucide-react";
import { ArrowRight, LayoutGrid, type LucideIcon } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

function CategoryCard({
  href,
  icon: Icon,
  color,
  label,
  description,
  count,
}: {
  href: string;
  icon: LucideIcon;
  color: string;
  label: string;
  description: string;
  count: number;
}) {
  return (
    <Link
      href={href as Route}
      className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-[box-shadow,border-color] duration-200 outline-none hover:border-[color-mix(in_oklch,var(--primary),var(--border)_40%)] hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-center justify-between">
        <span
          className="flex size-11 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)` }}
        >
          <Icon aria-hidden className="size-5" style={{ color }} />
        </span>
        <span className="text-sm text-muted-foreground nums">
          {count} {count === 1 ? "venue" : "venues"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-1.5 font-sans text-base font-semibold">
          {label}
          <ArrowRight
            aria-hidden
            className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

async function CategoriesPage() {
  const cookieStore = await cookies();
  const local = cookieStore.get("_sb_country")?.value || "PL";
  const categories = await getCategories({ country: local });
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <BreadCrumbs />
      <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Categories</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <CategoryCard
            href="/venues"
            icon={LayoutGrid}
            color="var(--foreground)"
            label="All venues"
            description="Everything bookable in your country"
            count={total}
          />
        </li>
        {categories.map(({ count, categoryName }) => {
          const { label, description, icon, color, slug } = CATEGORY_METADATA[categoryName];
          const Icon = Icons[icon as keyof typeof Icons] as unknown as LucideIcon;
          return (
            <li key={categoryName}>
              <CategoryCard
                href={`/venues?${new URLSearchParams({ category: slug })}`}
                icon={Icon}
                color={color}
                label={label}
                description={description}
                count={count}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CategoriesPage;
