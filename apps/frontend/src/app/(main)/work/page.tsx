export default function WorkTodayPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Today</h2>
      <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Your bookings for today will appear here.
      </p>
    </div>
  );
}
