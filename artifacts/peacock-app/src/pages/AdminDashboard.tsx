import { useLocation } from 'wouter';
import AdminHome from './admin/AdminHome';
import AdminTours from './admin/AdminTours';
import AdminTourForm from './admin/AdminTourForm';
import AdminDrivers from './admin/AdminDrivers';
import AdminDriverForm from './admin/AdminDriverForm';
import AdminBookings from './admin/AdminBookings';
import AdminBookingDetail from './admin/AdminBookingDetail';
import AdminCYO from './admin/AdminCYO';
import AdminCYODetail from './admin/AdminCYODetail';
import AdminFleet from './admin/AdminFleet';
import AdminSettings from './admin/AdminSettings';
import AdminDriverDetail from './admin/AdminDriverDetail';
import AdminCustomers from './admin/AdminCustomers';
import AdminCustomerDetail from './admin/AdminCustomerDetail';
import AdminLeads from './admin/AdminLeads';

export default function AdminDashboard() {
  const [rawLocation] = useLocation();
  const location = rawLocation.replace(/\/+$/, '') || '/admin';

  if (location === '/admin/tours/new' || /^\/admin\/tours\/[^/]+\/edit$/.test(location)) {
    return <AdminTourForm />;
  }
  if (location === '/admin/drivers/new' || /^\/admin\/drivers\/[^/]+\/edit$/.test(location)) {
    return <AdminDriverForm />;
  }
  if (/^\/admin\/drivers\/[^/]+$/.test(location) && location !== '/admin/drivers') {
    return <AdminDriverDetail />;
  }
  if (/^\/admin\/customers\/[^/]+$/.test(location) && location !== '/admin/customers') {
    return <AdminCustomerDetail />;
  }
  if (/^\/admin\/bookings\/[^/]+$/.test(location) && location !== '/admin/bookings') {
    return <AdminBookingDetail />;
  }
  if (/^\/admin\/requests\/[^/]+$/.test(location) && location !== '/admin/requests') {
    return <AdminCYODetail />;
  }

  const PAGE_MAP: Record<string, React.ComponentType> = {
    '/admin': AdminHome,
    '/admin/tours': AdminTours,
    '/admin/drivers': AdminDrivers,
    '/admin/bookings': AdminBookings,
    '/admin/requests': AdminCYO,
    '/admin/leads': AdminLeads,
    '/admin/customers': AdminCustomers,
    '/admin/fleet': AdminFleet,
    '/admin/settings': AdminSettings,
  };

  const Page = PAGE_MAP[location] || AdminHome;
  return <Page />;
}
