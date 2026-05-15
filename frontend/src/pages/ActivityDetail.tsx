import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  cancelActivityApi,
  getActivityApi,
  joinActivityApi,
  leaveActivityApi,
} from '@/api/activities';
import { extractError } from '@/api/client';
import { Skeleton } from '@/components/common/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import type { Activity } from '@/types/api';

export const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    if (!id) return;
    setLoading(true);
    getActivityApi(id)
      .then(setActivity)
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-3 h-32 w-full" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        Activity not found.
      </div>
    );
  }

  const isHost = user?.id === activity.host.id;
  const isParticipant = activity.participants.some((p) => p.id === user?.id);
  const spotsLeft = activity.capacity - activity.participants.length;
  const isFull = spotsLeft <= 0;
  const isPast = new Date(activity.startsAt) <= new Date();

  const handleJoin = async () => {
    if (!user) {
      navigate(`/login?next=/play/${activity.id}`);
      return;
    }
    setBusy(true);
    try {
      await joinActivityApi(activity.id);
      toast.success("You're in. See you there!");
      refresh();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leaveActivityApi(activity.id);
      toast.success('You left this game.');
      refresh();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this activity? Participants will lose their spot.')) return;
    setBusy(true);
    try {
      await cancelActivityApi(activity.id);
      toast.success('Activity cancelled.');
      navigate('/play');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/play" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        All games
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
              {activity.sport.name}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-balance">
              {activity.title}
            </h1>
          </div>
          <span
            className={
              spotsLeft > 0
                ? 'shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800'
                : 'shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500'
            }
          >
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </span>
        </div>

        {activity.description && (
          <p className="mt-3 leading-relaxed text-slate-700">{activity.description}</p>
        )}

        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            {format(new Date(activity.startsAt), 'EEEE, d MMM · HH:mm')}
            {activity.endsAt && ` – ${format(new Date(activity.endsAt), 'HH:mm')}`}
          </span>
          {activity.venue && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <Link
                to={`/venues/${activity.venue.id}`}
                className="hover:text-brand-700 hover:underline"
              >
                {activity.venue.name} · {activity.venue.city}
              </Link>
            </span>
          )}
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            {activity.participants.length} / {activity.capacity} joined
            {activity.price > 0 && ` · ₹${activity.price}/head`}
          </span>
        </div>

        {/* Participants */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Players</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activity.participants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                {p.name}
                {p.id === activity.host.id && (
                  <span className="text-[10px] font-bold uppercase text-brand-700">host</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isPast && (
          <div className="mt-6 flex flex-wrap gap-2">
            {isHost ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Cancel activity
              </button>
            ) : isParticipant ? (
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Leave game
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={busy || isFull}
                className="rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-5 py-2 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30 hover:shadow-lg disabled:opacity-50"
              >
                {isFull ? 'Game is full' : busy ? 'Joining…' : 'Join this game'}
              </button>
            )}
          </div>
        )}
        {isPast && (
          <p className="mt-6 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            This game has already started.
          </p>
        )}
      </div>
    </div>
  );
};
