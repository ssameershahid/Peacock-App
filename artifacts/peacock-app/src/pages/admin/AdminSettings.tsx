import { useState, useMemo, useEffect } from 'react';
import { Trash2, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSeasons, useCreateSeason, useUpdateSeason, useDeleteSeason } from '@/hooks/use-app-data';
import AdminLayout from './AdminLayout';

const TABS = ['Payments', 'Currency', 'Pricing', 'Policies', 'Driver Payouts', 'Notifications'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={cn('w-10 h-6 rounded-full relative transition-colors', on ? 'bg-emerald-500' : 'bg-warm-300')}>
      <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all', on ? 'right-0.5' : 'left-0.5')} />
    </button>
  );
}

// ----------- Season type for local editing -----------
interface SeasonLocal {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  _dirty?: boolean;
  _new?: boolean;
}

// ----------- Calendar helpers -----------
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = Sun
}

function dateToStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isInRange(dateStr: string, start: string, end: string) {
  return dateStr >= start && dateStr <= end;
}

function getMultiplierColor(multiplier: number): string {
  if (multiplier <= 1) return '';
  if (multiplier <= 1.15) return 'bg-amber-100';
  if (multiplier <= 1.3) return 'bg-amber-200';
  if (multiplier <= 1.5) return 'bg-amber-300';
  return 'bg-amber-400';
}

function rangesOverlap(a: SeasonLocal, b: SeasonLocal): boolean {
  if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) return false;
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

