export default function ContactInfo({ phone, email }: { phone: string; email: string }) {
  const contacts = [
    { label: "Phone", value: phone, href: `tel:${phone}` },
    { label: "Email", value: email, href: `mailto:${email}` },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-sans text-sm font-semibold">Contact</h2>
      <dl className="mt-2 flex flex-col divide-y divide-border">
        {contacts.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 truncate">
              <a href={row.href} className="font-medium hover:text-brand-ink hover:underline">
                {row.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
