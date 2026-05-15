import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Share2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cancelBookingApi, getBookingApi } from '@/api/bookings';
import { extractError } from '@/api/client';
import { buildIcs, downloadIcs } from '@/lib/ics';
import { Skeleton } from '@/components/common/Skeleton';
import type { Booking } from '@/types/api';
import { cn } from '@/lib/cn';

export const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookingApi(id)
      .then(setBooking)
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await cancelBookingApi(booking.id);
      toast.success('Booking cancelled');
      const refreshed = await getBookingApi(booking.id);
      setBooking(refreshed);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleShare = async () => {
    if (!booking) return;
    const text = `I'm playing ${booking.sport.name} at ${booking.venue.name}${
      booking.slot ? ` · ${format(new Date(booking.slot.startTime), 'EEE, d MMM · HH:mm')}` : ''
    }. Join via Sportify.`;
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'My Sportify booking', text, url });
        return;
      } catch {
        // user dismissed — fall through
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast.success('Booking link copied');
  };

  const handleCopyCode = async () => {
    if (!booking?.checkInCode) return;
    await navigator.clipboard.writeText(booking.checkInCode);
    toast.success('Check-in code copied');
  };

  const handleAddToCalendar = () => {
    if (!booking?.slot) return;
    const ics = buildIcs({
      uid: booking.id,
      title: `${booking.sport.name} at ${booking.venue.name}`,
      description: `Sportify booking · Check-in code ${booking.checkInCode ?? ''}`,
      location: booking.venue.address ?? booking.venue.location,
      start: new Date(booking.slot.startTime),
      end: new Date(booking.slot.endTime),
    });
    downloadIcs(`sportify-${booking.id.slice(0, 8)}.ics`, ics);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-64 w-full" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-slate-800">Booking not found.</p>
        <Link
          to="/bookings"
          className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Back to my bookings
        </Link>
      </div>
    );
  }

  const isCancelled = booking.status === 'CANCELLED';
  const start = booking.slot ? new Date(booking.slot.startTime) : null;
  const end = booking.slot ? new Date(booking.slot.endTime) : null;
  const mapsUrl =
    booking.venue.lat != null && booking.venue.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${booking.venue.lat},${booking.venue.lng}`
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        My bookings
      </Link>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'mt-4 overflow-hidden rounded-2xl',
          isCancelled ? 'bg-red-50' : 'bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white',
        )}
      >
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-10" />
          <div className="relative flex items-start gap-4">
            <div
              className={cn(
                'grid h-12 w-12 place-items-center rounded-full',
                isCancelled ? 'bg-red-100 text-red-700' : 'bg-brand-500 text-ink-900',
              )}
            >
              {isCancelled ? <X className="h-6 w-6" /> : <Check className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.2em]',
                  isCancelled ? 'text-red-700' : 'text-brand-300',
                )}
              >
                {isCancelled ? 'Cancelled' : 'Confirmed'}
              </div>
              <h1 className={cn('mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl', isCancelled && 'text-red-900')}>
                {booking.sport.name} at {booking.venue.name}
              </h1>
              {start && end && (
                <p className={cn('mt-1 text-sm', isCancelled ? 'text-red-800' : 'text-slate-300')}>
                  {format(start, 'EEEE, d MMM yyyy')} · {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR + check-in card */}
      {!isCancelled && booking.checkInCode && (
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <QRCodeSVG
              value={`sportify-checkin:${booking.id}`}
              size={160}
              level="M"
              fgColor="#0a0f1c"
              bgColor="#ffffff"
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Check-in code
            </p>
            <div className="mt-1 flex items-center gap-3">
              <p className="font-mono text-3xl font-extrabold tabular-nums tracking-widest text-ink-900">
                {booking.checkInCode}
              </p>
              <button
                type="button"
                onClick={handleCopyCode}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-700"
                aria-label="Copy check-in code"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Show the QR or read this code to the venue front desk on arrival.
            </p>
          </div>
        </div>
      )}

      {/* Venue card */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
            <img
              src={booking.venue.images[0] ?? 'https://placehold.co/200x200/0a0f1c/a3e635?text=S'}
              alt={booking.venue.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <Link
              to={`/venues/${booking.venue.id}`}
              className="text-lg font-semibold hover:text-brand-700"
            >
              {booking.venue.name}
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              {booking.venue.address ?? booking.venue.location}
            </p>
            {booking.venue.phone && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${booking.venue.phone}`} className="hover:underline">
                  {booking.venue.phone}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {start && (
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
          >
            <Calendar className="h-4 w-4" />
            Add to calendar
          </button>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
          >
            <ExternalLink className="h-4 w-4" />
            Get directions
          </a>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
        >
          <Share2 className="h-4 w-4" />
          Share booking
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:border-brand-400 hover:text-brand-700"
        >
          <Download className="h-4 w-4" />
          Print
        </button>
      </div>

      {/* Meta + cancel */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Meta label="Sport" value={booking.sport.name} />
          {start && (
            <Meta
              label="Date & time"
              value={`${format(start, 'EEE, d MMM')} · ${format(start, 'HH:mm')}–${end ? format(end, 'HH:mm') : '?'}`}
            />
          )}
          {booking.venue.pricePerHour != null && (
            <Meta label="Price" value={`₹${booking.venue.pricePerHour}/hr`} />
          )}
          <Meta label="Booking ID" value={booking.id.slice(0, 8).toUpperCase()} />
          <Meta label="Booked" value={format(new Date(booking.createdAt), 'd MMM yyyy, HH:mm')} />
        </div>
        {!isCancelled && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </div>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
      <Clock className="h-3 w-3" />
      {label}
    </div>
    <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);
