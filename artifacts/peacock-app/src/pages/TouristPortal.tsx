import React from 'react';
import { Link, useLocation } from 'wouter';
import { useUserBookings } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Map, FileText, User, LogOut, ArrowRight, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TouristPortal() {
  const { data: bookings, isLoading } = useUserBookings();
  const [activeTab, setActiveTab] = React.useState('upcoming');

  const filteredBookings = bookings?.filter(b => 
    activeTab === 'upcoming' ? ['Upcoming', 'Quote Ready', 'New'].includes(b.status) : ['Completed', 'Cancelled'].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Portal Header */}
      <div className="bg-forest-600 text-white pt-32 pb-12 px-6">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-2">Welcome back, <span className="italic text-amber-300">Jane</span></h1>
            <p className="font-body text-white/70">Manage your Sri Lankan adventures.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-pill">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-4 sticky top-24">
            <nav className="space-y-1">
              <Link href="/account/bookings" className="flex items-center gap-3 w-full p-3 rounded-xl bg-forest-50 text-forest-600 font-body font-medium transition-colors">
                <Map className="w-5 h-5 text-forest-500" /> My Journeys
              </Link>
              <Link href="/account/invoices" className="flex items-center gap-3 w-full p-3 rounded-xl text-warm-600 hover:bg-warm-50 font-body transition-colors">
                <FileText className="w-5 h-5 text-warm-400" /> Invoices
              </Link>
              <Link href="/account/profile" className="flex items-center gap-3 w-full p-3 rounded-xl text-warm-600 hover:bg-warm-50 font-body transition-colors">
                <User className="w-5 h-5 text-warm-400" /> Profile Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <h2 className="font-display text-3xl text-forest-600 mb-6">My Journeys</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-warm-100/50 p-1 rounded-pill w-fit mb-8">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-pill font-body text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-forest-600' : 'text-warm-500 hover:text-forest-600'}`}
            >
              Upcoming Trips
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-pill font-body text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-white shadow-sm text-forest-600' : 'text-warm-500 hover:text-forest-600'}`}
            >
              Past Trips
            </button>
          </div>

          {/* List */}
          <div className="space-y-5">
            {isLoading ? (
              <div className="h-40 bg-white border border-warm-100 rounded-2xl animate-pulse" />
            ) : filteredBookings?.length === 0 ? (
              <div className="bg-white border border-warm-100 dashed rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mb-4">
                  <Map className="w-8 h-8 text-forest-400" />
                </div>
                <h3 className="font-display text-2xl text-forest-600 mb-2">No trips found</h3>
                <p className="font-body text-warm-500 mb-6">You don't have any {activeTab} journeys yet.</p>
                <Link href="/tours">
                  <Button>Start exploring</Button>
                </Link>
              </div>
            ) : (
              filteredBookings?.map(booking => (
                <div key={booking.id} className="bg-white border border-warm-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-body font-medium text-warm-400 tracking-wider uppercase">{booking.id}</span>
                      <Badge variant={
                        booking.status === 'Upcoming' ? 'success' : 
                        booking.status === 'Completed' ? 'secondary' : 
                        booking.status === 'Cancelled' ? 'destructive' : 'amber'
                      }>
                        {booking.status}
                      </Badge>
                      {booking.type === 'cyo' && <Badge variant="outline" className="border-amber-300 text-amber-500 bg-amber-50">Custom</Badge>}
                    </div>
                    <h3 className="font-display text-2xl text-forest-600 mb-2">{booking.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-body text-warm-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-500" /> {booking.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{booking.vehicle}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end w-full sm:w-auto gap-4 sm:gap-2 border-t sm:border-t-0 border-warm-100 pt-4 sm:pt-0">
                    <span className="font-body font-semibold text-lg text-forest-600">{formatCurrency(booking.price)}</span>
                    <Button variant="outline" className="w-full sm:w-auto group-hover:bg-forest-500 group-hover:text-white group-hover:border-forest-500 transition-colors">
                      View details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
