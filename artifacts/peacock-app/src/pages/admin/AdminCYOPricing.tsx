import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import AdminLayout from './AdminLayout';

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car', desc: 'Toyota Prius · up to 3 pax' },
  { id: 'minivan', label: 'Minivan', desc: 'Toyota HiAce · up to 6 pax' },
  { id: 'large-van', label: 'Large Van', desc: 'Toyota HiAce HR · up to 10 pax' },
  { id: 'small-bus', label: 'Small Bus', desc: 'Toyota Coaster · up to 20 pax' },
  { id: 'medium-bus', label: 'Medium Bus', desc: 'King Long · up to 35 pax' },
];

function useCYOPricingAdmin() {
  return useQuery({
    queryKey: ['cyo-pricing'],
    queryFn: () => api.get<{ vehicleRates: Record<string, number>; upsells: any[] }>('/cyo-pricing'),
  });
}

export default function AdminCYOPricing() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const { data, isLoading } = useCYOPricingAdmin();

  // ── Vehicle rates ──────────────────────────────────────────────────────────
  const [rateEdits, setRateEdits] = useState<Record<string, string>>({});
  const [savingRate, setSavingRate] = useState<string | null>(null);
  const [savedRate, setSavedRate] = useState<string | null>(null);

  const saveRate = async (vehicleType: string) => {
    const val = parseInt(rateEdits[vehicleType] ?? '', 10);
    if (!val || val <= 0) return;
    setSavingRate(vehicleType);
    try {
      await api.put(`/cyo-pricing/rates/${vehicleType}`, { pricePerDay: val });
      qc.invalidateQueries({ queryKey: ['cyo-pricing'] });
      setSavedRate(vehicleType);
      setTimeout(() => setSavedRate(null), 2000);
    } finally {
      setSavingRate(null);
    }
  };

  // ── Upsell items ───────────────────────────────────────────────────────────
  const [newUpsell, setNewUpsell] = useState({ name: '', description: '', priceGBP: '' });
  const [addingUpsell, setAddingUpsell] = useState(false);

  const addUpsell = async () => {
    const price = parseInt(newUpsell.priceGBP, 10);
    if (!newUpsell.name.trim() || !price || price <= 0) return;
    setAddingUpsell(true);
    try {
      await api.post('/cyo-pricing/upsells', {
        name: newUpsell.name.trim(),
        description: newUpsell.description.trim() || undefined,
        priceGBP: price,
        sortOrder: (data?.upsells?.length ?? 0) + 1,
      });
      qc.invalidateQueries({ queryKey: ['cyo-pricing'] });
      setNewUpsell({ name: '', description: '', priceGBP: '' });
    } finally {
      setAddingUpsell(false);
    }
  };

  const toggleUpsell = async (id: string, isActive: boolean) => {
    await api.put(`/cyo-pricing/upsells/${id}`, { isActive: !isActive });
    qc.invalidateQueries({ queryKey: ['cyo-pricing'] });
  };

  const deleteUpsell = async (id: string) => {
    await api.delete(`/cyo-pricing/upsells/${id}`);
    qc.invalidateQueries({ queryKey: ['cyo-pricing'] });
  };

  // ── Preview calculator ─────────────────────────────────────────────────────
  const [previewVehicle, setPreviewVehicle] = useState('minivan');
  const [previewDays, setPreviewDays] = useState(7);
  const previewRate = data?.vehicleRates?.[previewVehicle] ?? 0;
  const previewTotal = previewRate * previewDays;

  return (
    <AdminLayout
      title="CYO Pricing"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'CYO Pricing' }]}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-8">

          {/* Vehicle Rates */}
          <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-100">
              <h2 className="font-display text-xl text-forest-600">Vehicle Rates</h2>
              <p className="font-body text-sm text-warm-400 mt-0.5">Per-day rate shown to customers in the CYO wizard. Separate from Ready-to-Go tour rates.</p>
            </div>
            <div className="divide-y divide-warm-100">
              {VEHICLE_TYPES.map(vt => {
                const current = data?.vehicleRates?.[vt.id] ?? 0;
                const editVal = rateEdits[vt.id] ?? String(current);
                const isDirty = editVal !== String(current);
                const isSaving = savingRate === vt.id;
                const justSaved = savedRate === vt.id;
                return (
                  <div key={vt.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-forest-600">{vt.label}</p>
                      <p className="font-body text-xs text-warm-400">{vt.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm text-warm-400">£</span>
                      <input
                        type="number"
                        min={1}
                        value={editVal}
                        onChange={e => setRateEdits(prev => ({ ...prev, [vt.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && saveRate(vt.id)}
                        className="w-24 bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 font-body text-sm text-forest-600 focus:ring-2 focus:ring-forest-500 outline-none"
                      />
                      <span className="font-body text-sm text-warm-400">/ day</span>
                      <Button
                        size="sm"
                        onClick={() => saveRate(vt.id)}
                        disabled={!isDirty || isSaving}
                        className={
                          justSaved
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-forest-600 text-white hover:bg-forest-700'
                        }
                      >
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : justSaved ? (
                          'Saved'
                        ) : (
                          <><Save className="w-3.5 h-3.5 mr-1" />Save</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Upsell Items */}
          <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-100">
              <h2 className="font-display text-xl text-forest-600">Optional Extras (Upsells)</h2>
              <p className="font-body text-sm text-warm-400 mt-0.5">Shown as optional checkboxes on the CYO wizard's review step. Toggle to show/hide without deleting.</p>
            </div>

            {/* Existing upsells */}
            <div className="divide-y divide-warm-100">
              {(data?.upsells ?? []).length === 0 && (
                <p className="px-6 py-4 font-body text-sm text-warm-400">No upsell items yet.</p>
              )}
              {(data?.upsells ?? []).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-sm font-medium ${u.isActive ? 'text-forest-600' : 'text-warm-400 line-through'}`}>
                      {u.name}
                    </p>
                    {u.description && (
                      <p className="font-body text-xs text-warm-400 truncate">{u.description}</p>
                    )}
                  </div>
                  <span className="font-body text-sm font-medium text-forest-600 shrink-0">+{format(u.priceGBP)}</span>
                  <button
                    onClick={() => toggleUpsell(u.id, u.isActive)}
                    className={`font-body text-xs px-3 py-1 rounded-full border transition-colors ${
                      u.isActive
                        ? 'border-forest-200 text-forest-600 hover:bg-forest-50'
                        : 'border-warm-200 text-warm-400 hover:bg-warm-50'
                    }`}
                  >
                    {u.isActive ? 'Shown' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => deleteUpsell(u.id)}
                    className="p-1.5 text-warm-300 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new upsell */}
            <div className="px-6 py-4 bg-warm-50 border-t border-warm-100">
              <p className="font-body text-xs font-medium text-warm-500 uppercase tracking-widest mb-3">Add upsell item</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Name (e.g. Airport Pickup)"
                  value={newUpsell.name}
                  onChange={e => setNewUpsell(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-warm-400">£</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Price"
                    value={newUpsell.priceGBP}
                    onChange={e => setNewUpsell(prev => ({ ...prev, priceGBP: e.target.value }))}
                    className="flex-1 bg-white border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newUpsell.description}
                onChange={e => setNewUpsell(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm mb-3 focus:ring-2 focus:ring-forest-500 outline-none"
              />
              <Button
                onClick={addUpsell}
                disabled={!newUpsell.name.trim() || !newUpsell.priceGBP || addingUpsell}
                className="bg-forest-600 text-white hover:bg-forest-700"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {addingUpsell ? 'Adding…' : 'Add item'}
              </Button>
            </div>
          </section>

          {/* Live Preview */}
          <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-forest-500" />
              <h2 className="font-display text-xl text-forest-600">Price Preview</h2>
            </div>
            <div className="px-6 py-5">
              <p className="font-body text-sm text-warm-500 mb-4">See what a customer would see in the wizard for a given vehicle + duration.</p>
              <div className="flex items-center gap-4 mb-4">
                <select
                  value={previewVehicle}
                  onChange={e => setPreviewVehicle(e.target.value)}
                  className="bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                >
                  {VEHICLE_TYPES.map(vt => (
                    <option key={vt.id} value={vt.id}>{vt.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={previewDays}
                    onChange={e => setPreviewDays(parseInt(e.target.value, 10) || 1)}
                    className="w-20 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                  />
                  <span className="font-body text-sm text-warm-400">days</span>
                </div>
              </div>
              {previewRate > 0 && (
                <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-body text-sm text-warm-500">
                      {format(previewRate)} × {previewDays} days
                    </span>
                    <span className="font-display text-3xl text-forest-700">
                      from {format(previewTotal)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-warm-400">
                    Estimated price · per vehicle, not per person · Our team will confirm your final quote within 24 hrs
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </AdminLayout>
  );
}
