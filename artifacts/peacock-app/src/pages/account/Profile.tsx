import React, { useState, useEffect } from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { Camera, Check, AlertTriangle, Mail, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCommunicationPreferences, useUpdateCommunicationPreferences } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';

// ── Toggle Switch ───────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-forest-500' : 'bg-warm-200'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ── Communication Preferences ───────────────────────────────────────────────

function CommunicationPreferencesSection() {
  const { data: prefs } = useCommunicationPreferences();
  const updatePrefs = useUpdateCommunicationPreferences();
  const { toast } = useToast();

  const [preTrip, setPreTrip] = useState(true);
  const [reviewReq, setReviewReq] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (prefs) {
      setPreTrip(prefs.preTripReminders ?? true);
      setReviewReq(prefs.reviewRequests ?? true);
      setMarketing(prefs.marketing ?? false);
    }
  }, [prefs]);

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({
        preTripReminders: preTrip,
        reviewRequests: reviewReq,
        marketing,
      });
      setDirty(false);
      toast({ title: 'Preferences saved' });
    } catch {
      toast({ title: 'Error saving preferences', variant: 'destructive' });
    }
  };

  const toggles = [
    {
      label: 'Pre-trip reminders',
      description: 'Helpful reminders as your trip approaches',
      checked: preTrip,
      onChange: (v: boolean) => { setPreTrip(v); setDirty(true); },
    },
    {
      label: 'Trip review requests',
      description: 'Invite to share your experience after a trip',
      checked: reviewReq,
      onChange: (v: boolean) => { setReviewReq(v); setDirty(true); },
    },
    {
      label: 'Travel tips & offers',
      description: 'Seasonal deals, new tours, and Sri Lanka travel guides',
      checked: marketing,
      onChange: (v: boolean) => { setMarketing(v); setDirty(true); },
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
      <h3 className="font-body text-lg font-semibold text-forest-600 mb-1">Communication preferences</h3>
      <p className="font-body text-[13px] text-warm-400 mb-6">Control what emails you receive from us</p>

      <div className="space-y-5 mb-6">
        {toggles.map(t => (
          <div key={t.label} className="flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-sm font-medium text-warm-700">{t.label}</p>
              <p className="font-body text-xs text-warm-400 mt-0.5">{t.description}</p>
            </div>
            <ToggleSwitch checked={t.checked} onChange={t.onChange} />
          </div>
        ))}
      </div>

      <Button
        className="rounded-pill"
        onClick={handleSave}
        disabled={!dirty || updatePrefs.isPending}
        size="sm"
      >
        {updatePrefs.isPending ? 'Saving...' : 'Save preferences'}
      </Button>

      <p className="font-body text-[11px] text-warm-300 mt-3">
        You can unsubscribe from all emails at any time
      </p>
    </div>
  );
}

// ── Main Profile Component ──────────────────────────────────────────────────

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [country, setCountry] = useState(user?.country ?? '');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setPhone(user.phone ?? '');
      setCountry(user.country ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.put<any>('/auth/profile', { firstName, lastName, phone, country });
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone, country: updated.country });
      setSaved(true);
      toast({ title: 'Profile updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields required.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPasswordSaved(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast({ title: 'Password updated' });
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div>
      <SectionHeading title="My *profile*" className="mb-6" />

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="font-body font-semibold text-forest-600 mb-6">Personal Information</h3>

        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-3xl">
              {user?.profileImageUrl
                ? <img src={user.profileImageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center shadow-md hover:bg-forest-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="font-body font-semibold text-forest-600">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Your name'}</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">First Name</label>
            <input
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Last Name</label>
            <input
              value={lastName}
              onChange={e => { setLastName(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              value={user?.email ?? ''}
              readOnly
              className="w-full border border-warm-200 rounded-xl pl-11 pr-4 py-2.5 font-body text-sm bg-warm-50 text-warm-500 cursor-not-allowed"
            />
          </div>
          <p className="font-body text-xs text-warm-400 mt-1">Contact support to change your email address</p>
        </div>

        <div className="mb-4">
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Phone Number</label>
          <input
            value={phone}
            onChange={e => { setPhone(e.target.value); setSaved(false); }}
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
          />
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Country</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl pl-11 pr-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none bg-white"
            >
              <option value="">Select country</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="LK">Sri Lanka</option>
              <option value="IN">India</option>
            </select>
          </div>
        </div>

        <Button className="rounded-pill" onClick={handleSave} disabled={saving}>
          {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="font-body font-semibold text-forest-600 mb-6">Change Password</h3>
        {pwError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-body text-sm text-red-600">{pwError}</div>
        )}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Current Password</label>
            <input type="password" value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPasswordSaved(false); }} placeholder="••••••••" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">New Password</label>
            <input type="password" value={newPw} onChange={e => { setNewPw(e.target.value); setPasswordSaved(false); }} placeholder="••••••••" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPasswordSaved(false); }} placeholder="••••••••" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
        </div>
        <Button variant="outline" className="rounded-pill" onClick={handleChangePassword} disabled={savingPw}>
          {passwordSaved ? <><Check className="w-4 h-4 mr-2" /> Password updated</> : savingPw ? 'Updating…' : 'Update password'}
        </Button>
      </div>

      {/* Communication Preferences */}
      <CommunicationPreferencesSection />

      <div className="bg-white rounded-2xl border-[1.5px] border-[#C4382A]/20 p-6">
        <h3 className="font-body font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="font-body text-sm text-warm-500 mb-4">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
        {showDeleteConfirm ? (
          <div className="bg-red-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="font-body text-sm font-medium text-red-700">Are you sure? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" className="rounded-pill" onClick={() => setShowDeleteConfirm(false)}>
                Yes, delete my account
              </Button>
              <Button variant="outline" className="rounded-pill" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="font-body text-sm font-medium text-red-500 hover:text-red-600 hover:underline underline-offset-2 transition-colors">
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
