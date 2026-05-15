import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, List, Map as MapIcon } from 'lucide-react';
import { listVenuesApi, type ListVenuesParams } from '@/api/venues';
import { listSportsApi } from '@/api/sports';
import { myFavoriteIdsApi } from '@/api/favorites';
import { VenueCard } from '@/components/venue/VenueCard';
import { VenueFilters } from '@/components/venue/VenueFilters';
import { VenueMap } from '@/components/venue/VenueMap';
import { Skeleton } from '@/components/common/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import type { Sport, VenueListResponse } from '@/types/api';
import { cn } from '@/lib/cn';

export const VenueList = () => {
  const [params, setParams] = useSearchParams();
  const [sports, setSports] = useState<Sport[]>([]);
  const [data, setData] = useState<VenueListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const user = useAuthStore((s) => s.user);

  const filters = useMemo(
    () => ({
      sport: params.get('sport') ?? '',
      city: params.get('city') ?? '',
      q: params.get('q') ?? '',
      minRating: params.get('minRating') ?? '',
      amenity: params.get('amenity') ?? '',
      sort: (params.get('sort') as 'newest' | 'rating' | 'price_asc' | 'price_desc') ?? 'newest',
    }),
    [params],
  );

  useEffect(() => {
    listSportsApi().then(setSports).catch(() => setSports([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    myFavoriteIdsApi().then(setFavoriteIds).catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    const apiParams: ListVenuesParams = { sort: filters.sort, limit: 50 };
    if (filters.sport) apiParams.sport = filters.sport;
    if (filters.city) apiParams.city = filters.city;
    if (filters.q) apiParams.q = filters.q;
    if (filters.minRating) apiParams.minRating = Number(filters.minRating);
    if (filters.amenity) apiParams.amenity = filters.amenity;
    listVenuesApi(apiParams)
      .then(setData)
      .catch(() => setData({ items: [], page: 1, limit: 50, total: 0, totalPages: 1 }))
      .finally(() => setLoading(false));
  }, [filters.sport, filters.city, filters.q, filters.minRating, filters.amenity, filters.sort]);

  const updateFilters = (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.sport) sp.set('sport', merged.sport);
    if (merged.city) sp.set('city', merged.city);
    if (merged.q) sp.set('q', merged.q);
    if (merged.minRating) sp.set('minRating', merged.minRating);
    if (merged.amenity) sp.set('amenity', merged.amenity);
    if (merged.sort && merged.sort !== 'newest') sp.set('sort', merged.sort);
    setParams(sp, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <div className="h-1 w-12 rounded-full bg-brand-500" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Find a venue</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {data ? `${data.total} ${data.total === 1 ? 'venue' : 'venues'} available` : ' '}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {(['list', 'map'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition',
                view === v ? 'bg-ink-900 text-brand-400' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {v === 'list' ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              {v === 'list' ? 'List' : 'Map'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <VenueFilters sports={sports} values={filters} onChange={updateFilters} />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
            <Compass className="h-5 w-5" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-900">No venues match your filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing some filters or browsing everything.</p>
          <Link
            to="/venues"
            className="mt-4 inline-block rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
          >
            Show all venues
          </Link>
        </div>
      ) : view === 'map' ? (
        <VenueMap venues={data.items} height="640px" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((v) => (
            <VenueCard key={v.id} venue={v} initiallyFavorited={favoriteIds.has(v.id)} />
          ))}
        </div>
      )}
    </div>
  );
};
