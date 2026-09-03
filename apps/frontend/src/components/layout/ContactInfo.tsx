import Link from 'next/link';

export default function ContactInfo() {
  const contacts = [
    { label: 'Phone', value: '+48 604 771 350', href: 'tel:+48604771350' },
    { label: 'Email', value: 'studio@yogaosrodek.pl', href: 'mailto:studio@yogaosrodek.pl' },
    { label: 'Instagram', value: '@yoga.osrodek', href: 'https://instagram.com/yoga.osrodek' },
  ];

  return (
    <div className="w-full max-w-xs rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contacts</p>

      <div className="mt-3 flex flex-col divide-y divide-gray-100">
        {contacts.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-teal-600">{row.label}</span>
            <Link
              href={row.href}
              target={row.label === 'Instagram' ? '_blank' : undefined}
              rel={row.label === 'Instagram' ? 'noopener noreferrer' : undefined}
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
