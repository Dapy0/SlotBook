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

export default function ReviewsList({
  reviews,
  query = '',
}: {
  reviews: ReviewResponse[];
  query?: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="w-full rounded-sm border border-gray-200 bg-white shadow-sm">
        <p className="px-6 py-8 text-center text-sm text-gray-400">No reviews yet.</p>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? reviews.filter((r) => r.comment?.toLowerCase().includes(q) ?? false)
    : reviews;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-gray-200 bg-white py-4 shadow-sm">
        <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(2)}</span>
        <Stars rating={Math.round(avgRating)} />
        <span className="text-xs text-gray-400">{reviews.length} reviews</span>
      </div>

      <div className="w-full flex-1 rounded-sm border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            No reviews match your search.
          </p>
        ) : (
          <div className="w-full divide-y divide-gray-100">
            {filtered.map((review) => (
              <div key={review.id} className="flex items-start justify-between px-6 py-4">
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
        )}
      </div>
    </div>
  );
}
