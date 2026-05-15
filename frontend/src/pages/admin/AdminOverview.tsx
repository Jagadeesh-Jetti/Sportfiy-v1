import { useEffect, useState } from 'react';
import { adminOverviewApi, type AdminOverview as Overview } from '@/api/admin';
import { Skeleton } from '@/components/common/Skeleton';

export const AdminOverviewPage = () => {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    adminOverviewApi().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-slate-600">Sportify, by the numbers.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Players" value={data.users.total} sub={`${data.users.merchants} merchants`} />
        <Stat
          label="Venues"
          value={data.venues.total}
          sub={`${data.venues.verified} verified`}
        />
        <Stat
          label="Bookings"
          value={data.bookings.total}
          sub={`${(data.bookings.cancelRate * 100).toFixed(1)}% cancel rate`}
        />
        <Stat
          label="Reviews"
          value={data.reviews.total}
          sub={data.reviews.avg ? `Avg ${data.reviews.avg.toFixed(2)}★` : 'Awaiting first review'}
        />
      </div>
    </>
  );
};

const Stat = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-3xl font-extrabold text-slate-900 tabular-nums">
      {value.toLocaleString()}
    </div>
    {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
  </div>
);
