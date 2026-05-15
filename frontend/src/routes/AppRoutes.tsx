import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleRoute } from '@/components/common/RoleRoute';
import { Skeleton } from '@/components/common/Skeleton';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { VenueList } from '@/pages/VenueList';
import { NotFound } from '@/pages/NotFound';

// Heavy or rarely-visited routes are lazy-loaded to keep first-paint quick.
const VenueDetail = lazy(() => import('@/pages/VenueDetail').then((m) => ({ default: m.VenueDetail })));
const BookingDetail = lazy(() => import('@/pages/BookingDetail').then((m) => ({ default: m.BookingDetail })));
const MyBookings = lazy(() => import('@/pages/MyBookings').then((m) => ({ default: m.MyBookings })));
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })));
const Favorites = lazy(() => import('@/pages/Favorites').then((m) => ({ default: m.Favorites })));
const Play = lazy(() => import('@/pages/Play').then((m) => ({ default: m.Play })));
const ActivityDetail = lazy(() => import('@/pages/ActivityDetail').then((m) => ({ default: m.ActivityDetail })));
const HostActivity = lazy(() => import('@/pages/HostActivity').then((m) => ({ default: m.HostActivity })));
const MerchantVenues = lazy(() => import('@/pages/merchant/MerchantVenues').then((m) => ({ default: m.MerchantVenues })));
const MerchantVenueForm = lazy(() => import('@/pages/merchant/MerchantVenueForm').then((m) => ({ default: m.MerchantVenueForm })));
const MerchantSlots = lazy(() => import('@/pages/merchant/MerchantSlots').then((m) => ({ default: m.MerchantSlots })));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverviewPage })));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminVenues = lazy(() => import('@/pages/admin/AdminVenues').then((m) => ({ default: m.AdminVenues })));
const AdminBookings = lazy(() => import('@/pages/admin/AdminBookings').then((m) => ({ default: m.AdminBookings })));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews').then((m) => ({ default: m.AdminReviews })));
const LegalLayout = lazy(() => import('@/pages/legal/LegalLayout').then((m) => ({ default: m.LegalLayout })));
const Terms = lazy(() => import('@/pages/legal/Terms').then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import('@/pages/legal/Privacy').then((m) => ({ default: m.Privacy })));
const Refund = lazy(() => import('@/pages/legal/Refund').then((m) => ({ default: m.Refund })));
const About = lazy(() => import('@/pages/legal/About').then((m) => ({ default: m.About })));

const PageFallback = () => (
  <div className="mx-auto max-w-3xl px-4 py-8">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="mt-4 h-64 w-full" />
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venues/:id" element={<VenueDetail />} />
        <Route path="/play" element={<Play />} />
        <Route path="/play/:id" element={<ActivityDetail />} />

        {/* Legal */}
        <Route element={<LegalLayout />}>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<Refund />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/play/host" element={<HostActivity />} />

          <Route element={<RoleRoute roles={['MERCHANT', 'ADMIN']} />}>
            <Route path="/merchant/venues" element={<MerchantVenues />} />
            <Route path="/merchant/venues/new" element={<MerchantVenueForm />} />
            <Route path="/merchant/venues/:id/edit" element={<MerchantVenueForm />} />
            <Route path="/merchant/venues/:id/slots" element={<MerchantSlots />} />
          </Route>

          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="venues" element={<AdminVenues />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);
