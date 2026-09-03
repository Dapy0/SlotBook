import { StarIcon } from 'lucide-react';

const summary = {
  average: 4.7,
  total: 92,
};

const reviews = [
  {
    rating: 5,
    service: 'Single Tone Coloring',
    author: 'Anna K.',
    date: '12 Aug 2026',
    text: 'Came an hour before closing, no one rushed me. The color turned out exactly as agreed.',
  },
  {
    rating: 4,
    service: "Men's Haircut",
    author: 'Marek W.',
    date: '3 Aug 2026',
    text: 'Quick and neat. Waited about five minutes.',
  },
  {
    rating: 5,
    service: 'Styling',
    author: 'Anna K.',
    date: '29 Jul 2026',
    text: 'Booked in the evening for the next morning, the slot was open. Very convenient.',
  },
];

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

export default function ReviewsList() {
  return (
    <div className="flex w-full gap-4 items-start">
      <div className="flex w-40  shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-gray-200 bg-white py-8 shadow-sm">
        <span className="text-4xl font-bold text-gray-900">{summary.average}</span>
        <Stars rating={Math.round(summary.average)} />
        <span className="text-xs text-gray-400">{summary.total} reviews</span>
      </div>

      <div className="flex-1 rounded-sm border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {reviews.map((review, i) => (
            <div key={i} className="flex items-start justify-between px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-gray-400">
                    {review.service} · {review.author}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-800">{review.text}</p>
              </div>
              <span className="ml-4 shrink-0 text-xs text-gray-400">{review.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
