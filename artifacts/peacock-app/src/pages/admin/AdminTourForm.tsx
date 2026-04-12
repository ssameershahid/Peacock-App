import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, CheckCircle2 } from 'lucide-react';
import { useTour, useUpdateTourItinerary, useUpdateTourVehicleRates, useUpdateTourMeta } from '@/hooks/use-app-data';
import AdminLayout from './AdminLayout';

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car' },
  { id: 'minivan', label: 'Minivan' },
  { id: 'large-van', label: 'Large Van' },
  { id: 'small-bus', label: 'Small Bus' },
  { id: 'medium-bus', label: 'Medium Bus' },
];

interface ItineraryDay {
  dayNumber: number;
  title: string;
  location: string;
  description: string;
  drivingTime: string;
  keyStops: string[];
}

export default function AdminTourForm() {
  const params = useParams<{ slug: string }>();
  const tourId = params?.slug ?? '';
  const isEdit = !!tourId && tourId !== 'new';

  const { data: tour, isLoading } = useTour(isEdit ? tourId : '');
  const updateItinerary = useUpdateTourItinerary();
  const updateRates = useUpdateTourVehicleRates();
  const updateMeta = useUpdateTourMeta();

  // Itinerary state (fully controlled)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  // Vehicle rates state
  const [vehicleRates, setVehicleRates] = useState<Record<string, number>>({
    car: 45, minivan: 65, 'large-van': 85, 'small-bus': 120, 'medium-bus': 175,
  });

  // Save status
  const [saved, setSaved] = useState(false);

  // showAddOns — stored in localStorage per tour ID (no DB migration needed)
  const [showAddOns, setShowAddOns] = useState<boolean>(() =>
    localStorage.getItem(`peacock_showAddOns_${tourId}`) === 'true'
  );

  useEffect(() => {
    if (tour) {
      // Load itinerary from tour data
      if (tour.itinerary?.length) {
        setItinerary(tour.itinerary.map((d: any) => ({
          dayNumber: d.day ?? d.dayNumber,
          title: d.title ?? '',
          location: d.location ?? '',
          description: d.description ?? '',
          drivingTime: d.drivingTime ?? '',
          keyStops: d.stops ?? d.keyStops ?? [],
        })));
      } else {
        // Empty placeholder for the tour's duration
        const days = tour.durationDays ?? 7;
        setItinerary(Array.from({ length: days }, (_, i) => ({
          dayNumber: i + 1,
          title: '',
          location: '',
          description: '',
          drivingTime: '',
          keyStops: [],
        })));
      }

      // Load vehicle rates
      if (tour.vehicleRates) {
        const rates: Record<string, number> = {};
        VEHICLE_TYPES.forEach(v => {
          rates[v.id] = tour.vehicleRates?.[v.id] ?? 0;
        });
        setVehicleRates(rates);
      }
    }
  }, [tour]);

  // ── Itinerary actions ──────────────────────────────────────────────────────

  const updateDay = (i: number, field: keyof ItineraryDay, value: any) => {
    setItinerary(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const addDay = () => {
    setItinerary(prev => [...prev, {
      dayNumber: prev.length + 1,
      title: '',
      location: '',
      description: '',
      drivingTime: '',
      keyStops: [],
    }]);
  };

  const removeDay = (i: number) => {
    setItinerary(prev => prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, dayNumber: idx + 1 })));
  };

  const moveDay = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= itinerary.length) return;
    const next = [...itinerary];
    [next[i], next[j]] = [next[j], next[i]];
    setItinerary(next.map((d, idx) => ({ ...d, dayNumber: idx + 1 })));
  };

  const updateStops = (i: number, value: string) => {
    updateDay(i, 'keyStops', value.split(',').map(s => s.trim()).filter(Boolean));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!tourId) return;
    try {
      await updateItinerary.mutateAsync({ tourId, days: itinerary });
      await updateRates.mutateAsync({
        tourId,
        rates: VEHICLE_TYPES.map(v => ({ vehicleType: v.id, pricePerDay: vehicleRates[v.id] ?? 0 })),
      });
      localStorage.setItem(`peacock_showAddOns_${tourId}`, String(showAddOns));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Loading..." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tours', href: '/admin/tours' }, { label: 'Edit' }]}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const durationDays = tour?.durationDays ?? itinerary.length;
  const pageTitle = isEdit
    ? `Edit: ${tour?.title ?? 'Tour'} — ${durationDays} Days`
    : 'Create new tour';

  return (
    <AdminLayout
      title={pageTitle}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Tours', href: '/admin/tours' },
        { label: isEdit ? 'Edit variant' : 'New' },
      ]}
    >
      <div className="space-y-6 max-w-4xl pb-32">

        {/* Tour context banner */}
        {isEdit && tour && (
          <div className="bg-forest-50 border border-forest-100 rounded-2xl p-4 flex items-center gap-4">
            {tour.images?.[0] && (
              <img src={tour.images[0]} alt={tour.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
            )}
            <div>
              <p className="font-body text-xs text-warm-400 uppercase tracking-wider">Editing variant</p>
              <p className="font-display text-lg text-forest-600">{tour.title}</p>
              <div className="flex gap-2 mt-1">
                <span className="bg-forest-600 text-white font-body text-[10px] font-bold px-2.5 py-0.5 rounded-pill">{durationDays} Days / {durationDays - 1} Nights</span>
                <span className="bg-warm-100 text-warm-600 font-body text-[10px] px-2.5 py-0.5 rounded-pill">{tour.difficulty}</span>
                {tour.regions?.slice(0, 2).map((r: string) => (
                  <span key={r} className="bg-warm-100 text-warm-500 font-body text-[10px] px-2.5 py-0.5 rounded-pill">{r}</span>
                ))}
              </div>
            </div>
            <div className="ml-auto">
              <Link href={`/tours/${tour.groupSlug ?? tour.slug}/${durationDays}`}>
                <button className="font-body text-xs text-forest-500 hover:text-forest-600 border border-forest-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
                  Preview →
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Vehicle Rates */}
        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Vehicle rates (£ per day)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VEHICLE_TYPES.map(v => (
              <div key={v.id} className="flex items-center gap-2">
                <label className="font-body text-sm text-warm-600 w-24 shrink-0">{v.label}</label>
                <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden flex-1">
                  <span className="px-2.5 py-2 bg-warm-50 font-body text-sm text-warm-400 border-r border-warm-200">£</span>
                  <input
                    type="number"
                    min={0}
                    value={vehicleRates[v.id] ?? 0}
                    onChange={e => setVehicleRates(prev => ({ ...prev, [v.id]: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 min-w-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-Ons visibility toggle */}
        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-body text-sm font-semibold text-forest-600">Show add-ons to customers</h2>
              <p className="font-body text-xs text-warm-400 mt-0.5">When off, the add-ons section is hidden on the public tour page.</p>
            </div>
            <button
              onClick={() => setShowAddOns(prev => !prev)}
              className={`w-10 h-6 rounded-full relative transition-colors ${showAddOns ? 'bg-emerald-500' : 'bg-warm-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${showAddOns ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Itinerary builder */}
        <div className="bg-white rounded-xl border border-warm-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-body text-sm font-semibold text-forest-600">Itinerary — {itinerary.length} days</h2>
              <p className="font-body text-xs text-warm-400 mt-0.5">Each day is shown to customers on the tour page. Fill in title, location, description and key stops.</p>
            </div>
            <button
              onClick={addDay}
              className="flex items-center gap-1 text-forest-500 hover:text-forest-600 font-body text-xs font-medium border border-forest-200 rounded-lg px-3 py-1.5 hover:bg-forest-50 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add day
            </button>
          </div>

          <div className="space-y-4">
            {itinerary.map((day, i) => (
              <div key={i} className="border border-warm-200 rounded-xl p-4 bg-warm-50/30">
                {/* Day header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-600 text-white font-body text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-body text-sm font-medium text-forest-600">Day {i + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveDay(i, -1)} disabled={i === 0} className="p-1.5 text-warm-400 hover:text-forest-600 disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveDay(i, 1)} disabled={i === itinerary.length - 1} className="p-1.5 text-warm-400 hover:text-forest-600 disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeDay(i)} className="p-1.5 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={day.title}
                    onChange={e => updateDay(i, 'title', e.target.value)}
                    placeholder="Day title (e.g. Airport → Sigiriya)"
                    className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-white"
                  />
                  <input
                    type="text"
                    value={day.location}
                    onChange={e => updateDay(i, 'location', e.target.value)}
                    placeholder="Location (e.g. Sigiriya)"
                    className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-white"
                  />
                </div>

                <textarea
                  rows={2}
                  value={day.description}
                  onChange={e => updateDay(i, 'description', e.target.value)}
                  placeholder="Day description shown to customers..."
                  className="mt-3 w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none bg-white"
                />

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input
                    type="text"
                    value={day.drivingTime}
                    onChange={e => updateDay(i, 'drivingTime', e.target.value)}
                    placeholder="Driving time (e.g. 3.5 hours)"
                    className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-white"
                  />
                  <input
                    type="text"
                    value={day.keyStops.join(', ')}
                    onChange={e => updateStops(i, e.target.value)}
                    placeholder="Key stops (comma-separated)"
                    className="border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-white"
                  />
                </div>
              </div>
            ))}

            {itinerary.length === 0 && (
              <div className="text-center py-10 text-warm-400 font-body text-sm">
                No days yet. <button onClick={addDay} className="text-forest-500 underline">Add your first day</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 p-4 z-40 lg:pl-[276px]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <p className="font-body text-xs text-warm-400">
            Changes save itinerary days and vehicle rates for this duration variant only.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/admin/tours">
              <button className="px-6 py-2.5 font-body text-sm text-warm-500 hover:text-forest-600 transition-all">Cancel</button>
            </Link>
            <button
              onClick={handleSave}
              disabled={updateItinerary.isPending || updateRates.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all disabled:opacity-60"
            >
              {updateItinerary.isPending || updateRates.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
