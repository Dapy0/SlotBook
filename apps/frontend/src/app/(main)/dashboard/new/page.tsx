import { redirect } from "next/navigation";
import { getMe } from "@/lib/session";
import { FacilityForm } from "@/components/facility/FacilityForm";

export default async function NewFacilityPage() {
  const userAuth = await getMe();
  if (userAuth == null) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/new")}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Add your venue</h1>
        <p className="text-muted-foreground">
          It starts as a draft. Clients won&apos;t see it until you publish.
        </p>
      </header>

      <FacilityForm />
    </div>
  );
}
