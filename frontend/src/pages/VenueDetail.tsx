import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, IndianRupee, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailabilityApi, getSimilarVenuesApi, getVenueApi } from '@/api/venues';
import { createBookingApi } from '@/api/bookings';
import { myFavoriteIdsApi } from '@/api/favorites';
import { extractError } from '@/api/client';
import { DatePicker } from '@/components/venue/DatePicker';
import { SlotGrid } from '@/components/venue/SlotGrid';
import { AmenityChips } from '@/components/venue/AmenityChips';
import { FavoriteButton } from '@/components/venue/FavoriteButton';
import { ReviewSection } from '@/components/venue/ReviewSection';
import { VenueMap } from '@/components/venue/VenueMap';
import { VenueCard } from '@/components/venue/VenueCard';
import { RatingStars } from '@/components/common/RatingStars';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { useAuthStore } from '@/stores/auth.store';
import type { Slot, Venue } from '@/types/api';

export const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [similar, setSimilar] = useState<Venue[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);

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
    getSimilarVenuesApi(id).then(setSimilar).catch(() => setSimilar([]));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    myFavoriteIdsApi()
      .then((set) => setFavorite(set.has(id)))
      .catch(() => undefined);
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailabilityApi(id, format(date, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

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
      const result = await createBookingApi({
        slotId: selectedSlot.id,
        sportId: selectedSportId,
      });
      toast.success('Booked! Get ready to play.');
      navigate(`/bookings/${result.id}`);
    } catch (err) {
      toast.error(extractError(err));
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
        <div className="aspect-[16/7] animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-slate-800">Couldn't load this venue.</p>
        <p className="mt-1 text-sm text-slate-500">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  const cover = venue.images[0] ?? 'https://placehold.co/1200x600/0a0f1c/a3e635?text=Sportify';
  const gallery = venue.images.slice(1, 4);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative grid gap-3 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-slate-100 md:col-span-2">
          <img src={cover} alt={venue.name} className="aspect-[16/9] w-full object-cover" />
          <div className="absolute right-3 top-3">
            <FavoriteButton venueId={venue.id} initial={favorite} size="md" />
          </div>
        </div>
        <div className="grid gap-3">
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-slate-100">
                <img src={src} alt="" className="aspect-[16/9] w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              More photos coming soon
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-balance">{venue.name}</h1>
            {venue.isVerified && <VerifiedBadge size="md" />}
          </div>
          <p className="mt-2 flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            {venue.address ?? venue.location}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {venue.avgRating !== null && (
              <RatingStars rating={venue.avgRating} count={venue.reviewCount} size="md" />
            )}
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="inline-flex items-center gap-1 hover:text-brand-700"
              >
                <Phone className="h-4 w-4" />
                {venue.phone}
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {venue.sports.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSportId(s.id)}
                className={
                  s.id === selectedSportId
                    ? 'rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-semibold text-brand-400'
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
              <p className="mt-2 leading-relaxed text-slate-700">{venue.description}</p>
            </div>
          )}

          {venue.amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3">
                <AmenityChips amenities={venue.amenities} />
              </div>
            </div>
          )}

          {/* Map */}
          <div className="mt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold">Where you'll play</h2>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                Open in Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-3">
              <VenueMap
                venues={[venue]}
                height="320px"
                center={[venue.lat, venue.lng]}
                zoom={14}
                linkVenues={false}
              />
            </div>
          </div>

          {/* Slot picker */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Pick a date</h2>
            <div className="mt-3">
              <DatePicker selected={date} onSelect={setDate} />
            </div>
            <h2 className="mt-6 text-lg font-semibold">Available slots</h2>
            <p className="mt-1 text-sm text-slate-500">
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

          {/* Owner mini-profile */}
          {venue.owner && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                  {venue.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">Owned by {venue.owner.name}</div>
                  <div className="text-xs text-slate-500">
                    Hosting on Sportify since{' '}
                    {venue.owner.createdAt
                      ? format(new Date(venue.owner.createdAt), 'MMM yyyy')
                      : 'recently'}
                  </div>
                </div>
              </div>
              {venue.owner.bio && (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{venue.owner.bio}</p>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="mt-10">
            <ReviewSection
              venueId={venue.id}
              ownerId={venue.ownerId}
              onAggregateChange={(avg, count) =>
                setVenue((v) => (v ? { ...v, avgRating: avg, reviewCount: count } : v))
              }
            />
          </div>
        </div>

        {/* Sticky booking sidecard */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 md:sticky md:top-20 md:self-start">
          <h2 className="text-base font-semibold">Booking</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                {venue.openingHour}:00 – {venue.closingHour}:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{venue.slotDurationMinutes} min slots</span>
            </div>
            {venue.pricePerHour != null && (
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-400" />
                <span>
                  <strong className="text-slate-900 tabular-nums">{venue.pricePerHour}</strong> / hour
                </span>
              </div>
            )}
          </dl>

          <motion.div
            key={selectedSlot?.id ?? 'empty'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs"
          >
            {selectedSlot ? (
              <>
                <p className="font-semibold text-slate-900">
                  {format(new Date(selectedSlot.startTime), 'EEE, MMM d · HH:mm')} –{' '}
                  {format(new Date(selectedSlot.endTime), 'HH:mm')}
                </p>
                <p className="mt-1 text-slate-500">
                  Sport: {venue.sports.find((s) => s.id === selectedSportId)?.name ?? '—'}
                </p>
              </>
            ) : (
              <p className="text-slate-500">Pick a date and a slot to continue.</p>
            )}
          </motion.div>

          <button
            type="button"
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/50 disabled:opacity-50 disabled:shadow-none"
          >
            {booking ? 'Booking…' : 'Book this slot'}
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Free cancellation up to 24h before the slot.
          </p>
        </aside>
      </div>

      {/* Similar venues */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">Other venues in {venue.city}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
