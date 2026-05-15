import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  rating: number; // 0..5
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: false;
  className?: string;
};

type InteractiveProps = Omit<Props, 'interactive'> & {
  interactive: true;
  onChange: (rating: number) => void;
};

export const RatingStars = (props: Props | InteractiveProps) => {
  const { rating, size = 'md', showCount = true, count, className } = props;
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  } as const;
  const stars = [1, 2, 3, 4, 5];

  if (props.interactive) {
    return (
      <div className={cn('inline-flex items-center gap-0.5', className)}>
        {stars.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => props.onChange(n)}
            className="transition hover:scale-110"
            aria-label={`Rate ${n} ${n === 1 ? 'star' : 'stars'}`}
          >
            <Star
              className={cn(
                sizes[size],
                n <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300',
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star className={cn(sizes[size], 'fill-amber-500 text-amber-500')} />
      <span className="font-semibold tabular-nums text-slate-900">{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-xs text-slate-500">({count})</span>
      )}
    </span>
  );
};
