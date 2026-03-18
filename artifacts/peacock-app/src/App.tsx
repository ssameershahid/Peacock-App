import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { PublicLayout } from "@/components/layout/PublicLayout";

import Home from "@/pages/Home";
import Tours from "@/pages/Tours";
import TourDetail from "@/pages/TourDetail";
import CYOWizard from "@/pages/CYOWizard";
import Transfers from "@/pages/Transfers";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TouristPortal from "@/pages/TouristPortal";
import DriverDashboard from "@/pages/DriverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function PublicRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicRoute component={Home} />} />
      <Route path="/tours" component={() => <PublicRoute component={Tours} />} />
      <Route path="/tours/custom" component={() => <PublicRoute component={CYOWizard} />} />
      <Route path="/tours/:slug" component={() => <PublicRoute component={TourDetail} />} />
      <Route path="/transfers" component={() => <PublicRoute component={Transfers} />} />
      <Route path="/checkout" component={() => <PublicRoute component={Checkout} />} />
      <Route path="/checkout/confirmation" component={() => <PublicRoute component={Confirmation} />} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />

      <Route path="/account" component={TouristPortal} />
      <Route path="/account/bookings" component={TouristPortal} />
      <Route path="/account/bookings/:id" component={TouristPortal} />
      <Route path="/account/invoices" component={TouristPortal} />
      <Route path="/account/profile" component={TouristPortal} />

      <Route path="/driver" component={DriverDashboard} />
      <Route path="/driver/trips" component={DriverDashboard} />
      <Route path="/driver/trips/:id" component={DriverDashboard} />
      <Route path="/driver/earnings" component={DriverDashboard} />
      <Route path="/driver/profile" component={DriverDashboard} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tours" component={AdminDashboard} />
      <Route path="/admin/tours/new" component={AdminDashboard} />
      <Route path="/admin/tours/:slug/edit" component={AdminDashboard} />
      <Route path="/admin/bookings" component={AdminDashboard} />
      <Route path="/admin/bookings/:id" component={AdminDashboard} />
      <Route path="/admin/drivers" component={AdminDashboard} />
      <Route path="/admin/drivers/new" component={AdminDashboard} />
      <Route path="/admin/drivers/:id/edit" component={AdminDashboard} />
      <Route path="/admin/requests" component={AdminDashboard} />
      <Route path="/admin/requests/:id" component={AdminDashboard} />
      <Route path="/admin/fleet" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
