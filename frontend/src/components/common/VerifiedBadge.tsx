import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export const VerifiedBadge = ({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700',
      size === 'sm' ? 'text-[11px]' : 'text-xs',
      className,
    )}
    title="Verified by Sportify"
  >
    <BadgeCheck className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    Verified
  </span>
);
