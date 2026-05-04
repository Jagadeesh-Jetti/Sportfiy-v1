import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleRoute } from '@/components/common/RoleRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { VenueList } from '@/pages/VenueList';
import { VenueDetail } from '@/pages/VenueDetail';
import { MyBookings } from '@/pages/MyBookings';
import { Profile } from '@/pages/Profile';
import { MerchantVenues } from '@/pages/merchant/MerchantVenues';
import { MerchantVenueForm } from '@/pages/merchant/MerchantVenueForm';
import { MerchantSlots } from '@/pages/merchant/MerchantSlots';
import { NotFound } from '@/pages/NotFound';

export const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/venues" element={<VenueList />} />
      <Route path="/venues/:id" element={<VenueDetail />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<RoleRoute roles={['MERCHANT', 'ADMIN']} />}>
          <Route path="/merchant/venues" element={<MerchantVenues />} />
          <Route path="/merchant/venues/new" element={<MerchantVenueForm />} />
          <Route path="/merchant/venues/:id/edit" element={<MerchantVenueForm />} />
          <Route path="/merchant/venues/:id/slots" element={<MerchantSlots />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
