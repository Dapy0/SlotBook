export const facilityCategories = [
  'BEAUTY',
  'SPORT_FITNESS',
  'MEDICAL',
  'AUTO',
  'EDUCATION',
  'OTHER',
] as const;
export type FacilityCategory = (typeof facilityCategories)[number];

export type Facility = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: FacilityCategory;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
  images: string[];
};

export type Service = {
  id: string;
  facilityId: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
};

export function formatPrice(priceCents: number, currency: string): string {
  return `${(priceCents / 100).toFixed(2)} ${currency}`;
}

export type CreateServicePayload = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
};

