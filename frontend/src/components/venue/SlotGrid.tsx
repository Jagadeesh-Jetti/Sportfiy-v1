import { format } from 'date-fns';
import { cn } from '@/lib/cn';
import type { Slot } from '@/types/api';

type Props = {
  slots: Slot[];
  loading?: boolean;
  selectedSlotId?: string | null;
  onSelect?: (slot: Slot) => void;
};

export const SlotGrid = ({ slots, loading, selectedSlotId, onSelect }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
        No slots defined for this date yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {slots.map((s) => {
        const start = format(new Date(s.startTime), 'HH:mm');
        const end = format(new Date(s.endTime), 'HH:mm');
        const disabled = !!s.isBooked;
        const selected = selectedSlotId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(s)}
            className={cn(
              'flex flex-col items-center justify-center rounded-md border px-2 py-2 text-xs transition',
              disabled && 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through',
              !disabled && !selected && 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-400',
              selected && 'border-brand-600 bg-brand-600 text-white',
            )}
          >
            <span className="font-semibold">{start}</span>
            <span className={cn('text-[10px]', selected ? 'text-brand-50' : 'text-neutral-400')}>
              – {end}
            </span>
          </button>
        );
      })}
    </div>
  );
};