// ----------- Mini calendar month component -----------
function MiniMonth({ year, month, seasons }: { year: number; month: number; seasons: SeasonLocal[] }) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const [tooltip, setTooltip] = useState<{ day: number; season: SeasonLocal } | null>(null);

  return (
    <div className="bg-white rounded-xl border border-warm-100 p-3">
      <p className="font-body text-xs font-semibold text-forest-600 mb-2 text-center">{MONTH_NAMES[month]} {year}</p>
      <div className="grid grid-cols-7 gap-px">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center font-body text-[9px] text-warm-400 pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const ds = dateToStr(year, month, day);
          const matchedSeason = seasons.find(s => isInRange(ds, s.startDate, s.endDate));
          const bg = matchedSeason ? getMultiplierColor(matchedSeason.multiplier) : '';
          return (
            <div
              key={day}
              className="relative"
              onMouseEnter={() => matchedSeason && setTooltip({ day, season: matchedSeason })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className={cn(
                'w-full aspect-square flex items-center justify-center font-body text-[10px] rounded-md cursor-default',
                bg,
                matchedSeason ? 'text-amber-900 font-medium' : 'text-warm-500'
              )}>
                {day}
              </div>
              {tooltip?.day === day && tooltip.season && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-forest-700 text-white rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                  <p className="font-body text-[10px] font-semibold">{tooltip.season.name}</p>
                  <p className="font-body text-[9px] opacity-80">{tooltip.season.multiplier}x multiplier</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------- Pricing tab component -----------
function PricingTab() {
  const { data: apiSeasons } = useAdminSeasons();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const deleteSeason = useDeleteSeason();

  const [seasons, setSeasons] = useState<SeasonLocal[]>([]);
  const [saved, setSaved] = useState(false);

  // Location surcharge rate (£ per 50km block beyond the free 50km zone)
  const [surchargeRate, setSurchargeRate] = useState<number>(() =>
    Number(localStorage.getItem('peacock_location_surcharge_rate') ?? '20')
  );
  const [surchargeSaved, setSurchargeSaved] = useState(false);

  function saveSurchargeRate() {
    localStorage.setItem('peacock_location_surcharge_rate', String(surchargeRate));
    setSurchargeSaved(true);
    setTimeout(() => setSurchargeSaved(false), 2000);
  }

  // Seed from API data
  useEffect(() => {
    if (apiSeasons && apiSeasons.length > 0) {
      const toDateStr = (v: any) => {
        if (!v) return '';
        const str = typeof v === 'string' ? v : new Date(v).toISOString();
        return str.split('T')[0];
      };
      setSeasons(apiSeasons.map((s: any) => ({
        id: s.id,
        name: s.name,
        startDate: toDateStr(s.startDate),
        endDate: toDateStr(s.endDate),
        multiplier: s.multiplier,
      })));
    } else if (apiSeasons && apiSeasons.length === 0) {
      // Start with example seasons if none exist
      setSeasons([
        { name: 'Peak (Dec-Jan)', startDate: '2026-12-15', endDate: '2027-01-10', multiplier: 1.35, _new: true, _dirty: true },
        { name: 'Summer High', startDate: '2026-07-01', endDate: '2026-08-31', multiplier: 1.2, _new: true, _dirty: true },
      ]);
    }
  }, [apiSeasons]);

  const calendarYear = 2026;

  // Detect overlapping seasons
  const overlaps = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < seasons.length; i++) {
      for (let j = i + 1; j < seasons.length; j++) {
        if (rangesOverlap(seasons[i], seasons[j])) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs;
  }, [seasons]);

  const overlappingIndices = useMemo(() => {
    const set = new Set<number>();
    overlaps.forEach(([a, b]) => { set.add(a); set.add(b); });
    return set;
  }, [overlaps]);

  function updateField(index: number, field: keyof SeasonLocal, value: string | number) {
    setSeasons(prev => prev.map((s, i) => i === index ? { ...s, [field]: value, _dirty: true } : s));
  }

  function addSeason() {
    setSeasons(prev => [...prev, { name: '', startDate: '', endDate: '', multiplier: 1.15, _new: true, _dirty: true }]);
  }

  function removeSeason(index: number) {
    const season = seasons[index];
    if (season.id) {
      deleteSeason.mutate(season.id);
    }
    setSeasons(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const dirty = seasons.filter(s => s._dirty);
    for (const s of dirty) {
      if (!s.name || !s.startDate || !s.endDate) continue;
      const payload = { name: s.name, startDate: s.startDate, endDate: s.endDate, multiplier: s.multiplier };
      if (s._new || !s.id) {
        createSeason.mutate(payload);
      } else {
        updateSeason.mutate({ id: s.id, data: payload });
      }
    }
    setSeasons(prev => prev.map(s => ({ ...s, _dirty: false, _new: false })));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Location surcharge rate */}
      <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-3">
        <div>
          <h3 className="font-body text-sm font-semibold text-forest-600 mb-1">Custom location surcharge</h3>
          <p className="font-body text-xs text-warm-500 leading-relaxed">
            When a customer selects an alternative start or end location, the first 50 km from the original
            location is free. Beyond that, a surcharge applies for every additional 50 km block.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="font-body text-sm text-warm-600 w-56 shrink-0">Rate per 50 km block (£)</label>
          <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-forest-300">
            <span className="px-3 py-2.5 bg-warm-50 font-body text-sm text-warm-400 border-r border-warm-200">£</span>
            <input
              type="number"
              min={0}
              step={5}
              value={surchargeRate}
              onChange={e => setSurchargeRate(Number(e.target.value))}
              className="w-24 px-3 py-2.5 font-body text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={saveSurchargeRate}
            className="px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all"
          >
            {surchargeSaved ? 'Saved!' : 'Save rate'}
          </button>
        </div>
        <p className="font-body text-[11px] text-warm-400">
          Example at £{surchargeRate}/block: 51–100 km → +£{surchargeRate}, 101–150 km → +£{surchargeRate * 2}, 151–200 km → +£{surchargeRate * 3}
        </p>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
        <div>
          <h3 className="font-body text-sm font-semibold text-forest-600 mb-1">Global seasonal pricing</h3>
          <p className="font-body text-xs text-warm-500 leading-relaxed">
            Define seasonal multipliers that adjust base tour and transfer prices. During defined seasons,
            all vehicle rates are multiplied by the season factor. Multipliers apply automatically to new bookings.
          </p>
        </div>
      </div>

      {/* 12-month calendar */}
      <div className="bg-white rounded-xl border border-warm-100 p-6">
        <h3 className="font-body text-sm font-semibold text-forest-600 mb-4">Calendar overview</h3>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, m) => (
            <MiniMonth key={m} year={calendarYear} month={m} seasons={seasons} />
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-warm-50">
          <span className="font-body text-[10px] text-warm-400 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-100" /> 1.01-1.15x
          </span>
          <span className="font-body text-[10px] text-warm-400 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-200" /> 1.16-1.3x
          </span>
          <span className="font-body text-[10px] text-warm-400 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-300" /> 1.31-1.5x
          </span>
          <span className="font-body text-[10px] text-warm-400 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400" /> 1.5x+
          </span>
        </div>
      </div>

      {/* Overlap warning */}
      {overlaps.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="text-red-500 text-sm mt-0.5">{'\u26A0'}</span>
          <div>
            <p className="font-body text-sm font-medium text-red-700">Overlapping seasons detected</p>
            <p className="font-body text-xs text-red-600 mt-0.5">
              {overlaps.map(([a, b]) => `"${seasons[a].name || 'Unnamed'}" and "${seasons[b].name || 'Unnamed'}"`).join('; ')} have overlapping date ranges.
              Only the first matching season will apply.
            </p>
          </div>
        </div>
      )}

      {/* Season cards */}
      <div className="space-y-3">
        {seasons.map((season, idx) => (
          <div key={idx} className={cn(
            'bg-white rounded-xl border p-6 space-y-4',
            overlappingIndices.has(idx) ? 'border-red-300' : 'border-warm-100'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Name */}
                <div>
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Season name</label>
                  <input
                    type="text"
                    value={season.name}
                    onChange={e => updateField(idx, 'name', e.target.value)}
                    placeholder="e.g. Peak Season"
                    className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                  />
                </div>
                {/* From */}
                <div>
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">From</label>
                  <input
                    type="date"
                    value={season.startDate}
                    onChange={e => updateField(idx, 'startDate', e.target.value)}
                    className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                  />
                </div>
                {/* To */}
                <div>
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">To</label>
                  <input
                    type="date"
                    value={season.endDate}
                    onChange={e => updateField(idx, 'endDate', e.target.value)}
                    className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                  />
                </div>
                {/* Multiplier */}
                <div>
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Multiplier</label>
                  <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-forest-300">
                    <input
                      type="number"
                      step="0.05"
                      min="1"
                      max="3"
                      value={season.multiplier}
                      onChange={e => updateField(idx, 'multiplier', parseFloat(e.target.value) || 1)}
                      className="flex-1 px-4 py-2.5 font-body text-sm focus:outline-none"
                    />
                    <span className="px-3 py-2.5 bg-warm-50 font-body text-sm text-warm-400 border-l border-warm-200">{'\u00D7'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeSeason(idx)}
                className="ml-3 mt-7 p-2 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove season"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {season._dirty && (
              <span className="inline-block font-body text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-pill">Unsaved changes</span>
            )}
          </div>
        ))}
      </div>

      {/* Add + Save */}
      <div className="flex items-center justify-between">
        <button
          onClick={addSeason}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-warm-200 text-forest-600 font-body text-sm font-medium rounded-full hover:bg-warm-50 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add season
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200"
        >
          {saved ? 'Saved!' : 'Save pricing'}
        </button>
      </div>
    </div>
  );
}

// ----------- Main settings component -----------
export default function AdminSettings() {
  const [tab, setTab] = useState('Payments');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(tab);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <AdminLayout
      title="Settings"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
    >
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-full font-body text-sm font-medium whitespace-nowrap transition-all duration-200',
              tab === t ? 'bg-forest-600 text-white' : 'bg-white border border-warm-200 text-warm-500 hover:text-forest-600'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {tab === 'Payments' && (
          <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Stripe publishable key</label>
              <input type="text" defaultValue="pk_live_51N..." className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Stripe secret key</label>
              <input type="password" defaultValue="sk_live_xxxxxxxxxxxxx" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Webhook signing secret</label>
              <input type="password" defaultValue="whsec_xxxxxxxxxxxxx" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTestResult('Connection successful')} className="px-5 py-2.5 border border-warm-200 text-forest-600 font-body text-sm font-medium rounded-full hover:bg-warm-50 transition-all duration-200">Test connection</button>
              {testResult && <span className="font-body text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {testResult}</span>}
            </div>
            <div className="flex justify-end pt-4 border-t border-warm-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
                {saved === tab ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Currency' && (
          <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Base currency</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-xl">
                <span className="font-body text-sm font-semibold text-forest-600">GBP</span>
                <span className="font-body text-xs text-warm-400">(not editable)</span>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Display currencies</label>
              <div className="space-y-2">
                {['USD', 'EUR', 'CAD', 'AUD', 'LKR'].map(c => (
                  <label key={c} className="flex items-center gap-3 bg-warm-50 rounded-xl px-4 py-3 cursor-pointer hover:bg-forest-50 transition-colors">
                    <input type="checkbox" defaultChecked className="accent-forest-600" />
                    <span className="font-body text-sm text-forest-600">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-warm-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
                {saved === tab ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Pricing' && <PricingTab />}

        {tab === 'Policies' && (
          <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
            {[
              { label: 'Cancellation policy for tours', val: 'Cancellations made less than 10 days before start date will not be refunded. Cancellations made 10+ days before departure will receive a full refund minus a 5% processing fee.' },
              { label: 'Cancellation policy for transfers', val: 'Cancellations made less than 48 hours before pickup will not be refunded.' },
              { label: 'Reschedule policy', val: 'One free reschedule permitted up to 7 days before start date. Subsequent reschedules incur a 10% fee.' },
              { label: 'No-show policy', val: 'No refund for no-shows. Driver will wait up to 30 minutes past the scheduled pickup time.' },
            ].map(p => (
              <div key={p.label}>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">{p.label}</label>
                <textarea rows={3} defaultValue={p.val} className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
              </div>
            ))}
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Terms & conditions</label>
              <textarea rows={6} defaultValue="By booking with Peacock Drivers, you agree to our terms of service..." className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
            </div>
            <div className="flex justify-end pt-4 border-t border-warm-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
                {saved === tab ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Driver Payouts' && (
          <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Tour daily fees by vehicle type</label>
              <div className="space-y-2">
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
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-sm text-warm-600 w-28">Transfer %</span>
              <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                <input type="number" defaultValue={15} className="w-20 px-3 py-2 font-body text-sm focus:outline-none" />
                <span className="px-3 py-2 bg-warm-50 font-body text-sm text-warm-400 border-l border-warm-200">%</span>
              </div>
            </div>
            <label className="flex items-center gap-2.5 bg-warm-50 rounded-xl px-4 py-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-forest-600" />
              <span className="font-body text-sm text-forest-600">Commission includes add-ons</span>
            </label>
            <div className="flex justify-end pt-4 border-t border-warm-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
                {saved === tab ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Notifications' && (
          <div className="bg-white rounded-xl border border-warm-100 p-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Admin notification emails</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['sameer@peacockdrivers.lk', 'admin@peacockdrivers.lk'].map(e => (
                  <span key={e} className="bg-forest-50 text-forest-600 font-body text-xs px-3 py-1.5 rounded-pill flex items-center gap-1.5">
                    {e} <button className="text-forest-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <input type="email" placeholder="Add email address..." className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div className="space-y-3 pt-4 border-t border-warm-100">
              {[
                { label: 'New booking', on: true },
                { label: 'New CYO request', on: true },
                { label: 'Cancellation', on: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between bg-warm-50 rounded-xl px-4 py-3">
                  <span className="font-body text-sm text-forest-600">{n.label}</span>
                  <Toggle defaultOn={n.on} />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-warm-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-all duration-200">
                {saved === tab ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
