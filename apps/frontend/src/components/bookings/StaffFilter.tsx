"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertToSelectFormat } from "@/lib/utils";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  staff: { id: string; name: string }[];
  value: string | null;
};

export function StaffFilter({ staff, value }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(staffId: string | null) {
    const params = new URLSearchParams(searchParams);
    if (staffId) params.set("staff", staffId);
    else params.delete("staff");
    const qs = params.toString();
    router.push(qs ? (`${pathname}?${qs}` as Route) : (pathname as Route));
  }
  const formatted = convertToSelectFormat(staff, "name", "id");
  return (
    <Select value={value ?? ""} onValueChange={(e) => onChange(e)} items={formatted}>
      <SelectTrigger aria-label="Staff member" className="w-48">
        <SelectValue placeholder="All staff" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectItem value={null}>All staff</SelectItem>
          {formatted.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
