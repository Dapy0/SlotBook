import { buttonVariants } from "@/components/ui/button";
import { createParams } from "@/lib/queryStrings";
import type { StaffMemberPublicResponse } from "@slotbook/shared";
import { StarIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffList({
  staff,
  query = "",
}: {
  staff: StaffMemberPublicResponse[];
  query?: string;
}) {
  const q = query.trim().toLowerCase();
  const filtered = staff.filter((s) => s.name.toLowerCase().includes(q));
  const pathname = usePathname();
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {filtered.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {q ? "No staff match your search." : "No staff listed yet."}
        </p>
      )}

      <ul className="divide-y divide-border">
        {filtered.map((member) => {
          const query = createParams({ staff: member.id });
          const hasScore = member.reviewsCount > 0 && member.score != null;
          return (
            <li key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading font-semibold"
                >
                  {member.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{member.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    {hasScore ? (
                      <>
                        <StarIcon aria-hidden className="size-3.5 fill-primary stroke-primary" />
                        <span className="nums font-medium text-foreground">
                          {Number(member.score).toFixed(1)}
                        </span>
                        <span className="nums">
                          ({member.reviewsCount} {member.reviewsCount === 1 ? "review" : "reviews"})
                        </span>
                      </>
                    ) : (
                      "No reviews yet"
                    )}
                  </p>
                </div>
              </div>

              <Link
                href={`${pathname}/book?${query}` as Route}
                aria-label={`Book with ${member.name}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Book
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
