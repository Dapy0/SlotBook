import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const businesses = [
  { key: "studio-nord", label: "Studio Nord", active: true },
  { key: "padel-krakow", label: "Padel Kraków" },
];

const services = [
  {
    title: "Men's Haircut",
    category: "BEAUTY",
    duration: "30 min",
    price: "90,00 zł",
  },
  {
    title: "Single Tone Coloring",
    category: "BEAUTY",
    duration: "120 min",
    price: "320,00 zł",
  },
  {
    title: "Classic Back Massage",
    category: "BEAUTY",
    duration: "60 min",
    price: "150,00 zł",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Owner Dashboard</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Your Businesses</h1>

      {/* Business switcher */}
      <div className="mt-4 flex gap-2">
        {businesses.map((b) => (
          <button
            key={b.key}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              b.active
                ? "bg-primary text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Services list */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900">Services</h2>
      <div className="mt-3 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {services.map((service) => (
            <div key={service.title} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{service.title}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {service.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{service.duration}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">{service.price}</span>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Edit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add service form */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900">Add Service</h2>
      <div className="mt-3 flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="service-name">Name</Label>
          <Input id="service-name" placeholder="Classic Back Massage" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="service-description">Description</Label>
          <Input id="service-description" placeholder="Optional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-duration">Duration (min)</Label>
            <Input id="service-duration" placeholder="60" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-price">Price (in cents)</Label>
            <Input id="service-price" placeholder="15000" />
          </div>
        </div>

        <Button className="mt-2 w-fit bg-primary text-white hover:bg-primary/90">
          Add Service
        </Button>
      </div>
    </div>
  );
}
