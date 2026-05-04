import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import { cancelBookingApi, listMyBookingsApi } from '@/api/bookings';
import { extractError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Booking } from '@/types/api';

export const MyBookings = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [data, setData] = useState<{ upcoming: Booking[]; past: Booking[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    listMyBookingsApi()
      .then(setData)
      .catch(() => setData({ upcoming: [], past: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelBookingApi(id);
      toast.success('Booking cancelled');
      refresh();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancelling(null);
    }
  };

  const list = data ? data[tab] : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>

      <div className="mt-6 inline-flex rounded-lg border border-neutral-200 bg-white p-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition',
              tab === t ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            {t}
            {data && (
              <span className={cn('ml-2 text-xs', tab === t ? 'text-brand-100' : 'text-neutral-400')}>
                {data[t].length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          ))
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-neutral-700">No {tab} bookings.</p>
            {tab === 'upcoming' && (
              <Link
                to="/venues"
                className="mt-3 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Find a venue
              </Link>
            )}
          </div>
        ) : (
          list.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-full overflow-hidden rounded-lg bg-neutral-100 sm:h-20 sm:w-28">
                <img
                  src={b.venue.images[0] ?? 'https://placehold.co/200x150/10b981/ffffff?text=S'}
                  alt={b.venue.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Link
                  to={`/venues/${b.venue.id}`}
                  className="font-semibold text-neutral-900 hover:text-brand-700"
                >
                  {b.venue.name}
                </Link>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {b.venue.location}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-700">
                  <Calendar className="h-3.5 w-3.5" />
                  {b.slot
                    ? `${format(new Date(b.slot.startTime), 'EEE, MMM d · HH:mm')} – ${format(new Date(b.slot.endTime), 'HH:mm')}`
                    : 'Time TBD'}
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {b.sport.name}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    b.status === 'CONFIRMED' && 'bg-green-50 text-green-700',
                    b.status === 'CANCELLED' && 'bg-red-50 text-red-700',
                    b.status === 'PENDING' && 'bg-amber-50 text-amber-700',
                  )}
                >
                  {b.status}
                </span>
                {tab === 'upcoming' && b.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-red-300 hover:text-red-700 disabled:opacity-60"
                  >
                    <X className="h-3.5 w-3.5" />
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
