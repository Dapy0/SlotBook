function WorkingHours() {
  const hours = [
    { day: 'Mon — Fri', time: '09:00 — 18:00' },
    { day: 'Sat', time: '10:00 — 16:00' },
    { day: 'Sun', time: 'Closed', muted: true },
  ];

  return (
    <div className="w-full  max-w-xs rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business Hours</p>

      <div className="mt-3 flex flex-col divide-y divide-gray-100 ">
        {hours.map((row) => (
          <div key={row.day} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-teal-600">{row.day}</span>
            <span className={row.muted ? 'text-gray-400' : 'font-medium text-gray-900'}>
              {row.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkingHours;
