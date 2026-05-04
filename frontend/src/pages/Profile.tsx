import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { getMyProfileApi, updateMyProfileApi } from '@/api/users';
import { extractError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  bio: z.string().max(500).optional().or(z.literal('').transform(() => undefined)),
  avatarUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  skill: z.enum(['BEGINNER', 'INTERMEDIATE', 'PRO']).optional(),
});
type FormValues = z.infer<typeof schema>;

export const Profile = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getMyProfileApi()
      .then((u) => {
        setUser(u);
        reset({
          name: u.name,
          phone: u.phone ?? undefined,
          bio: u.bio ?? undefined,
          avatarUrl: u.avatarUrl ?? undefined,
          skill: u.skill ?? undefined,
        });
      })
      .catch((err) => toast.error(extractError(err)));
  }, [reset, setUser]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const updated = await updateMyProfileApi(values);
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Logged in as {user?.email} · {user?.role}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name')} className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} className={inputCls} />
        </Field>
        <Field label="Avatar URL" error={errors.avatarUrl?.message}>
          <input {...register('avatarUrl')} className={inputCls} />
        </Field>
        <Field label="Bio" error={errors.bio?.message}>
          <textarea {...register('bio')} rows={3} className={inputCls} />
        </Field>
        <Field label="Skill level" error={errors.skill?.message}>
          <select {...register('skill')} className={inputCls}>
            <option value="">—</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="PRO">Pro</option>
          </select>
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
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
