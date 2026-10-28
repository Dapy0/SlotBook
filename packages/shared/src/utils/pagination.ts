export type PageWindowItem = number | "…";
export function getPageWindow(current: number, totalPages: number): PageWindowItem[] {
  if (totalPages === 0) return [];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
  if (current >= totalPages - 3)
    return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

  return [1, "…", current - 1, current, current + 1, "…", totalPages];
}
