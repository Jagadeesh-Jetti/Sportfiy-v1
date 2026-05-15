import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import {
  adminListVenuesApi,
  adminToggleVenueVerifyApi,
  type AdminVenue,
} from '@/api/admin';
import { extractError } from '@/api/client';
import { Skeleton } from '@/components/common/Skeleton';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';

export const AdminVenues = () => {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminListVenuesApi().then(setVenues).catch(() => setVenues([])).finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const toggle = async (id: string) => {
    try {
      await adminToggleVenueVerifyApi(id);
      toast.success('Verification updated');
      refresh();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
      <p className="mt-1 text-sm text-slate-600">{venues.length} total · moderate verification status</p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6"><Skeleton className="h-20 w-full" /></td></tr>
            ) : venues.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/venues/${v.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                    {v.name}
                  </Link>
                  <div className="text-xs text-slate-500">{format(new Date(v.createdAt), 'd MMM yyyy')}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{v.city ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{v.owner.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {v.avgRating !== null ? (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {v.avgRating.toFixed(1)} ({v.reviewCount})
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  {v.isVerified ? <VerifiedBadge /> : <span className="text-xs font-semibold text-slate-500">Unverified</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggle(v.id)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-brand-400 hover:text-brand-700"
                  >
                    {v.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
