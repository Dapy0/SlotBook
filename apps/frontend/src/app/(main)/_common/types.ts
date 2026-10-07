import type { FACILITY_CATEGORIES } from "@slotbook/shared";
type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

type CategoryMetadata = {
  label: string;
  description: string;
  icon: string;
  /** Muted dot color. Categories never color whole surfaces (see DESIGN.md). */
  color: string;
  badgeClassName: string;
  slug: string;
};
export const CATEGORY_METADATA = {
  BEAUTY: {
    slug: "beauty",
    label: "Beauty & Wellness",
    description: "Salons, barbers, nails, spa and massage",
    icon: "Sparkles",
    color: "oklch(0.62 0.11 10)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
  SPORT_FITNESS: {
    slug: "sport-fitness",
    label: "Sport & Fitness",
    description: "Gyms, personal training and fitness studios",
    icon: "Dumbbell",
    color: "oklch(0.64 0.12 55)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
  MEDICAL: {
    slug: "medical",
    label: "Medical & Health",
    description: "Clinics, dentists and health specialists",
    icon: "Stethoscope",
    color: "oklch(0.6 0.09 230)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
  AUTO: {
    slug: "auto",
    label: "Auto Services",
    description: "Car service, detailing and repair shops",
    icon: "Car",
    color: "oklch(0.5 0.03 260)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
  EDUCATION: {
    slug: "education",
    label: "Education & Tutoring",
    description: "Private lessons, courses and tutors",
    icon: "GraduationCap",
    color: "oklch(0.55 0.1 285)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
  OTHER: {
    slug: "other",
    label: "Other",
    description: "Everything else",
    icon: "Shapes",
    color: "oklch(0.55 0.02 85)",
    badgeClassName: "rounded-full border-border bg-card text-foreground",
  },
} satisfies Record<FacilityCategory, CategoryMetadata>;
export const CATEGORY_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_METADATA).map(([key, metadata]) => [metadata.slug, key]),
) as Record<string, FacilityCategory>;
