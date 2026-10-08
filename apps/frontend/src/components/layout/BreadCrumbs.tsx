"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Route } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function constructCrumbsList(path: string): { name: string; link: string }[] {
  const res: { name: string; link: string }[] = [{ name: "Home", link: "/" }];

  const split = path.split("/");
  for (let i = 1; i < split.length; i++) {
    if (i == 1) {
      res.push({ name: formatSlug(split[i]), link: `/${split[i]}` });
      continue;
    }
    res.push({ name: formatSlug(split[i]), link: `${res[i - 1].link}/${split[i]}` });
  }
  return res;
}
function BreadCrumbs() {
  const pathname = usePathname();
  const crumbs = constructCrumbsList(pathname);
  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map(({ name, link }, index) => (
            <Fragment key={name + index}>
              <BreadcrumbItem>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={link as Route}>{name}</Link>} />
                )}
              </BreadcrumbItem>
              {index !== crumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default BreadCrumbs;
