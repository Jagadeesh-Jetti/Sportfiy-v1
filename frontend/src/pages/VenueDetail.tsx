import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, startOfDay } from 'date-fns';
import { Clock, IndianRupee, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailabilityApi, getVenueApi } from '@/api/venues';
import { createBookingApi } from '@/api/bookings';
import { extractError } from '@/api/client';
import { DatePicker } from '@/components/venue/DatePicker';
import { SlotGrid } from '@/components/venue/SlotGrid';
import { useAuthStore } from '@/stores/auth.store';
import type { Slot, Venue } from '@/types/api';

export const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoadingVenue(true);
    setError(null);
    getVenueApi(id)
      .then((v) => {
        setVenue(v);
        setSelectedSportId(v.sports[0]?.id ?? null);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoadingVenue(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailabilityApi(id, format(date, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!user) {
      navigate(`/login?next=/venues/${id}`);
      return;
    }
    if (!selectedSlot || !selectedSportId) {
      toast.error('Pick a slot and a sport first');
      return;
    }
    setBooking(true);
    try {
      await createBookingApi({ slotId: selectedSlot.id, sportId: selectedSportId });
      toast.success('Booked! See it under My Bookings.');
      navigate('/bookings');
    } catch (err) {
      toast.error(extractError(err));
      // Refresh availability since the slot may now be taken.
      if (id) {
        getAvailabilityApi(id, format(date, 'yyyy-MM-dd'))
          .then((res) => setSlots(res.slots))
          .catch(() => undefined);
      }
    } finally {
      setBooking(false);
    }
  };

  if (loadingVenue) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="aspect-[16/7] animate-pulse rounded-xl bg-neutral-100" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-neutral-800">Couldn't load this venue.</p>
        <p className="mt-1 text-sm text-neutral-500">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  const cover = venue.images[0] ?? 'https://placehold.co/1200x600/10b981/ffffff?text=Sportify';
  const gallery = venue.images.slice(1, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-neutral-100 md:col-span-2">
          <img src={cover} alt={venue.name} className="aspect-[16/9] w-full object-cover" />
        </div>
        <div className="grid gap-3">
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-neutral-100">
                <img src={src} alt="" className="aspect-[16/9] w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="grid place-items-center rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
              More photos coming soon
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-neutral-600">
            <MapPin className="h-4 w-4" />
            {venue.address ?? venue.location}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {venue.sports.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSportId(s.id)}
                className={
                  s.id === selectedSportId
                    ? 'rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-semibold text-brand-400 shadow-sm'
                    : 'rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-100'
                }
              >
                {s.name}
              </button>
            ))}
          </div>

          {venue.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">About this venue</h2>
              <p className="mt-2 leading-relaxed text-neutral-700">{venue.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Pick a date</h2>
            <div className="mt-3">
              <DatePicker selected={date} onSelect={setDate} />
            </div>
            <h2 className="mt-6 text-lg font-semibold">Available slots</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {format(date, 'EEEE, MMM d')} — tap a slot to select
            </p>
            <div className="mt-3">
              <SlotGrid
                slots={slots}
                loading={loadingSlots}
                selectedSlotId={selectedSlot?.id ?? null}
                onSelect={setSelectedSlot}
              />
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-neutral-200 bg-white p-5 md:sticky md:top-20 md:self-start">
          <h2 className="text-base font-semibold">Booking</h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>
                {venue.openingHour}:00 – {venue.closingHour}:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>{venue.slotDurationMinutes} min slots</span>
            </div>
            {venue.pricePerHour != null && (
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-neutral-400" />
                <span>
                  <strong className="text-neutral-900">{venue.pricePerHour}</strong> / hour
                </span>
              </div>
            )}
          </dl>

          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs">
            {selectedSlot ? (
              <>
                <p className="font-semibold text-neutral-900">
                  {format(new Date(selectedSlot.startTime), 'EEE, MMM d · HH:mm')} –{' '}
                  {format(new Date(selectedSlot.endTime), 'HH:mm')}
                </p>
                <p className="mt-1 text-neutral-500">
                  Sport: {venue.sports.find((s) => s.id === selectedSportId)?.name ?? '—'}
                </p>
              </>
            ) : (
              <p className="text-neutral-500">Pick a date and a slot to continue.</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/50 disabled:opacity-50 disabled:shadow-none"
          >
            {booking ? 'Booking…' : 'Book this slot'}
          </button>
        </aside>
      </div>
    </div>
  );
};
