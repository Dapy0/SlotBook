"use client";

import dynamic from "next/dynamic";

// mapbox-gl is heavy, so it loads only on the client and after the rest of the page.
export const LazyMap = dynamic(
  () => import("@/app/(main)/venues/[slug]/_components/Map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => <div className="size-full animate-pulse bg-muted" aria-hidden />,
  },
);
