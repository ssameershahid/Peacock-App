import React from 'react';
import { Switch, Route } from 'wouter';
import { AccountLayout } from './account/AccountLayout';
import AccountOverview from './account/AccountOverview';
import MyTrips from './account/MyTrips';
import TripDetail from './account/TripDetail';
import SavedTrips from './account/SavedTrips';
import Invoices from './account/Invoices';
import Profile from './account/Profile';

export default function TouristPortal() {
  return (
    <AccountLayout>
      <Switch>
        <Route path="/account" component={AccountOverview} />
        <Route path="/account/bookings" component={MyTrips} />
        <Route path="/account/bookings/:id" component={TripDetail} />
        <Route path="/account/saved-trips" component={SavedTrips} />
        <Route path="/account/invoices" component={Invoices} />
        <Route path="/account/profile" component={Profile} />
      </Switch>
    </AccountLayout>
  );
}
