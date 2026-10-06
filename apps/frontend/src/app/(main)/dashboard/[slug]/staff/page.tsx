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
  { value: "fired", label: "Fired" },
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
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <p className="text-sm text-gray-500">
          {activeCount} active · {staff.length - activeCount} fired
        </p>
      </header>

      <nav className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.value === status;
          return (
            <Link
              key={f.value}
              href={`?status=${f.value}` as Route}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
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
