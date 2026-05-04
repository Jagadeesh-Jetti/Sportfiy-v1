import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { loginApi } from '@/api/auth';
import { extractError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { AuthShell } from '@/components/auth/AuthShell';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});
type FormValues = z.infer<typeof schema>;

export const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/venues';
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const { user, token } = await loginApi(values);
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book courts and manage venues."
      side={{
        eyebrow: 'Welcome back',
        quote: 'I find a turf and book in 20 seconds. Half the time I used to spend on calls.',
        attribution: 'Aarav, Bengaluru — books football weekly',
      }}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputCls}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={inputCls}
          />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/50 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-sm text-slate-600">
          New to Sportify?{' '}
          <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
            Create an account
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
