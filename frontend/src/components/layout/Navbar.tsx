import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-brand-400 font-black text-lg shadow-sm">
            S
          </span>
          <span className="text-lg font-bold tracking-tight">Sportify</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/venues">Venues</NavItem>
          {user && <NavItem to="/bookings">My Bookings</NavItem>}
          {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && (
            <NavItem to="/merchant/venues">Merchant</NavItem>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-slate-900 sm:flex"
              >
                <UserIcon className="h-3.5 w-3.5" />
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-1.5 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30 transition hover:shadow-lg hover:shadow-brand-500/50"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'relative rounded-md px-3 py-1.5 text-sm font-medium transition',
        isActive
          ? 'text-slate-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-500'
          : 'text-slate-600 hover:text-slate-900',
      )
    }
  >
    {children}
  </NavLink>
);
