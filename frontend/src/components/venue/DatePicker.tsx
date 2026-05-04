import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/cn';

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  daysAhead?: number;
};

export const DatePicker = ({ selected, onSelect, daysAhead = 7 }: Props) => {
  const today = startOfDay(new Date());
  const days = Array.from({ length: daysAhead }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((d) => {
        const isSelected = isSameDay(d, selected);
        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onSelect(d)}
            className={cn(
              'flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg border px-3 py-2 text-sm transition',
              isSelected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300',
            )}
          >
            <span className={cn('text-xs', isSelected ? 'text-brand-50' : 'text-neutral-500')}>
              {format(d, 'EEE')}
            </span>
            <span className="text-base font-semibold">{format(d, 'd')}</span>
            <span className={cn('text-[10px]', isSelected ? 'text-brand-50' : 'text-neutral-400')}>
              {format(d, 'MMM')}
            </span>
          </button>
        );
      })}
    </div>
  );
};
