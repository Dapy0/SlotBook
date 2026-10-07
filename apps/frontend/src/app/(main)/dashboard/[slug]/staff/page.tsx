import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import type { ManagedStaffMemberResponse } from "@slotbook/shared";
import { getMe } from "@/lib/session";
import { getFacilityServicesForOwner } from "@/services/service.server";
import { StaffManager } from "./_components/StaffManager";
import { getStaffMembersForOwner } from '@/services/staff.server';

const STATUS_FILTERS = [
  { value: "active", label: "Active" },
  { value: "fired", label: "Former" },
  { value: "all", label: "All" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const isStatusFilter = (v: string | undefined): v is StatusFilter =>
  STATUS_FILTERS.some((f) => f.value === v);

function matchesStatus(member: ManagedStaffMemberResponse, status: StatusFilter) {
  if (status === "all") return true;
  return status === "active" ? member.isActive : !member.isActive;
}

export default async function FacilityStaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const userAuth = await getMe();
  const facility = userAuth?.ownedFacilities.find((facility) => facility.slug == slug);
  if (!facility) notFound();

  const status: StatusFilter = isStatusFilter(query.status) ? query.status : "active";

  const [staff, services] = await Promise.all([
    getStaffMembersForOwner(facility.id),
    getFacilityServicesForOwner(facility.id),
  ]);

  const visible = staff.filter((member) => matchesStatus(member, status));
  const activeCount = staff.filter((member) => member.isActive).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground">
          {activeCount} active · {staff.length - activeCount} former
        </p>
      </header>

      <nav aria-label="Staff status" className="flex gap-1">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.value === status;
          return (
            <Link
              key={f.value}
              href={`?status=${f.value}` as Route}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                isActive ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <StaffManager
        facilityId={facility.id}
        staff={visible}
        services={services}
        emptyTitle={staff.length === 0 ? "No staff yet" : "Nobody here"}
        emptyText={
          staff.length === 0
            ? "Add your first staff member by email so clients can book them"
            : "Try another filter"
        }
      />
    </div>
  );
}
