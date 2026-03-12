import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number | null;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({ rating, maxStars = 5, size = 16, interactive = false, onChange }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i < (rating ?? 0)
              ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]'
              : 'text-[hsl(var(--star-inactive))]',
            interactive && 'cursor-pointer hover:text-[hsl(var(--gold))]'
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
};

export default StarRating;
