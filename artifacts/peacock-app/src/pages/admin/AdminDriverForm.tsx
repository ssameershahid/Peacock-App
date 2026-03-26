import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Plus, Trash2, Camera } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function AdminDriverForm() {
  const params = useParams<{ id: string }>();
  const isEdit = !!params?.id;
  const [vehicles, setVehicles] = useState([
    { type: 'Minivan', plate: 'WP-CAB-1234', year: '2022', features: ['AC', 'WiFi', 'Cooler box'] },
  ]);

  return (
    <AdminLayout
      title={isEdit ? 'Edit Driver' : 'Add New Driver'}
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Drivers', href: '/admin/drivers' }, { label: isEdit ? 'Edit' : 'New' }]}
    >
      <div className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Email (used for login)</label>
              <input type="email" placeholder="driver@example.com" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="font-body text-sm text-blue-700">When you create this driver, they'll receive a welcome email with login instructions.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-forest-600" />
              <span className="font-body text-sm text-forest-600">Generate temporary password</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-warm-100 border-2 border-dashed border-warm-300 flex items-center justify-center cursor-pointer hover:border-forest-300 transition-colors">
                <Camera className="w-6 h-6 text-warm-300" />
              </div>
              <button className="font-body text-sm text-forest-500 hover:text-forest-600 font-medium">Upload photo</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">First name</label>
                <input type="text" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Last name</label>
                <input type="text" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Phone</label>
              <input type="tel" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Bio</label>
              <textarea rows={3} className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Languages</label>
              <input type="text" placeholder="Type and press Enter to add..." className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Experience (years)</label>
              <input type="number" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Region preferences</label>
              <div className="flex flex-wrap gap-2">
                {['Colombo', 'Kandy', 'South Coast', 'Hill Country', 'Cultural Triangle', 'East Coast'].map(r => (
                  <label key={r} className="flex items-center gap-1.5 bg-warm-50 border border-warm-200 rounded-pill px-3 py-1.5 cursor-pointer hover:bg-forest-50 transition-colors">
                    <input type="checkbox" className="accent-forest-600" />
                    <span className="font-body text-xs">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-sm font-semibold text-forest-600">Vehicles</h2>
            <button onClick={() => setVehicles([...vehicles, { type: 'Car', plate: '', year: '', features: [] }])} className="flex items-center gap-1 text-forest-500 hover:text-forest-600 font-body text-xs font-medium"><Plus className="w-3 h-3" /> Add vehicle</button>
          </div>
          <div className="space-y-4">
            {vehicles.map((v, i) => (
              <div key={i} className="border border-warm-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-sm font-medium text-forest-600">Vehicle {i + 1}</span>
                  <button onClick={() => setVehicles(vehicles.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <select defaultValue={v.type} className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300">
                    {['Car', 'Minivan', 'Large Van', 'Small Bus', 'Medium Bus'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="text" defaultValue={v.plate} placeholder="Plate number" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <input type="text" defaultValue={v.year} placeholder="Year" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['AC', 'WiFi', 'Cooler box', 'USB charging', 'Overhead storage'].map(f => (
                    <label key={f} className="flex items-center gap-1.5 bg-warm-50 border border-warm-200 rounded-pill px-3 py-1 cursor-pointer hover:bg-forest-50 transition-colors">
                      <input type="checkbox" defaultChecked={v.features.includes(f)} className="accent-forest-600" />
                      <span className="font-body text-[10px]">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Payout Rates</h2>
          <div className="space-y-3 mb-4">
            <label className="text-[13px] font-medium text-warm-600 block">Tour daily fee by vehicle</label>
            {[{ name: 'Car', fee: 15 }, { name: 'Minivan', fee: 20 }, { name: 'Large Van', fee: 25 }, { name: 'Small Bus', fee: 35 }, { name: 'Medium Bus', fee: 50 }].map(v => (
              <div key={v.name} className="flex items-center gap-3">
                <span className="font-body text-sm text-warm-600 w-28">{v.name}</span>
                <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                  <span className="px-3 py-2 bg-warm-50 font-body text-sm text-warm-400 border-r border-warm-200">{"\u00A3"}</span>
                  <input type="number" defaultValue={v.fee} className="w-20 px-3 py-2 font-body text-sm focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-warm-600 w-28">Transfer %</span>
            <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
              <input type="number" defaultValue={15} className="w-20 px-3 py-2 font-body text-sm focus:outline-none" />
              <span className="px-3 py-2 bg-warm-50 font-body text-sm text-warm-400 border-l border-warm-200">%</span>
            </div>
          </div>
          <p className="font-body text-xs text-warm-400 mt-2">Commission applies to the full booking total including add-ons</p>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Status</h2>
          <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
            <div>
              <span className="font-body text-sm font-medium text-forest-600">Driver active</span>
              <p className="font-body text-xs text-warm-400 mt-0.5">Deactivating removes this driver from trip assignments</p>
            </div>
            <div className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/admin/drivers">
            <button className="px-6 py-2.5 font-body text-sm text-warm-500 hover:text-forest-600 transition-all duration-200">Cancel</button>
          </Link>
          <button className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
            {isEdit ? 'Save changes' : 'Create driver'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
