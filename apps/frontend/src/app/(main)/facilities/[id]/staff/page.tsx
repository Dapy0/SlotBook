import { getFacilityById } from "@/services/facilities";
import { getStaffMembersByFacilityId } from "@/services/staff";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type StaffPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: StaffPageProps): Promise<Metadata> {
  const { id } = await params;
  const facility = await getFacilityById(id);

  if (!facility) {
    return { title: "Facility Not Found — SlotBook" };
  }

  return {
    title: `Staff — ${facility.name} — SlotBook`,
    description: `Specialists and team members at ${facility.name}`,
  };
}

export default async function FacilityStaffPage({ params }: StaffPageProps) {
  const { id } = await params;
  const facility = await getFacilityById(id);

  if (!facility) {
    notFound();
  }

  const staffMembers = await getStaffMembersByFacilityId(facility.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <span className="font-(family-name:--font-geist-mono) text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {facility.category}
      </span>
      <h1 className="mt-3 font-heading text-4xl font-medium text-foreground">{facility.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {facility.city} · {facility.address}
      </p>

      {facility.description && (
        <p className="mt-6 text-sm leading-relaxed text-foreground">{facility.description}</p>
      )}

      <div className="mt-12 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-medium text-foreground">Team Members</h2>
        <span className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
          Total: {staffMembers.length}
        </span>
      </div>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {staffMembers.map((staff) => (
          <div key={staff.id} className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground">Staff Member</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    staff.isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {staff.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                Staff ID: {staff.id}
              </p>
              <p className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                User ID: {staff.userId}
              </p>
              <p className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                Joined{" "}
                {new Date(staff.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}

        {staffMembers.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No team members available for this facility yet
          </p>
        )}
      </div>
    </div>
  );
}
