import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import { listActivitiesApi } from '@/api/activities';
import { listSportsApi } from '@/api/sports';
import { Skeleton } from '@/components/common/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import type { Activity, Sport } from '@/types/api';

export const Play = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [params, setParams] = useSearchParams();
  const [sports, setSports] = useState<Sport[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(
    () => ({
      sport: params.get('sport') ?? '',
      city: params.get('city') ?? '',
    }),
    [params],
  );

  useEffect(() => {
    listSportsApi().then(setSports).catch(() => setSports([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    listActivitiesApi({
      sport: filters.sport || undefined,
      city: filters.city || undefined,
    })
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [filters.sport, filters.city]);

  const updateFilters = (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.sport) sp.set('sport', merged.sport);
    if (merged.city) sp.set('city', merged.city);
    setParams(sp, { replace: true });
  };

  const handleHost = () => {
    if (!user) navigate('/login?next=/play/host');
    else navigate('/play/host');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="h-1 w-12 rounded-full bg-brand-500" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Find players · Play games</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Open games hosted by other players. Pick one, join, show up.
          </p>
        </div>
        <button
          type="button"
          onClick={handleHost}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Host a game
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Sport</span>
            <select
              value={filters.sport}
              onChange={(e) => updateFilters({ sport: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="">All sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">City</span>
            <select
              value={filters.city}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="">All cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </label>
        </div>
      </div>

      {/* Activity grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
        ) : activities.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-900">No upcoming games match your filters.</p>
            <button
              type="button"
              onClick={handleHost}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Host one yourself
            </button>
          </div>
        ) : (
          activities.map((a) => <ActivityRow key={a.id} a={a} />)
        )}
      </div>
    </div>
  );
};

const ActivityRow = ({ a }: { a: Activity }) => {
  const spotsLeft = a.capacity - a.participants.length;
  return (
    <Link
      to={`/play/${a.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-xl hover:shadow-slate-900/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
            {a.sport.name}
          </span>
          <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-brand-700">
            {a.title}
          </h3>
        </div>
        <span
          className={
            spotsLeft > 0
              ? 'shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800'
              : 'shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500'
          }
        >
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` : 'Full'}
        </span>
      </div>
      <div className="grid gap-1.5 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(a.startsAt), 'EEE, d MMM · HH:mm')}
        </span>
        {a.venue && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {a.venue.name} · {a.venue.city}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {a.participants.length} / {a.capacity} joined · Hosted by {a.host.name}
        </span>
      </div>
    </Link>
  );
};
