import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, reviewCount, size = 'sm' }) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-stone-300 fill-stone-100'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-charcoal">{Number(rating).toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-charcoal-muted">({reviewCount})</span>
      )}
    </div>
  );
};
