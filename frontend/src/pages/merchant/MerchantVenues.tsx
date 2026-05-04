import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Pencil, Plus } from 'lucide-react';
import { listMyVenuesApi } from '@/api/venues';
import type { Venue } from '@/types/api';

export const MerchantVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyVenuesApi()
      .then(setVenues)
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your venues</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your courts, hours, and slots.</p>
        </div>
        <Link
          to="/merchant/venues/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New venue
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          ))
        ) : venues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-neutral-700">No venues yet.</p>
            <Link
              to="/merchant/venues/new"
              className="mt-3 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Create your first venue
            </Link>
          </div>
        ) : (
          venues.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-full overflow-hidden rounded-lg bg-neutral-100 sm:h-20 sm:w-28">
                <img
                  src={v.images[0] ?? 'https://placehold.co/200x150/10b981/ffffff?text=S'}
                  alt={v.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Link to={`/venues/${v.id}`} className="font-semibold hover:text-brand-700">
                  {v.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">{v.location}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {v.sports.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/merchant/venues/${v.id}/slots`}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium hover:border-brand-300 hover:text-brand-700"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Slots
                </Link>
                <Link
                  to={`/merchant/venues/${v.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium hover:border-brand-300 hover:text-brand-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
