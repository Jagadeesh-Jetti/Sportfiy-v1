import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { createActivityApi } from '@/api/activities';
import { extractError } from '@/api/client';
import { listSportsApi } from '@/api/sports';
import { listVenuesApi } from '@/api/venues';
import type { Sport, Venue } from '@/types/api';

const schema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional().or(z.literal('').transform(() => undefined)),
  sportId: z.string().uuid(),
  venueId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().or(z.literal('').transform(() => undefined)),
  capacity: z.coerce.number().int().min(2).max(50),
  price: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

export const HostActivity = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 8, price: 0 },
  });

  useEffect(() => {
    listSportsApi().then(setSports);
    listVenuesApi({ limit: 50 }).then((r) => setVenues(r.items));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const activity = await createActivityApi({
        title: values.title,
        description: values.description,
        sportId: values.sportId,
        venueId: values.venueId,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
        capacity: values.capacity,
        price: values.price,
      });
      toast.success('Activity created — share it with your friends!');
      navigate(`/play/${activity.id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/play" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Host a game</h1>
      <p className="mt-1 text-sm text-slate-600">
        Open it up — players in your city can join. You can cap how many spots are open.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Field label="Title" error={errors.title?.message}>
          <input {...register('title')} placeholder="Sunday morning football, beginners welcome" className={inputCls} />
        </Field>
        <Field label="Description (optional)" error={errors.description?.message}>
          <textarea {...register('description')} rows={3} className={inputCls} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sport" error={errors.sportId?.message}>
            <select {...register('sportId')} className={inputCls}>
              <option value="">Pick a sport…</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Venue (optional)" error={errors.venueId?.message}>
            <select {...register('venueId')} className={inputCls}>
              <option value="">No venue yet</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name} · {v.city}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Starts at" error={errors.startsAt?.message}>
            <input type="datetime-local" {...register('startsAt')} className={inputCls} />
          </Field>
          <Field label="Ends at (optional)" error={errors.endsAt?.message}>
            <input type="datetime-local" {...register('endsAt')} className={inputCls} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Capacity" error={errors.capacity?.message}>
            <input type="number" min={2} max={50} {...register('capacity', { valueAsNumber: true })} className={inputCls} />
          </Field>
          <Field label="Price per head (₹)" error={errors.price?.message}>
            <input type="number" min={0} step={50} {...register('price', { valueAsNumber: true })} className={inputCls} />
          </Field>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 hover:shadow-xl disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Host this game'}
        </button>
      </form>
    </div>
  );
};

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30';

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1.5 text-sm">
    <span className="font-semibold text-slate-700">{label}</span>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);
