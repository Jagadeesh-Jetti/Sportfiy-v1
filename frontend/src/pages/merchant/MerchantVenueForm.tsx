import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { createVenueApi, deleteVenueApi, getVenueApi, updateVenueApi } from '@/api/venues';
import { listSportsApi } from '@/api/sports';
import { extractError } from '@/api/client';
import type { Sport } from '@/types/api';

const HOUR = z.coerce.number().int().min(0).max(24);

const schema = z
  .object({
    name: z.string().min(2).max(120),
    description: z.string().max(2000).optional().or(z.literal('').transform(() => undefined)),
    location: z.string().min(2).max(200),
    city: z.string().max(80).optional().or(z.literal('').transform(() => undefined)),
    address: z.string().max(300).optional().or(z.literal('').transform(() => undefined)),
    imagesText: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    openingHour: HOUR,
    closingHour: HOUR,
    slotDurationMinutes: z.coerce.number().int().min(15).max(240),
    pricePerHour: z
      .union([z.coerce.number().min(0), z.literal('').transform(() => undefined)])
      .optional(),
    sportIds: z.array(z.string().uuid()).min(1, 'Pick at least one sport'),
  })
  .refine((d) => d.closingHour > d.openingHour, {
    message: 'closingHour must be after openingHour',
    path: ['closingHour'],
  });

type FormValues = z.infer<typeof schema>;

export const MerchantVenueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      openingHour: 6,
      closingHour: 22,
      slotDurationMinutes: 60,
      sportIds: [],
      lat: 0,
      lng: 0,
    },
  });

  const selectedSportIds = watch('sportIds');

  useEffect(() => {
    listSportsApi().then(setSports).catch(() => setSports([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getVenueApi(id)
      .then((v) => {
        reset({
          name: v.name,
          description: v.description ?? undefined,
          location: v.location,
          city: v.city ?? undefined,
          address: v.address ?? undefined,
          imagesText: v.images.join('\n'),
          lat: v.lat,
          lng: v.lng,
          openingHour: v.openingHour,
          closingHour: v.closingHour,
          slotDurationMinutes: v.slotDurationMinutes,
          pricePerHour: v.pricePerHour ?? undefined,
          sportIds: v.sports.map((s) => s.id),
        });
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const toggleSport = (sportId: string) => {
    const current = new Set(selectedSportIds);
    if (current.has(sportId)) current.delete(sportId);
    else current.add(sportId);
    setValue('sportIds', Array.from(current), { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const images = (values.imagesText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: values.name,
        description: values.description,
        location: values.location,
        city: values.city,
        address: values.address,
        images,
        lat: values.lat,
        lng: values.lng,
        openingHour: values.openingHour,
        closingHour: values.closingHour,
        slotDurationMinutes: values.slotDurationMinutes,
        pricePerHour: values.pricePerHour as number | undefined,
        sportIds: values.sportIds,
      };
      if (isEdit && id) {
        await updateVenueApi(id, payload);
        toast.success('Venue updated');
      } else {
        const v = await createVenueApi(payload);
        toast.success('Venue created');
        navigate(`/merchant/venues/${v.id}/slots`);
        return;
      }
      navigate('/merchant/venues');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this venue? This cannot be undone.')) return;
    try {
      await deleteVenueApi(id);
      toast.success('Venue deleted');
      navigate('/merchant/venues');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? 'Edit venue' : 'New venue'}
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name')} className={inputCls} />
        </Field>
        <Field label="Description (optional)" error={errors.description?.message}>
          <textarea {...register('description')} rows={3} className={inputCls} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Location (neighborhood, city)" error={errors.location?.message}>
            <input {...register('location')} className={inputCls} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input {...register('city')} className={inputCls} />
          </Field>
        </div>
        <Field label="Address (optional)" error={errors.address?.message}>
          <input {...register('address')} className={inputCls} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Latitude" error={errors.lat?.message}>
            <input
              type="number"
              step="any"
              {...register('lat', { valueAsNumber: true })}
              className={inputCls}
            />
          </Field>
          <Field label="Longitude" error={errors.lng?.message}>
            <input
              type="number"
              step="any"
              {...register('lng', { valueAsNumber: true })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Image URLs (one per line)" error={errors.imagesText?.message}>
          <textarea
            {...register('imagesText')}
            rows={3}
            placeholder="https://images.unsplash.com/..."
            className={inputCls}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Opens at (hour)" error={errors.openingHour?.message}>
            <input
              type="number"
              min={0}
              max={24}
              {...register('openingHour', { valueAsNumber: true })}
              className={inputCls}
            />
          </Field>
          <Field label="Closes at (hour)" error={errors.closingHour?.message}>
            <input
              type="number"
              min={0}
              max={24}
              {...register('closingHour', { valueAsNumber: true })}
              className={inputCls}
            />
          </Field>
          <Field label="Slot length (min)" error={errors.slotDurationMinutes?.message}>
            <input
              type="number"
              min={15}
              max={240}
              {...register('slotDurationMinutes', { valueAsNumber: true })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Price / hour (₹, optional)" error={errors.pricePerHour?.message as string | undefined}>
          <input
            type="number"
            min={0}
            {...register('pricePerHour')}
            className={inputCls}
          />
        </Field>
        <Field label="Sports offered" error={errors.sportIds?.message}>
          <div className="flex flex-wrap gap-2">
            {sports.map((s) => {
              const active = selectedSportIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSport(s.id)}
                  className={
                    active
                      ? 'rounded-full bg-brand-600 px-3 py-1 text-sm font-medium text-white'
                      : 'rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200'
                  }
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create venue'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      </form>
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
