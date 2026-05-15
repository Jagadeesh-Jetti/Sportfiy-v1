import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { listMyFavoritesApi } from '@/api/favorites';
import { VenueCard } from '@/components/venue/VenueCard';
import { Skeleton } from '@/components/common/Skeleton';
import type { Venue } from '@/types/api';

export const Favorites = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyFavoritesApi()
      .then(setVenues)
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="h-1 w-12 rounded-full bg-brand-500" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Your favorites</h1>
      <p className="mt-1.5 text-sm text-slate-600">Venues you've hearted, all in one place.</p>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}
          </div>
        ) : venues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
              <Heart className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900">No favorites yet.</p>
            <p className="mt-1 text-sm text-slate-500">Tap the heart on a venue to save it for later.</p>
            <Link
              to="/venues"
              className="mt-4 inline-block rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Browse venues
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} initiallyFavorited />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
