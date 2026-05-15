import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { adminListBookingsApi } from '@/api/admin';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/cn';

type Row = Awaited<ReturnType<typeof adminListBookingsApi>>[number];

export const AdminBookings = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminListBookingsApi().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Recent bookings</h1>
      <p className="mt-1 text-sm text-slate-600">Last 100 bookings across the platform.</p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Sport</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6"><Skeleton className="h-20 w-full" /></td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{format(new Date(r.createdAt), 'd MMM, HH:mm')}</td>
                <td className="px-4 py-3 text-slate-900">{r.user.name}</td>
                <td className="px-4 py-3">
                  <Link to={`/venues/${r.venue.id}`} className="text-slate-700 hover:text-brand-700">
                    {r.venue.name}
                  </Link>
                  <div className="text-xs text-slate-500">{r.venue.city}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.sport.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.slot
                    ? `${format(new Date(r.slot.startTime), 'd MMM HH:mm')} – ${format(new Date(r.slot.endTime), 'HH:mm')}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-bold',
                      r.status === 'CONFIRMED' && 'bg-green-100 text-green-800',
                      r.status === 'CANCELLED' && 'bg-red-100 text-red-700',
                      r.status === 'PENDING' && 'bg-amber-100 text-amber-800',
                    )}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
