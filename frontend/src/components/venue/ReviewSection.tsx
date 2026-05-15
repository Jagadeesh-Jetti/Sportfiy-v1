import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MessageSquare, Trash2 } from 'lucide-react';
import {
  canReviewVenueApi,
  deleteReviewApi,
  listVenueReviewsApi,
  replyToReviewApi,
  upsertReviewApi,
} from '@/api/reviews';
import { extractError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { RatingStars } from '@/components/common/RatingStars';
import { Skeleton } from '@/components/common/Skeleton';
import type { Review } from '@/types/api';

type Props = {
  venueId: string;
  ownerId?: string;
  onAggregateChange?: (avgRating: number | null, reviewCount: number) => void;
};

export const ReviewSection = ({ venueId, ownerId, onAggregateChange }: Props) => {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);

  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listVenueReviewsApi(venueId);
      setReviews(list.reviews);
      setAvg(list.avgRating);
      setCount(list.reviewCount);
      onAggregateChange?.(list.avgRating, list.reviewCount);

      if (user) {
        const elig = await canReviewVenueApi(venueId);
        setCanReview(elig.canReview);
        setMyReview(elig.existingReview);
        if (elig.existingReview) {
          setDraftRating(elig.existingReview.rating);
          setDraftComment(elig.existingReview.comment ?? '');
        }
      } else {
        setCanReview(false);
        setMyReview(null);
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await upsertReviewApi(venueId, { rating: draftRating, comment: draftComment.trim() || undefined });
      toast.success(myReview ? 'Review updated' : 'Thanks for your review!');
      await refresh();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      await deleteReviewApi(myReview.id);
      toast.success('Review deleted');
      setDraftComment('');
      setDraftRating(5);
      await refresh();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleReply = async (reviewId: string, replyText: string) => {
    if (!replyText.trim()) return;
    try {
      await replyToReviewApi(reviewId, replyText);
      toast.success('Reply posted');
      await refresh();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <section>
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Reviews</h2>
        {count > 0 && avg !== null && (
          <RatingStars rating={avg} count={count} size="md" />
        )}
      </header>

      {/* Player composer */}
      {user && canReview && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">
            {myReview ? 'Update your review' : 'How was it?'}
          </p>
          <div className="mt-2">
            <RatingStars
              rating={draftRating}
              interactive
              onChange={setDraftRating}
              size="lg"
              showCount={false}
            />
          </div>
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            rows={3}
            placeholder="Tell other players how it was…"
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2 text-sm font-bold text-ink-900 shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {submitting ? 'Saving…' : myReview ? 'Update review' : 'Post review'}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {user && !canReview && !myReview && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          You can review this venue after you've completed a booking here.
        </p>
      )}

      {/* List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              isOwner={ownerId != null && user?.id === ownerId}
              onReply={(text) => handleReply(r.id, text)}
            />
          ))
        )}
      </div>
    </section>
  );
};

const ReviewCard = ({
  review,
  isOwner,
  onReply,
}: {
  review: Review;
  isOwner: boolean;
  onReply: (text: string) => void;
}) => {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{review.user.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <RatingStars rating={review.rating} size="sm" showCount={false} />
              <span>·</span>
              <time>{format(new Date(review.createdAt), 'd MMM yyyy')}</time>
            </div>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>
      )}
      {review.reply && (
        <div className="mt-3 rounded-lg border-l-2 border-brand-500 bg-brand-50/40 px-3 py-2 text-sm">
          <div className="text-xs font-semibold text-brand-800">Owner replied</div>
          <p className="mt-0.5 text-slate-700">{review.reply}</p>
        </div>
      )}
      {isOwner && !review.reply && (
        <div className="mt-3">
          {!replying ? (
            <button
              type="button"
              onClick={() => setReplying(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Write a thoughtful reply…"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReply(text);
                    setText('');
                    setReplying(false);
                  }}
                  className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800"
                >
                  Post reply
                </button>
                <button
                  type="button"
                  onClick={() => setReplying(false)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
