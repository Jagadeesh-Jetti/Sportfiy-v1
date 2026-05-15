import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { listVenuesApi } from '@/api/venues';
import { getStatsApi } from '@/api/stats';
import { VenueCard } from '@/components/venue/VenueCard';
import type { Stats, Venue } from '@/types/api';

const SPORTS_GRID = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Table Tennis', emoji: '🏓' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Pickleball', emoji: '🥒' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Squash', emoji: '🎯' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Futsal', emoji: '🥅' },
  { name: 'Hockey', emoji: '🏑' },
  { name: 'Box Cricket', emoji: '📦' },
  { name: 'Snooker', emoji: '🎱' },
  { name: 'Skating', emoji: '🛼' },
];

const CITIES = ['Bengaluru', 'Hyderabad'];

const fallbackStats: Stats = { users: 0, venues: 0, sports: 0, bookings: 0, cities: [] };

const TICKER = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Hebbal',
  'Jubilee Hills', 'Gachibowli', 'Banjara Hills', 'Hitech City', 'Madhapur', 'Kondapur',
];

export const Landing = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>(fallbackStats);

  const today = new Date().toISOString().slice(0, 10);
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(today);

  useEffect(() => {
    listVenuesApi({ sort: 'rating', limit: 4 })
      .then((res) => setFeatured(res.items))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
    getStatsApi().then(setStats).catch(() => undefined);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (city) params.set('city', city);
    navigate(`/venues${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div>
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        {/* Soft glows */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        {/* Lime radial accent behind headline */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(132,204,22,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
              <Sparkles className="h-3 w-3" />
              Book · Play · Repeat
            </div>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              Find your court.
              <br />
              Book your slot.
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
                Play your game.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
              Discover turfs, courts, and pools across your city. Book by the hour, in seconds.
              No phone calls, no awkward DMs.
            </p>
          </div>

          {/* Search bar widget */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 grid max-w-3xl gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md sm:grid-cols-[1.2fr_1.2fr_1fr_auto] sm:rounded-full sm:p-1.5"
          >
            <SearchSelect
              label="Sport"
              icon="⚽"
              value={sport}
              onChange={setSport}
              options={[{ value: '', label: 'Any sport' }, ...SPORTS_GRID.map((s) => ({ value: s.name, label: s.name }))]}
            />
            <SearchSelect
              label="City"
              icon="📍"
              value={city}
              onChange={setCity}
              options={[
                { value: '', label: 'Any city' },
                ...CITIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <SearchDate label="Date" value={date} min={today} onChange={setDate} />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-5 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/50 sm:px-4"
              aria-label="Search venues"
            >
              <Search className="h-4 w-4" />
              <span className="sm:sr-only">Search</span>
            </button>
          </form>

          {/* Stats row — wired to live DB counts */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 sm:text-sm">
            <span><strong className="text-white tabular-nums">{stats.users.toLocaleString()}</strong> players</span>
            <span aria-hidden className="text-ink-700">·</span>
            <span><strong className="text-white tabular-nums">{stats.venues.toLocaleString()}</strong> venues</span>
            <span aria-hidden className="text-ink-700">·</span>
            <span><strong className="text-white tabular-nums">{stats.sports}</strong> sports</span>
            <span aria-hidden className="text-ink-700">·</span>
            <span>{stats.cities.length > 0 ? stats.cities.slice(0, 2).join(' + ') : 'Bengaluru + Hyderabad'}</span>
          </div>
        </div>

        {/* City marquee strip */}
        <div className="relative border-t border-white/5 bg-ink-900/50 py-4">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-slate-500">
            {[...TICKER, ...TICKER].map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-500" />
                Live in {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Sports grid ───── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeader
          eyebrow="Pick your sport"
          title="What are you playing today?"
          sub="Tap a sport to jump straight to the venues."
        />
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-[repeat(15,minmax(0,1fr))]">
          {SPORTS_GRID.map((s) => (
            <Link
              key={s.name}
              to={`/venues?sport=${encodeURIComponent(s.name)}`}
              className="group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 text-center transition hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-50 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <span className="text-2xl transition group-hover:scale-110 sm:text-3xl">
                {s.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-slate-700 group-hover:text-brand-800">
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="How it works"
            title="Game on, in 3 taps."
            sub="No accounts to set up if you don't want to. Browse first, book when you're ready."
          />
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {/* Connector */}
            <div
              className="pointer-events-none absolute left-12 right-12 top-16 hidden h-px border-t-2 border-dashed border-slate-300 md:block"
              aria-hidden
            />
            <Step
              num="01"
              icon={<Search className="h-5 w-5" />}
              title="Find a venue"
              body="Filter by sport, city, and price. Real photos, real availability."
            />
            <Step
              num="02"
              icon={<CalendarCheck className="h-5 w-5" />}
              title="Pick your slot"
              body="Live availability. No double-booking — guaranteed at the database level."
            />
            <Step
              num="03"
              icon={<Trophy className="h-5 w-5" />}
              title="Show up & play"
              body="Get instant confirmation, walk in, do your thing. Cancel any time."
            />
          </div>
        </div>
      </section>

      {/* ───── Stats band (dark, wired to live DB counts) ───── */}
      <section className="relative overflow-hidden bg-ink-900 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4"
        >
          <StatBlock value={stats.users.toLocaleString()} label="Active players" />
          <StatBlock value={stats.venues.toLocaleString()} label="Verified venues" />
          <StatBlock value={stats.sports.toString()} label="Sports covered" />
          <StatBlock value={stats.bookings.toLocaleString()} label="Games played" />
        </motion.div>
      </section>

      {/* ───── Featured venues ───── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="This week"
            title="Hot venues right now."
            sub="Hand-picked spots across cities. Booked thousands of times."
            align="left"
          />
          <Link
            to="/venues"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            See all venues
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-8 text-slate-500">No venues yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </section>

      {/* ───── Final CTA band ───── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-950 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20" />
        <div className="pointer-events-none absolute -right-12 -top-32 select-none text-[20rem] font-black leading-none text-white/[0.025]">
          S
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Ready to play?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 md:text-lg">
            Sign up free. Book your first slot in under a minute. Cancel any time —
            no questions asked.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-base font-bold text-ink-900 shadow-xl shadow-brand-500/30 transition hover:shadow-2xl hover:shadow-brand-500/50"
            >
              Sign up free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-brand-400 hover:bg-white/5"
            >
              List your venue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// ──────────────── Helpers ────────────────

const StatBlock = ({ value, label }: { value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center md:text-left"
  >
    <div className="text-4xl font-extrabold text-brand-400 tabular-nums md:text-5xl">{value}</div>
    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400 md:text-sm">{label}</div>
  </motion.div>
);

const SectionHeader = ({
  eyebrow,
  title,
  sub,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
}) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    {eyebrow && (
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
        {eyebrow}
      </div>
    )}
    <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
      {title}
    </h2>
    {sub && <p className="mt-3 text-base leading-relaxed text-slate-600">{sub}</p>}
  </div>
);

const Step = ({
  num,
  icon,
  title,
  body,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-xl hover:shadow-slate-900/5">
    <div className="inline-flex h-9 items-center justify-center rounded-full bg-brand-500 px-3 text-xs font-extrabold tracking-wider text-ink-900">
      {num}
    </div>
    <div className="mt-5 grid h-12 w-12 place-items-center rounded-xl bg-ink-900 text-brand-400">
      {icon}
    </div>
    <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
  </div>
);

const SearchSelect = ({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <label className="group relative flex items-center rounded-full bg-white/0 transition focus-within:bg-white/5">
    <span aria-hidden className="pl-4 pr-2 text-base">{icon}</span>
    <span className="sr-only">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-transparent py-3 pr-8 text-sm font-medium text-white outline-none [&>option]:bg-ink-800 [&>option]:text-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

const SearchDate = ({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) => (
  <label className="group relative flex items-center rounded-full bg-white/0 transition focus-within:bg-white/5">
    <span aria-hidden className="pl-4 pr-2 text-base">📅</span>
    <span className="sr-only">{label}</span>
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent py-3 pr-3 text-sm font-medium text-white outline-none [color-scheme:dark]"
    />
  </label>
);
