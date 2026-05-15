import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { adminListUsersApi, type AdminUser } from '@/api/admin';
import { Skeleton } from '@/components/common/Skeleton';

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'' | AdminUser['role']>('');

  useEffect(() => {
    setLoading(true);
    adminListUsersApi({ q: q || undefined, role: role || undefined })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [q, role]);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-slate-600">{users.length} matching</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as '' | AdminUser['role'])}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All roles</option>
          <option value="PLAYER">Players</option>
          <option value="MERCHANT">Merchants</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Pts</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6"><Skeleton className="h-20 w-full" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={
                    u.role === 'ADMIN' ? 'rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800' :
                    u.role === 'MERCHANT' ? 'rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800' :
                    'rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700'
                  }>{u.role}</span>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{u.loyaltyPoints}</td>
                <td className="px-4 py-3 text-slate-500">{format(new Date(u.createdAt), 'd MMM yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
