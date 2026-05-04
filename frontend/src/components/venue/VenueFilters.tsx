import { Search } from 'lucide-react';
import type { Sport } from '@/types/api';

type Props = {
  sports: Sport[];
  values: { sport: string; city: string; q: string };
  onChange: (next: Partial<Props['values']>) => void;
};

export const VenueFilters = ({ sports, values, onChange }: Props) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-neutral-700">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={values.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Venue or location"
              className="w-full rounded-md border border-neutral-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-neutral-700">Sport</span>
          <select
            value={values.sport}
            onChange={(e) => onChange({ sport: e.target.value })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All sports</option>
            {sports.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-neutral-700">City</span>
          <select
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
          {/* City list intentionally short — we currently operate only in Bengaluru and Hyderabad. */}
        </label>
      </div>
    </div>
  );
};
