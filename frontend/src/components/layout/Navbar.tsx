import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';
import { MobileMenu } from './MobileMenu';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
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
            <NavItem to="/play">Play</NavItem>
            {user && <NavItem to="/bookings">My Bookings</NavItem>}
            {user && <NavItem to="/favorites">Favorites</NavItem>}
            {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && (
              <NavItem to="/merchant/venues">Merchant</NavItem>
            )}
            {user?.role === 'ADMIN' && <NavItem to="/admin">Admin</NavItem>}
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
                  className="hidden h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:grid"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-900 sm:block"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="hidden rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-1.5 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30 transition hover:shadow-lg hover:shadow-brand-500/50 sm:inline-block"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
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
