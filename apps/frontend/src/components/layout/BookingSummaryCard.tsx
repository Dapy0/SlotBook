import ScoreBadge from "@/components/layout/ScoreBadge";
import { Button } from "@/components/ui/button";

type BookingSummaryProps = {
  businessName: string;
  city: string;
  address: string;
  score: number | null;
  reviewsCount: number;
  service: string;
  duration: string;
  date: string;
  time: string;
  price: string;
  onConfirm?: () => void;
};

export default function BookingSummaryCard({
  businessName,
  city,
  address,
  score,
  reviewsCount,
  service,
  duration,
  date,
  time,
  price,
  onConfirm,
}: BookingSummaryProps) {
  return (
    <div className="w-full max-w-xs">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Business */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Business</p>
          <p className="mt-1 text-base font-semibold text-gray-900">{businessName}</p>
          <p className="text-sm text-gray-500">
            {city} · {address}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <ScoreBadge styles="text-sm py-0.5! px-0.5" score={score} />
            <span className="text-sm text-gray-500">{reviewsCount} reviews</span>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Booking details */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Booking details
          </p>
          <div className="mt-2 divide-y divide-gray-100">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{service}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">{duration}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{date}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-primary">{time}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-4">
          <span className="text-sm font-medium text-gray-900">Due on-site</span>
          <span className="text-lg font-bold text-gray-900">{price}</span>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        className="mt-4 w-full bg-primary py-6 text-base font-medium text-white hover:bg-primary/90"
      >
        Book {time}
      </Button>
    </div>
  );
}
