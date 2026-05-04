import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { signupApi } from '@/api/auth';
import { extractError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { AuthShell } from '@/components/auth/AuthShell';

const schema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(80),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
  phone: z
    .string()
    .trim()
    .min(7, 'Looks too short')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  role: z.enum(['PLAYER', 'MERCHANT']),
});
type FormValues = z.infer<typeof schema>;

export const Signup = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'PLAYER' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values, phone: values.phone || undefined };
      const { user, token } = await signupApi(payload);
      login(user, token);
      toast.success(`Welcome to Sportify, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'MERCHANT' ? '/merchant/venues' : '/venues', { replace: true });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes. No credit card."
      side={{
        eyebrow: 'Join the league',
        quote:
          'Listing my turf on Sportify doubled my weekday bookings. The merchant tools are stupid simple.',
        attribution: 'Riya, Hyderabad — owns 2 venues',
      }}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name')} autoComplete="name" className={inputCls} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...register('email')}
            autoComplete="email"
            className={inputCls}
          />
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input
            type="tel"
            {...register('phone')}
            autoComplete="tel"
            className={inputCls}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            {...register('password')}
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label="I am a..." error={errors.role?.message}>
          <select {...register('role')} className={inputCls}>
            <option value="PLAYER">Player — I want to book courts</option>
            <option value="MERCHANT">Merchant — I list my venue(s)</option>
          </select>
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/50 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30';

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
    <span className="font-semibold text-slate-700">{label}</span>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);
