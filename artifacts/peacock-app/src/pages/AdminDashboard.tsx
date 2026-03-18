import React from 'react';
import { Link } from 'wouter';
import { useAdminCYO } from '@/hooks/use-app-data';
import { 
  LayoutDashboard, Map, Users, Calendar, DollarSign, Settings, 
  CarFront, Bell, Search, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: requests, isLoading } = useAdminCYO();
  const pendingCount = requests?.filter(r => r.status === 'New').length || 0;

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-forest-700 text-white hidden md:flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-forest-600">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-forest-700 font-display text-xl italic pr-1">P</div>
          <span className="font-display text-xl tracking-wide">Peacock Admin</span>
        </div>
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 font-body text-xs font-bold text-forest-300 uppercase tracking-widest">Overview</div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-forest-600 text-white font-body text-sm font-medium">
            <LayoutDashboard className="w-4 h-4 text-amber-400" /> Dashboard
          </Link>
          <Link href="/admin/requests" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <div className="flex items-center gap-3"><Map className="w-4 h-4" /> CYO Pipeline</div>
            {pendingCount > 0 && <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
          </Link>
          
          <div className="px-3 mt-8 mb-2 font-body text-xs font-bold text-forest-300 uppercase tracking-widest">Management</div>
          <Link href="/admin/tours" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <Map className="w-4 h-4" /> Tours
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <Calendar className="w-4 h-4" /> Bookings
          </Link>
          <Link href="/admin/drivers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <Users className="w-4 h-4" /> Drivers
          </Link>
          <Link href="/admin/fleet" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <CarFront className="w-4 h-4" /> Fleet
          </Link>
          
          <div className="px-3 mt-8 mb-2 font-body text-xs font-bold text-forest-300 uppercase tracking-widest">System</div>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-forest-200 hover:bg-forest-600 hover:text-white font-body text-sm transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-warm-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-warm-50 rounded-full px-4 py-2 border border-warm-200 w-80">
            <Search className="w-4 h-4 text-warm-400 mr-2" />
            <input type="text" placeholder="Search bookings, drivers..." className="bg-transparent border-none outline-none font-body text-sm w-full text-forest-600 placeholder:text-warm-400" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-warm-500 hover:text-forest-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-sm font-bold border border-forest-200">
              A
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="font-display text-3xl text-forest-600 mb-1">Dashboard</h1>
              <p className="font-body text-warm-500 text-sm">Overview of platform activity for October 2024</p>
            </div>
            <div className="font-body text-sm font-medium text-warm-600 bg-white px-4 py-2 rounded-lg border border-warm-200 shadow-sm">
              Today: Oct 12, 2024
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-forest-500" />
                </div>
                <span className="font-body text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">+14.5%</span>
              </div>
              <p className="font-body text-warm-500 text-sm mb-1">Revenue (30d)</p>
              <h3 className="font-display text-3xl text-forest-600">{formatCurrency(45250)}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-body text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">+5.2%</span>
              </div>
              <p className="font-body text-warm-500 text-sm mb-1">Active Bookings</p>
              <h3 className="font-display text-3xl text-forest-600">124</h3>
            </div>

            <div className="bg-forest-600 p-6 rounded-2xl shadow-md relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                  <Map className="w-5 h-5 text-amber-300" />
                </div>
                {pendingCount > 0 && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
              </div>
              <p className="font-body text-white/70 text-sm mb-1 relative z-10">Pending CYO Requests</p>
              <div className="flex items-end justify-between relative z-10">
                <h3 className="font-display text-3xl text-white">{pendingCount}</h3>
                <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                  <Users className="w-5 h-5 text-forest-500" />
                </div>
                <span className="font-body text-xs font-medium text-warm-400">Total 24</span>
              </div>
              <p className="font-body text-warm-500 text-sm mb-1">Drivers on Road Today</p>
              <h3 className="font-display text-3xl text-forest-600">18</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-warm-100 flex justify-between items-center">
                <h3 className="font-display text-xl text-forest-600">Recent Bookings</h3>
                <Link href="/admin/bookings" className="text-sm font-body text-forest-500 hover:text-amber-500">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-warm-50 font-body text-xs text-warm-500 uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium border-b border-warm-200">Ref</th>
                      <th className="px-6 py-4 font-medium border-b border-warm-200">Customer</th>
                      <th className="px-6 py-4 font-medium border-b border-warm-200">Tour/Route</th>
                      <th className="px-6 py-4 font-medium border-b border-warm-200">Status</th>
                      <th className="px-6 py-4 font-medium border-b border-warm-200">Value</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm divide-y divide-warm-100">
                    <tr>
                      <td className="px-6 py-4 font-medium text-forest-600">BK-1042</td>
                      <td className="px-6 py-4 text-warm-600">Jane Doe</td>
                      <td className="px-6 py-4 text-warm-600">Classic Sri Lanka</td>
                      <td className="px-6 py-4"><Badge variant="success">Confirmed</Badge></td>
                      <td className="px-6 py-4 font-medium text-forest-600">£715</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-forest-600">BK-1043</td>
                      <td className="px-6 py-4 text-warm-600">Michael Smith</td>
                      <td className="px-6 py-4 text-warm-600">CMB to Kandy</td>
                      <td className="px-6 py-4"><Badge variant="amber">Pending</Badge></td>
                      <td className="px-6 py-4 font-medium text-forest-600">£65</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-forest-600">CYO-012</td>
                      <td className="px-6 py-4 text-warm-600">Amelia Pond</td>
                      <td className="px-6 py-4 text-warm-600">Custom South Coast</td>
                      <td className="px-6 py-4"><Badge variant="default">Quote Paid</Badge></td>
                      <td className="px-6 py-4 font-medium text-forest-600">£1,240</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Needed CYO */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-warm-100">
                <h3 className="font-display text-xl text-forest-600">Requires Action</h3>
              </div>
              <div className="p-4 flex-1">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-warm-50 rounded-xl"></div>
                    <div className="h-20 bg-warm-50 rounded-xl"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests?.filter(r => r.status === 'New' || r.status === 'Reviewing').map(req => (
                      <div key={req.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-body text-xs font-bold text-amber-600 tracking-wider">{req.id}</span>
                          <span className="font-body text-xs text-warm-500">{req.submittedAt}</span>
                        </div>
                        <p className="font-body font-medium text-forest-600 text-sm mb-1">{req.customer}</p>
                        <p className="font-body text-xs text-warm-500 truncate">{req.locations.join(' • ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
