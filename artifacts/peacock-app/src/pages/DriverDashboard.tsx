import { Switch, Route } from 'wouter';
import DriverLayout from './driver/DriverLayout';
import DriverHome from './driver/DriverHome';
import DriverTrips from './driver/DriverTrips';
import DriverTripDetail from './driver/DriverTripDetail';
import DriverEarnings from './driver/DriverEarnings';
import DriverProfile from './driver/DriverProfile';

export default function DriverDashboard() {
  return (
    <DriverLayout>
      <Switch>
        <Route path="/driver" component={DriverHome} />
        <Route path="/driver/trips/:id" component={DriverTripDetail} />
        <Route path="/driver/trips" component={DriverTrips} />
        <Route path="/driver/earnings" component={DriverEarnings} />
        <Route path="/driver/profile" component={DriverProfile} />
        <Route component={DriverHome} />
      </Switch>
    </DriverLayout>
  );
}
