import type { ReviewResponse } from '@slotbook/shared/reviews';
import { StarIcon } from 'lucide-react';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={13}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}
const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function ReviewsList({ reviews }: { reviews: ReviewResponse[] }) {
  const avgRating = reviews.reduce((prev, curr) => prev + curr.rating, 0) / reviews.length;

  if (reviews.length === 0) {
    return (
      <div className="w-full rounded-sm border border-gray-200 bg-white shadow-sm">
        <p className="px-6 py-8 text-center text-sm text-gray-400">
          No services match your search.
        </p>
      </div>
    );
  }
  return (
    <div className="flex w-full gap-4 items-start">
      <div className="flex w-40  shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-gray-200 bg-white py-8 shadow-sm">
        <span className="text-4xl font-bold text-gray-900">{avgRating}</span>
        <Stars rating={Math.round(avgRating)} />
        <span className="text-xs text-gray-400">{reviews.length} reviews</span>
      </div>

      <div className="flex-1 rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100 w-140">
          {reviews.map((review, i) => (
            <div key={i} className="flex items-start justify-between px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-gray-400">
                    {review.serviceName} · {review.staffMemberName}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-800">{review.comment}</p>
              </div>
              <span className="ml-4 shrink-0 text-xs text-gray-400">
                {dateFormatter.format(new Date(review.createdAt))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
