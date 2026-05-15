import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

type Props = { open: boolean; onClose: () => void };

export const MobileMenu = ({ open, onClose }: Props) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Close on route change.
  useEffect(() => { onClose(); }, [location.pathname, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 max-w-[90%] flex-col bg-ink-900 text-white md:hidden"
          >
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
              <Link to="/" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-ink-900 font-black">S</span>
                <span className="font-bold">Sportify</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-md text-slate-400 hover:bg-ink-800 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <Item to="/venues" icon={<MapPin className="h-4 w-4" />}>Venues</Item>
              <Item to="/play" icon={<Sparkles className="h-4 w-4" />}>Play</Item>
              {user && <Item to="/bookings" icon={<CalendarCheck className="h-4 w-4" />}>My Bookings</Item>}
              {user && <Item to="/favorites" icon={<Heart className="h-4 w-4" />}>Favorites</Item>}
              {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && (
                <Item to="/merchant/venues" icon={<LayoutDashboard className="h-4 w-4" />}>Merchant</Item>
              )}
              {user?.role === 'ADMIN' && (
                <Item to="/admin" icon={<ShieldCheck className="h-4 w-4" />}>Admin</Item>
              )}
              {user && <Item to="/profile" icon={<UserIcon className="h-4 w-4" />}>Profile</Item>}
            </nav>

            <div className="border-t border-ink-700 p-4">
              {user ? (
                <button
                  type="button"
                  onClick={() => { logout(); onClose(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              ) : (
                <div className="grid gap-2">
                  <Link
                    to="/signup"
                    className="rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2.5 text-center text-sm font-bold text-ink-900"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border border-ink-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-ink-800"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const Item = ({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-ink-800 hover:text-white"
  >
    {icon}
    {children}
  </Link>
);
