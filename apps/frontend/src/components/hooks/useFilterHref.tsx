'use client';
import { useSearchParams, useRouter } from 'next/navigation';

export function useFilterHref() {
  const searchParams = useSearchParams();

  return (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    params.delete('page');
    const qs = params.toString();
    return qs ? `/venues?${qs}` : '/venues';
  };
}
