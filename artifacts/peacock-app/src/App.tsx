import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";

import Home from "@/pages/Home";
import Tours from "@/pages/Tours";
import TourDetail from "@/pages/TourDetail";
import TourVariantDetail from "@/pages/TourVariantDetail";
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
import DestinationsGuide from "@/pages/DestinationsGuide";
import DestinationDetail from "@/pages/DestinationDetail";
import HowItWorks from "@/pages/HowItWorks";
import Reviews from "@/pages/Reviews";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import ArticlePage from "@/pages/ArticlePage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CancellationPolicy from "@/pages/CancellationPolicy";
import TripShare from "@/pages/TripShare";

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
      <Route path="/tours/:groupSlug/:duration" component={() => <PublicRoute component={TourVariantDetail} />} />
      <Route path="/tours/:slug" component={() => <PublicRoute component={TourDetail} />} />
      <Route path="/destinations" component={() => <PublicRoute component={DestinationsGuide} />} />
      <Route path="/destinations/:slug" component={() => <PublicRoute component={DestinationDetail} />} />
      <Route path="/how-it-works" component={() => <PublicRoute component={HowItWorks} />} />
      <Route path="/reviews" component={() => <PublicRoute component={Reviews} />} />
      <Route path="/about" component={() => <PublicRoute component={About} />} />
      <Route path="/faq" component={() => <PublicRoute component={FAQ} />} />
      <Route path="/contact" component={() => <PublicRoute component={Contact} />} />
      <Route path="/blog" component={() => <PublicRoute component={Blog} />} />
      <Route path="/blog/:slug" component={() => <PublicRoute component={ArticlePage} />} />
      <Route path="/destinations/articles/:slug" component={() => <PublicRoute component={ArticlePage} />} />
      <Route path="/privacy" component={() => <PublicRoute component={PrivacyPolicy} />} />
      <Route path="/terms" component={() => <PublicRoute component={TermsOfService} />} />
      <Route path="/cancellation-policy" component={() => <PublicRoute component={CancellationPolicy} />} />
      <Route path="/transfers" component={() => <PublicRoute component={Transfers} />} />
      <Route path="/checkout" component={() => <PublicRoute component={Checkout} />} />
      <Route path="/checkout/confirmation" component={() => <PublicRoute component={Confirmation} />} />
      <Route path="/trips/share/:token" component={TripShare} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />

      <Route path="/account" component={TouristPortal} />
      <Route path="/account/bookings" component={TouristPortal} />
      <Route path="/account/bookings/:id" component={TouristPortal} />
      <Route path="/account/saved-trips" component={TouristPortal} />
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
      <Route path="/admin/drivers/:id" component={AdminDashboard} />
      <Route path="/admin/customers" component={AdminDashboard} />
      <Route path="/admin/customers/:id" component={AdminDashboard} />
      <Route path="/admin/requests" component={AdminDashboard} />
      <Route path="/admin/requests/:id" component={AdminDashboard} />
      <Route path="/admin/fleet" component={AdminDashboard} />
      <Route path="/admin/leads" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
