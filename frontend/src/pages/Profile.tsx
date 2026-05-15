import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Download, Lock, Trash2 } from 'lucide-react';
import {
  changePasswordApi,
  deleteMyAccountApi,
  exportMyDataApi,
  getMyProfileApi,
  updateMyProfileApi,
} from '@/api/users';
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 chars'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export const Profile = () => {
  const navigate = useNavigate();
  const { setUser, user, logout } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

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

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated');
      passwordForm.reset();
    } catch (err) {
      toast.error(extractError(err));
    }
  });

  const handleExport = async () => {
    try {
      const blob = await exportMyDataApi();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sportify-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleDelete = async () => {
    const password = prompt('To confirm account deletion, enter your password:');
    if (!password) return;
    if (!confirm("This is permanent. Are you absolutely sure?")) return;
    try {
      await deleteMyAccountApi({ password });
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Logged in as {user?.email} · {user?.role}
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
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
          className="mt-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2.5 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30 hover:shadow-lg disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={onChangePassword} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-bold">Change password</h2>
        </div>
        <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
          <input type="password" {...passwordForm.register('currentPassword')} className={inputCls} />
        </Field>
        <Field label="New password" error={passwordForm.formState.errors.newPassword?.message}>
          <input type="password" {...passwordForm.register('newPassword')} className={inputCls} />
        </Field>
        <Field label="Confirm new password" error={passwordForm.formState.errors.confirmPassword?.message}>
          <input type="password" {...passwordForm.register('confirmPassword')} className={inputCls} />
        </Field>
        <button
          type="submit"
          disabled={passwordForm.formState.isSubmitting}
          className="mt-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
        >
          Update password
        </button>
      </form>

      {/* Data + delete */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold">Your data</h2>
        <p className="text-sm text-slate-600">
          Download a JSON of everything we have on you. Or delete your account entirely — this is irreversible.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-brand-400 hover:text-brand-700"
          >
            <Download className="h-4 w-4" />
            Export my data
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete my account
          </button>
        </div>
      </div>
    </div>
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
