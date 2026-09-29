export default function FacilityOverviewPage() {
  const stats = [
    { label: "Today", value: "—" },
    { label: "Pending", value: "—" },
    { label: "This week", value: "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-lg border bg-white p-4">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-gray-900">Today&apos;s bookings</h2>
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">
          Bookings will appear here (S5)
        </div>
      </section>
    </div>
  );
}
