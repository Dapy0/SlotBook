import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatPrice(priceCents: number, currency: string): string {
  return `${(priceCents / 100).toFixed(2)} ${currency}`;
}
