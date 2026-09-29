import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/session";
import type { Route } from "next";

export default async function DashboardPage() {
  const userAuth = await getMe();
  if (userAuth == null) {
    redirect("/login?next=dashboard");
  }

  const facilities = userAuth.ownedFacilities;

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">My venues</h1>
          <p className="text-sm text-gray-500">Manage bookings, services and staff</p>
        </div>
        <Button disabled>Create venue</Button>
      </header>

      {facilities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <p className="font-medium text-gray-900">You don&apos;t have any venues yet</p>
          <p className="text-sm text-gray-500">
            Create your first venue to start accepting bookings
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <li key={facility.id}>
              <Link
                href={`/dashboard/${facility.slug}` as Route}
                className="flex h-full flex-col gap-3 rounded-lg border bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900">{facility.name}</h2>
                  <Badge
                    variant="outline"
                    className={
                      facility.isPublished
                        ? "border-green-500 bg-green-100 text-green-600"
                        : "border-gray-500 bg-gray-100 text-gray-600"
                    }
                  >
                    {facility.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">/venues/{facility.slug}</p>
                <span className="mt-auto text-sm font-medium text-primary">Open dashboard →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
