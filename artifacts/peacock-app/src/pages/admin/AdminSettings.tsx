import { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminLayout from './AdminLayout';

const TABS = ['Payments', 'Currency', 'Policies', 'Driver Payouts', 'Notifications'];

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={cn('w-10 h-6 rounded-full relative transition-colors', on ? 'bg-emerald-500' : 'bg-warm-300')}>
      <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all', on ? 'right-0.5' : 'left-0.5')} />
    </button>
  );
}

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
