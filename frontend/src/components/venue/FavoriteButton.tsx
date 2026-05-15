import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { toggleFavoriteApi } from '@/api/favorites';
import { extractError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

type Props = {
  venueId: string;
  initial?: boolean;
  onChange?: (favorited: boolean) => void;
  size?: 'sm' | 'md';
};

export const FavoriteButton = ({ venueId, initial = false, onChange, size = 'sm' }: Props) => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [favorited, setFavorited] = useState(initial);
  const [pending, setPending] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    setPending(true);
    const optimistic = !favorited;
    setFavorited(optimistic);
    try {
      const result = await toggleFavoriteApi(venueId);
      setFavorited(result);
      onChange?.(result);
    } catch (err) {
      setFavorited(!optimistic);
      toast.error(extractError(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        'grid place-items-center rounded-full border bg-white/95 backdrop-blur transition hover:scale-105',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        favorited ? 'border-red-300' : 'border-slate-200',
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          favorited ? 'fill-red-500 text-red-500' : 'text-slate-600',
        )}
      />
    </button>
  );
};
