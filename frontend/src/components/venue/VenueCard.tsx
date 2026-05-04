import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import type { Venue } from '@/types/api';

type Props = { venue: Venue };

export const VenueCard = ({ venue }: Props) => {
  const cover = venue.images[0] ?? 'https://placehold.co/800x500/0a0f1c/a3e635?text=Sportify';
  return (
    <Link
      to={`/venues/${venue.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-2xl hover:shadow-slate-900/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={cover}
          alt={venue.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        {/* Bottom gradient for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-900/70 to-transparent" />

        {/* Price pill (top-right) */}
        {venue.pricePerHour != null && (
          <div className="absolute right-3 top-3 rounded-full bg-ink-900/85 px-3 py-1 text-xs font-bold text-brand-400 backdrop-blur-md">
            ₹{venue.pricePerHour}
            <span className="ml-0.5 text-[10px] font-medium text-slate-300">/hr</span>
          </div>
        )}

        {/* Rating badge (bottom-left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          4.8
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-brand-700">
          {venue.name}
        </h3>
        <p className="flex items-start gap-1 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{venue.location}</span>
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {venue.sports.slice(0, 3).map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800"
            >
              {s.name}
            </span>
          ))}
          {venue.sports.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              +{venue.sports.length - 3}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2 text-xs text-slate-500">
          Open {venue.openingHour}:00 – {venue.closingHour}:00
        </div>
      </div>
    </Link>
  );
};
