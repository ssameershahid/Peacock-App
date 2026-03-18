import { useState } from 'react';
import { Camera, Plus, X, AlertTriangle } from 'lucide-react';
import { useDriverProfile } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';

export default function DriverProfile() {
  const { data: profile, isLoading } = useDriverProfile();
  const [available, setAvailable] = useState(profile?.available ?? true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-forest-600 text-white px-5 pt-12 pb-8 rounded-b-[32px] md:rounded-none md:pt-8 md:pb-6">
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <h1 className="font-display text-3xl">My Profile</h1>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-6 pb-8 space-y-6">
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-forest-50 border-4 border-white shadow-md">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-3xl text-forest-600">{profile.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center shadow-md hover:bg-forest-500 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-display text-xl text-forest-600">{profile.name}</h2>
            <p className="font-body text-xs text-warm-400">Name managed by admin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Phone</label>
              <input
                type="tel"
                defaultValue={profile.phone}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Bio</label>
              <textarea
                defaultValue={profile.bio}
                rows={4}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map(lang => (
                  <span key={lang} className="bg-forest-50 text-forest-600 font-body text-sm px-3 py-1.5 rounded-pill flex items-center gap-1.5">
                    {lang}
                    <button className="text-forest-400 hover:text-forest-600"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <button className="border border-dashed border-warm-300 text-warm-400 font-body text-sm px-3 py-1.5 rounded-pill flex items-center gap-1 hover:border-forest-300 hover:text-forest-500 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
            <div>
              <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Experience</label>
              <input
                type="text"
                defaultValue={profile.experience}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]"
              />
            </div>
          </div>

          <button className="mt-5 w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-xl min-h-[48px] transition-colors">
            Save profile
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-sm font-semibold text-forest-600">Availability</h2>
            <button
              onClick={() => setAvailable(!available)}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                available ? 'bg-emerald-500' : 'bg-warm-300'
              )}
            >
              <div className={cn(
                'absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform',
                available ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>
          <p className="font-body text-sm text-warm-500">
            {available ? 'Available for trips' : 'Unavailable'}
          </p>
          {!available && (
            <div className="mt-3 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="font-body text-sm text-amber-700">You won't receive new trip assignments while unavailable</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-sm font-semibold text-forest-600">My Vehicles</h2>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="flex items-center gap-1.5 text-amber-600 font-body text-sm font-medium hover:text-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add vehicle
            </button>
          </div>

          <div className="space-y-4">
            {profile.vehicles.map(vehicle => (
              <div key={vehicle.id} className="border border-warm-100 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-warm-50 overflow-hidden shrink-0">
                    <img src={vehicle.image} alt={vehicle.type} className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-body font-semibold text-forest-600 text-sm">{vehicle.type}</h3>
                      <button className="font-body text-xs text-amber-600 font-medium hover:underline">Edit</button>
                    </div>
                    <p className="font-body text-xs text-warm-400 mt-0.5">{vehicle.model} {"\u00B7"} {vehicle.year}</p>
                    <p className="font-body text-xs text-warm-500 mt-0.5">{vehicle.plate}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {vehicle.features.map(f => (
                        <span key={f} className="bg-warm-50 text-warm-500 font-body text-[10px] px-2 py-0.5 rounded-pill">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddVehicle && (
            <div className="mt-4 border border-warm-200 rounded-xl p-5 bg-warm-50 space-y-4">
              <h3 className="font-body text-sm font-semibold text-forest-600">Add new vehicle</h3>
              <div>
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Vehicle type</label>
                <select className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]">
                  <option>Car</option>
                  <option>Minivan</option>
                  <option>Large Van</option>
                  <option>Small Bus</option>
                  <option>Medium Bus</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Plate number</label>
                  <input type="text" placeholder="WP-XXX-0000" className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Year</label>
                  <input type="text" placeholder="2024" className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Features</label>
                <div className="flex flex-wrap gap-2">
                  {['AC', 'WiFi', 'USB charging', 'Cooler box', 'Bluetooth', 'GPS'].map(f => (
                    <label key={f} className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-pill px-3 py-1.5 cursor-pointer hover:bg-forest-50 transition-colors">
                      <input type="checkbox" className="accent-forest-600" />
                      <span className="font-body text-xs">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Vehicle photo</label>
                <div className="border-2 border-dashed border-warm-200 rounded-xl p-6 text-center hover:border-forest-300 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                  <p className="font-body text-xs text-warm-400">Tap to upload photo</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-xl min-h-[48px] transition-colors">
                  Add vehicle
                </button>
                <button
                  onClick={() => setShowAddVehicle(false)}
                  className="px-6 border border-warm-200 text-warm-500 font-body text-sm font-medium rounded-xl min-h-[48px] hover:bg-warm-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
