import BreadCrumbs from "@/components/layout/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/services/categories";
import { CATEGORY_METADATA } from "@slotbook/shared/facility";
import * as Icons from "lucide-react";
import { FileStack, type LucideIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

async function CategoriesPage() {
  const cookieStore = await cookies();
  const local = cookieStore.get("_sb_country")?.value || "PL";
  const categories = await getCategories({ country: local });

  return (
    <div>
      <BreadCrumbs crumbsList={["categories"]} />
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <Link
          key={"All"}
          href={`/venues`}
          style={{ "--category-color": "blue" } as React.CSSProperties}
          className="group flex flex-col gap-3 rounded-md border p-5 text-left transition-colors hover:border-[color-mix(in_oklch,var(--category-color)_30%,white)] hover:bg-[color-mix(in_oklch,var(--category-color)_7%,white)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-[color-mix(in_oklch,var(--category-color)_15%,white)]">
              <FileStack className="size-5 text-gray-600 transition-colors group-hover:text-(--category-color)" />
            </span>
            <Badge
              variant="default"
              className="shadow-s rounded-md bg-gray-200 text-gray-500 transition-colors group-hover:bg-[color-mix(in_oklch,var(--category-color)_15%,white)] group-hover:text-(--category-color)"
            >
              {categories.reduce((prev, next) => {
                return prev + next.count;
              }, 0)}
            </Badge>
          </div>
          <p className="font-medium">All categories</p>
          <p className="text-sm text-gray-500">Look through all available categories</p>
        </Link>
        {categories.map(({ count, categoryName }) => {
          const { label, description, icon, color, slug } = CATEGORY_METADATA[categoryName];
          const Icon = Icons[icon as keyof typeof Icons] as unknown as LucideIcon;
          const hrefUrl = new URLSearchParams({ category: slug }).toString();
          const endpoint = `/venues?${hrefUrl}`;
          return (
            <Link
              key={categoryName}
              href={endpoint}
              style={{ "--category-color": color } as React.CSSProperties}
              className="group flex flex-col gap-3 rounded-md border p-5 text-left transition-colors hover:border-[color-mix(in_oklch,var(--category-color)_30%,white)] hover:bg-[color-mix(in_oklch,var(--category-color)_7%,white)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-[color-mix(in_oklch,var(--category-color)_15%,white)]">
                  <Icon className="size-5 text-gray-600 transition-colors group-hover:text-(--category-color)" />
                </span>
                <Badge
                  variant="default"
                  className="shadow-s rounded-md bg-gray-200 text-gray-500 transition-colors group-hover:bg-[color-mix(in_oklch,var(--category-color)_15%,white)] group-hover:text-(--category-color)"
                >
                  {count}
                </Badge>
              </div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoriesPage;
