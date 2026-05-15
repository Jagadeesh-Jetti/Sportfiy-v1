import { NavLink, Outlet } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, MapPin, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

export const AdminLayout = () => (
  <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
    <aside className="md:sticky md:top-20 md:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <SideLink to="/admin" end icon={<LayoutDashboard className="h-4 w-4" />}>
          Overview
        </SideLink>
        <SideLink to="/admin/users" icon={<Users className="h-4 w-4" />}>
          Users
        </SideLink>
        <SideLink to="/admin/venues" icon={<MapPin className="h-4 w-4" />}>
          Venues
        </SideLink>
        <SideLink to="/admin/bookings" icon={<CalendarCheck className="h-4 w-4" />}>
          Bookings
        </SideLink>
        <SideLink to="/admin/reviews" icon={<MessageSquare className="h-4 w-4" />}>
          Reviews
        </SideLink>
      </div>
    </aside>
    <main>
      <Outlet />
    </main>
  </div>
);

const SideLink = ({
  to,
  icon,
  end,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  end?: boolean;
  children: React.ReactNode;
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
        isActive
          ? 'bg-ink-900 text-brand-400'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
      )
    }
  >
    {icon}
    {children}
  </NavLink>
);
