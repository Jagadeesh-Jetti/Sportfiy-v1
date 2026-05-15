import { NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, Heart, MapPin, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

const HIDE_ON_PATHS = ['/login', '/signup'];

export const MobileBottomNav = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (HIDE_ON_PATHS.includes(location.pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <Tab to="/venues" icon={<MapPin className="h-5 w-5" />} label="Venues" />
      <Tab to="/play" icon={<Sparkles className="h-5 w-5" />} label="Play" />
      <Tab
        to={user ? '/bookings' : '/login?next=/bookings'}
        icon={<CalendarCheck className="h-5 w-5" />}
        label="Bookings"
      />
      <Tab
        to={user ? '/favorites' : '/login?next=/favorites'}
        icon={<Heart className="h-5 w-5" />}
        label="Saved"
      />
      <Tab
        to={user ? '/profile' : '/login'}
        icon={<UserIcon className="h-5 w-5" />}
        label={user ? 'Profile' : 'Sign in'}
      />
    </nav>
  );
};

const Tab = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition',
        isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900',
      )
    }
    end
  >
    {icon}
    {label}
  </NavLink>
);
