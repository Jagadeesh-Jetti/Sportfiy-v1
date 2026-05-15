import { Search } from 'lucide-react';
import type { Sport } from '@/types/api';
import { ALL_AMENITIES, AMENITY_META } from '@/constants/amenities';

type Filters = {
  sport: string;
  city: string;
  q: string;
  minRating: string;
  amenity: string;
  sort: 'newest' | 'rating' | 'price_asc' | 'price_desc';
};

type Props = {
  sports: Sport[];
  values: Filters;
  onChange: (next: Partial<Filters>) => void;
};

export const VenueFilters = ({ sports, values, onChange }: Props) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <label className="flex flex-col gap-1 text-sm lg:col-span-2">
          <span className="font-medium text-slate-700">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={values.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Venue or location"
              className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Sport</span>
          <select
            value={values.sport}
            onChange={(e) => onChange({ sport: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
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
          <span className="font-medium text-slate-700">City</span>
          <select
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
          >
            <option value="">All cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Min rating</span>
          <select
            value={values.minRating}
            onChange={(e) => onChange({ minRating: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
          >
            <option value="">Any</option>
            <option value="3">3.0+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Sort by</span>
          <select
            value={values.sort}
            onChange={(e) => onChange({ sort: e.target.value as Filters['sort'] })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
          >
            <option value="newest">Newest</option>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {/* Amenity chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ amenity: '' })}
          className={
            values.amenity === ''
              ? 'rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-brand-400'
              : 'rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700'
          }
        >
          All amenities
        </button>
        {ALL_AMENITIES.map((a) => {
          const meta = AMENITY_META[a];
          const Icon = meta.icon;
          const active = values.amenity === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ amenity: a })}
              className={
                active
                  ? 'inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-brand-400'
                  : 'inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700'
              }
            >
              <Icon className="h-3 w-3" />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
