"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  staff: { id: string; name: string }[];
  value: string | null; // выбранный мастер из URL
};

export function StaffFilter({ staff, value }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(staffId: string) {
    // TODO 3: скопировать текущие searchParams, поставить или удалить "staff",
    //         router.push(`${pathname}?${params}`)
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-white px-3 text-sm"
    >
      <option value="">All staff</option>
      {staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
