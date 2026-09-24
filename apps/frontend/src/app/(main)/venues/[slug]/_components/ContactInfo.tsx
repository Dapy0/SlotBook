import type { Route } from 'next';
import Link from "next/link";

export default function ContactInfo({ phone, email }: { phone: string; email: string }) {
  const contacts = [
    { label: "Phone", value: phone, href: `tel:${phone}` },
    { label: "Email", value: email, href: `mailto:${email}` },
  ];

  return (
    <div className="w-full max-w-xs rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Contacts</p>

      <div className="mt-3 flex flex-col divide-y divide-gray-100">
        {contacts.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-teal-600">{row.label}</span>
            <Link
              href={row.href as Route}
              target={row.label === "Instagram" ? "_blank" : undefined}
              rel={row.label === "Instagram" ? "noopener noreferrer" : undefined}
              className="font-medium text-gray-900 hover:underline"
            >
              {row.value}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
