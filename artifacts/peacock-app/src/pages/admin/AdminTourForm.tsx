import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { useTour } from '@/hooks/use-app-data';
import AdminLayout from './AdminLayout';

export default function AdminTourForm() {
  const params = useParams<{ slug: string }>();
  const isEdit = !!params?.slug;
  const { data: tour, isLoading } = useTour(params?.slug || '');
  const [days, setDays] = useState(3);
  const [included, setIncluded] = useState<string[]>(['Private vehicle & driver', 'Fuel & tolls', 'Airport pickup']);
  const [notIncluded, setNotIncluded] = useState<string[]>(['Accommodation', 'Meals', 'Entry tickets']);
  const [addOns, setAddOns] = useState<{ name: string; desc: string; price: string }[]>([
    { name: 'Airport Pickup', desc: 'CMB airport collection', price: '28' },
  ]);
  const [seasons, setSeasons] = useState<{ start: string; end: string; mult: string }[]>([
    { start: '2026-12-15', end: '2027-01-15', mult: '1.25' },
  ]);

  useEffect(() => {
    if (tour) {
      if (tour.itinerary?.length) setDays(tour.itinerary.length);
      if (tour.included) setIncluded(tour.included);
      if (tour.notIncluded) setNotIncluded(tour.notIncluded);
    }
  }, [tour]);

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Loading..." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tours', href: '/admin/tours' }, { label: 'Edit' }]}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const title = isEdit ? `Edit: ${tour?.title || 'Tour'}` : 'Create new tour';

  return (
    <AdminLayout
      title={title}
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tours', href: '/admin/tours' }, { label: isEdit ? 'Edit' : 'New' }]}
    >
      <div className="space-y-6 max-w-4xl pb-24">
        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Title</label>
                <input type="text" defaultValue={tour?.title || ''} placeholder="e.g. Classic Sri Lanka" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Slug</label>
                <input type="text" defaultValue={tour?.slug || ''} placeholder="classic-sri-lanka" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-warm-50" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Tagline</label>
              <input type="text" defaultValue={tour?.tagline || ''} placeholder="A short compelling tagline" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Description</label>
              <textarea rows={5} defaultValue={tour?.description || ''} placeholder="Full tour description..." className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Type</label>
              <select className="border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300">
                <option>Ready-made</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Duration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Days</label>
              <input type="number" defaultValue={tour?.durationDays || 7} min={1} className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Nights (auto = days - 1)</label>
              <input type="number" defaultValue={tour?.durationNights || 6} className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm bg-warm-50 focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Classification</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Regions</label>
              <div className="flex flex-wrap gap-2">
                {['Colombo', 'Cultural Triangle', 'Kandy', 'Hill Country', 'South Coast', 'Ella', 'Sigiriya', 'Yala', 'Trincomalee', 'Negombo', 'Galle'].map(r => (
                  <label key={r} className="flex items-center gap-1.5 bg-warm-50 border border-warm-200 rounded-pill px-3 py-1.5 cursor-pointer hover:bg-forest-50 transition-colors">
                    <input type="checkbox" defaultChecked={tour?.regions?.includes(r)} className="accent-forest-600" />
                    <span className="font-body text-xs">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Difficulty</label>
              <div className="flex gap-3">
                {['Easy', 'Moderate', 'Challenging'].map(d => (
                  <label key={d} className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-forest-50 transition-colors">
                    <input type="radio" name="difficulty" defaultChecked={tour?.difficulty === d} className="accent-forest-600" />
                    <span className="font-body text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Highlights (tag input)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(tour?.highlights || ['Ancient ruins', 'Wildlife safari', 'Tea plantations']).map((h: string, i: number) => (
                  <span key={i} className="bg-forest-50 text-forest-600 font-body text-xs px-3 py-1.5 rounded-pill flex items-center gap-1.5">
                    {h} <button className="text-forest-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <input type="text" placeholder="Type and press Enter to add..." className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Included / Not included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-body text-xs font-medium text-emerald-600 mb-2 block">Included</label>
              <div className="space-y-2">
                {included.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" defaultValue={item} className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <button onClick={() => setIncluded(included.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setIncluded([...included, ''])} className="font-body text-xs text-forest-500 hover:text-forest-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>
              </div>
            </div>
            <div>
              <label className="font-body text-xs font-medium text-red-500 mb-2 block">Not included</label>
              <div className="space-y-2">
                {notIncluded.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" defaultValue={item} className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <button onClick={() => setNotIncluded(notIncluded.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setNotIncluded([...notIncluded, ''])} className="font-body text-xs text-forest-500 hover:text-forest-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-sm font-semibold text-forest-600">Itinerary builder</h2>
            <button onClick={() => setDays(days + 1)} className="flex items-center gap-1 text-forest-500 hover:text-forest-600 font-body text-xs font-medium"><Plus className="w-3 h-3" /> Add day</button>
          </div>
          <div className="space-y-4">
            {Array.from({ length: days }).map((_, i) => {
              const dayData = tour?.itinerary?.[i];
              return (
                <div key={i} className="border border-warm-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest-600 text-white font-body text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <span className="font-body text-sm font-medium text-forest-600">Day {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-warm-400 hover:text-forest-600"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-warm-400 hover:text-forest-600"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDays(Math.max(1, days - 1))} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" defaultValue={dayData?.title || ''} placeholder="Title (e.g. Colombo to Sigiriya)" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <input type="text" defaultValue={dayData?.location || ''} placeholder="Location" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  </div>
                  <textarea rows={2} defaultValue={dayData?.description || ''} placeholder="Description" className="mt-3 w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input type="text" defaultValue={dayData?.drivingTime || ''} placeholder="Driving time (e.g. 4-5 hours)" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <input type="text" defaultValue={dayData?.stops?.join(', ') || ''} placeholder="Key stops (comma-separated)" className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Pricing</h2>
          <div className="mb-6">
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Vehicle rates (per day)</label>
            <div className="space-y-2">
              {[{ name: 'Car', rate: 45 }, { name: 'Minivan', rate: 65 }, { name: 'Large Van', rate: 85 }, { name: 'Small Bus', rate: 120 }, { name: 'Medium Bus', rate: 175 }].map(v => (
                <div key={v.name} className="flex items-center gap-3">
                  <span className="font-body text-sm text-warm-600 w-28">{v.name}</span>
                  <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                    <span className="px-3 py-2 bg-warm-50 font-body text-sm text-warm-400 border-r border-warm-200">{"\u00A3"}</span>
                    <input type="number" defaultValue={tour?.vehicleRates?.[v.name.toLowerCase().replace(' ', '-') as keyof typeof tour.vehicleRates] || v.rate} className="w-20 px-3 py-2 font-body text-sm focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-warm-600">Add-ons</label>
              <button onClick={() => setAddOns([...addOns, { name: '', desc: '', price: '' }])} className="font-body text-xs text-forest-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add add-on</button>
            </div>
            <div className="space-y-2">
              {addOns.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" defaultValue={a.name} placeholder="Name" className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <input type="text" defaultValue={a.desc} placeholder="Description" className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                    <span className="px-2 py-2 bg-warm-50 font-body text-sm text-warm-400 border-r border-warm-200">{"\u00A3"}</span>
                    <input type="number" defaultValue={a.price} className="w-16 px-2 py-2 font-body text-sm focus:outline-none" />
                  </div>
                  <button onClick={() => setAddOns(addOns.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-warm-600">Seasonal pricing</label>
              <button onClick={() => setSeasons([...seasons, { start: '', end: '', mult: '1.0' }])} className="font-body text-xs text-forest-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add season</button>
            </div>
            <div className="space-y-2">
              {seasons.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="date" defaultValue={s.start} className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <input type="date" defaultValue={s.end} className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <input type="text" defaultValue={s.mult} placeholder="x1.3" className="w-20 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                  <button onClick={() => setSeasons(seasons.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Min lead time (days)</label>
              <input type="number" defaultValue={tour?.leadTimeDays || 7} className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Max extra days</label>
              <input type="number" defaultValue={tour?.maxExtraDays || 3} className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
            <span className="font-body text-sm font-medium text-forest-600">Tour active</span>
            <div className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Images</h2>
          <div className="border-2 border-dashed border-warm-200 rounded-xl p-8 text-center hover:border-forest-300 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-warm-300 mx-auto mb-3" />
            <p className="font-body text-sm text-warm-500">Drag images here or click to upload</p>
            <p className="font-body text-xs text-warm-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-20 h-20 rounded-xl bg-warm-100 border border-warm-200" />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 p-4 z-40 lg:pl-[276px]">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
          <Link href="/admin/tours">
            <button className="px-6 py-2.5 font-body text-sm text-warm-500 hover:text-forest-600 transition-all duration-200">Cancel</button>
          </Link>
          <button className="px-6 py-2.5 bg-white border border-warm-200 text-forest-600 font-body text-sm font-medium rounded-full hover:bg-warm-50 transition-all duration-200">Save as draft</button>
          <button className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">Publish tour</button>
        </div>
      </div>
    </AdminLayout>
  );
}
