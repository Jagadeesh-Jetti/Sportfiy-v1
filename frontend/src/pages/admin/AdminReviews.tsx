import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { adminDeleteReviewApi, adminListReviewsApi } from '@/api/admin';
import { RatingStars } from '@/components/common/RatingStars';
import { Skeleton } from '@/components/common/Skeleton';
import { extractError } from '@/api/client';

type Row = Awaited<ReturnType<typeof adminListReviewsApi>>[number];

export const AdminReviews = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminListReviewsApi().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This recomputes the venue rating.')) return;
    try {
      await adminDeleteReviewApi(id);
      toast.success('Review deleted');
      refresh();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
      <p className="mt-1 text-sm text-slate-600">Moderate inappropriate reviews here.</p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{r.user.name}</div>
                  <Link to={`/venues/${r.venue.id}`} className="text-xs text-slate-500 hover:text-brand-700">
                    {r.venue.name}
                  </Link>
                  <div className="mt-1.5"><RatingStars rating={r.rating} size="sm" showCount={false} /></div>
                  {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
                  <div className="mt-2 text-xs text-slate-500">{format(new Date(r.createdAt), 'd MMM yyyy')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
