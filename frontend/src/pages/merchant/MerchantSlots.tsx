import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format, startOfDay } from 'date-fns';
import {
  defineSlotsApi,
  defineSlotsBulkApi,
  getAvailabilityApi,
  getVenueApi,
} from '@/api/venues';
import { extractError } from '@/api/client';
import { DatePicker } from '@/components/venue/DatePicker';
import { SlotGrid } from '@/components/venue/SlotGrid';
import type { Slot, Venue } from '@/types/api';

const schema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startHour: z.coerce.number().int().min(0).max(24),
    endHour: z.coerce.number().int().min(0).max(24),
  })
  .refine((d) => d.endHour > d.startHour, { message: 'End hour must be after start', path: ['endHour'] })
  .refine((d) => d.endDate >= d.startDate, { message: 'End date must be on/after start', path: ['endDate'] });

type FormValues = z.infer<typeof schema>;

export const MerchantSlots = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [defining, setDefining] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      startHour: 6,
      endHour: 22,
    },
  });

  useEffect(() => {
    if (!id) return;
    getVenueApi(id).then(setVenue).catch(() => setVenue(null));
  }, [id]);

  const refreshAvailability = (forDate: Date) => {
    if (!id) return;
    setLoading(true);
    getAvailabilityApi(id, format(forDate, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshAvailability(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, date]);

  const onSubmit = handleSubmit(async (values) => {
    if (!id) return;
    setDefining(true);
    try {
      if (values.startDate === values.endDate) {
        const r = await defineSlotsApi(id, {
          date: values.startDate,
          startHour: values.startHour,
          endHour: values.endHour,
        });
        toast.success(`Created ${r.created} new slots (${r.attempted} total).`);
      } else {
        const r = await defineSlotsBulkApi(id, {
          startDate: values.startDate,
          endDate: values.endDate,
          startHour: values.startHour,
          endHour: values.endHour,
        });
        toast.success(`Created ${r.created} new slots across the date range.`);
      }
      refreshAvailability(date);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDefining(false);
    }
  });

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-neutral-500">
        Loading venue…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {venue.name} <span className="text-neutral-400">— Slots</span>
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 md:grid-cols-2"
      >
        <Field label="From date" error={errors.startDate?.message}>
          <input type="date" {...register('startDate')} className={inputCls} />
        </Field>
        <Field label="To date" error={errors.endDate?.message}>
          <input type="date" {...register('endDate')} className={inputCls} />
        </Field>
        <Field label="Start hour" error={errors.startHour?.message}>
          <input
            type="number"
            min={0}
            max={24}
            {...register('startHour', { valueAsNumber: true })}
            className={inputCls}
          />
        </Field>
        <Field label="End hour" error={errors.endHour?.message}>
          <input
            type="number"
            min={0}
            max={24}
            {...register('endHour', { valueAsNumber: true })}
            className={inputCls}
          />
        </Field>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={defining}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {defining ? 'Generating…' : 'Generate slots'}
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            Slot length is {venue.slotDurationMinutes} min (set on the venue itself).
            Re-running with the same dates is safe — already-defined slots are skipped.
          </p>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Existing slots</h2>
        <p className="mt-1 text-sm text-neutral-500">Pick a date to inspect what's defined.</p>
        <div className="mt-3">
          <DatePicker selected={date} onSelect={setDate} />
        </div>
        <div className="mt-4">
          <SlotGrid slots={slots} loading={loading} />
        </div>
      </div>
    </div>
  );
};

const inputCls =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5 text-sm">
    <span className="font-medium text-neutral-700">{label}</span>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);
