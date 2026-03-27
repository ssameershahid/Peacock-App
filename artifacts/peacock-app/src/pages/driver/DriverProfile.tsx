import { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, Plus, X, AlertTriangle, Check, Star, FileText, Upload, ChevronLeft, ChevronRight, Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import {
  useDriverProfile, useUpdateDriverProfile,
  useDriverRatings, useDriverDocuments, useUploadDocument,
  useDriverAvailability, useUpdateAvailability,
} from '@/hooks/use-app-data';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from './DriverLayout';
import { cn } from '@/lib/utils';

const DOC_TYPES = [
  { key: 'DRIVING_LICENSE', label: 'Driving License', icon: FileText },
  { key: 'TOUR_GUIDE_CERTIFICATE', label: 'Tour Guide Certificate', icon: Shield },
  { key: 'VEHICLE_INSURANCE', label: 'Vehicle Insurance', icon: ShieldCheck },
  { key: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration', icon: FileText },
];

const DOC_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending review', cls: 'bg-amber-50 text-amber-500' },
  VERIFIED: { label: 'Verified', cls: 'bg-green-50 text-green-600' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-500' },
  EXPIRED: { label: 'Expired', cls: 'bg-red-50 text-red-500' },
};

export default function DriverProfile() {
  const { data: profile, isLoading: profileLoading } = useDriverProfile();
  const updateProfile = useUpdateDriverProfile();
  const { data: ratingsData } = useDriverRatings();
  const { data: documents = [] } = useDriverDocuments();
  const uploadDoc = useUploadDocument();
  const { toast } = useToast();

  const [available, setAvailable] = useState(true);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [saved, setSaved] = useState(false);

  // Availability calendar
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const monthStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}`;
  const { data: availData } = useDriverAvailability(monthStr);
  const updateAvail = useUpdateAvailability();
  const [localUnavailable, setLocalUnavailable] = useState<Set<string>>(new Set());
  const [availDirty, setAvailDirty] = useState(false);

  useEffect(() => {
    if (availData) {
      setLocalUnavailable(new Set(availData.unavailableDates || []));
      setAvailDirty(false);
    }
  }, [availData]);

  const bookedDates = new Set(availData?.bookedDates || []);

  const initialised = useRef(false);

  useEffect(() => {
    if (profile && !initialised.current) {
      initialised.current = true;
      setAvailable(profile.available ?? true);
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setExperience(profile.experience || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const expYears = parseInt(experience) || undefined;
      await updateProfile.mutateAsync({
        bio: bio || undefined,
        experienceYears: expYears,
      });
      setSaved(true);
      toast({ title: 'Profile updated' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAvailabilityToggle = async () => {
    const next = !available;
    setAvailable(next);
    try {
      await updateProfile.mutateAsync({ available: next });
      toast({ title: next ? 'Now available for trips' : 'Set to unavailable' });
    } catch (err: any) {
      setAvailable(!next);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDateToggle = (dateStr: string) => {
    if (bookedDates.has(dateStr)) return;
    const next = new Set(localUnavailable);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    setLocalUnavailable(next);
    setAvailDirty(true);
  };

  const handleSaveAvailability = async () => {
    try {
      await updateAvail.mutateAsync({ unavailableDates: Array.from(localUnavailable) });
      setAvailDirty(false);
      toast({ title: 'Availability updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDocUpload = async (docType: string) => {
    // In a real app, this would open a file picker and upload via multipart
    // For now, simulating with a placeholder
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
        return;
      }
      try {
        await uploadDoc.mutateAsync({
          docType,
          fileName: file.name,
          fileUrl: `/uploads/${file.name}`, // placeholder
        });
        toast({ title: 'Document uploaded', description: 'Pending admin review' });
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      }
    };
    input.click();
  };

  // Calendar days
  const calDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({ date: dt.toISOString().slice(0, 10), day: d, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
    }
    return days;
  }, [calMonth]);

  const prevMonth = () => setCalMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 });
  const nextMonth = () => setCalMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 });
  const calMonthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().slice(0, 10);

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Document map for quick lookup
  const docByType: Record<string, any> = {};
  (documents || []).forEach((d: any) => { docByType[d.docType] = d; });

  return (
    <div>
      {/* Hero */}
      <div className="bg-forest-600 text-white px-5 pt-10 pb-6 rounded-b-[32px] md:rounded-none md:pt-6 md:pb-5">
        <div className="max-w-lg mx-auto md:max-w-3xl flex items-start justify-between">
          <h1 className="font-display text-3xl">My Profile</h1>
          <NotificationBell />
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-5 pb-8 space-y-5">
        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-forest-400 border-4 border-white shadow-md flex items-center justify-center">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-2xl text-white">{profile.name.charAt(0)}</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-forest-600 text-white flex items-center justify-center shadow-md hover:bg-forest-500 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="font-display text-xl text-warm-900">{profile.name}</h2>
            <p className="font-body text-xs text-warm-400">Name managed by admin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang: string) => (
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
              <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Experience (years)</label>
              <input
                type="text"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="mt-5 w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full min-h-[48px] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : updateProfile.isPending ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        {/* Ratings section */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-body text-lg font-semibold text-warm-900 mb-4">My Ratings</h2>

          {ratingsData && ratingsData.totalTrips > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-200 text-amber-200" />
                  <span className="font-display text-2xl text-warm-900">{ratingsData.average}</span>
                </div>
                <span className="font-body text-sm text-warm-500">from {ratingsData.totalTrips} trips</span>
              </div>

              {/* Star breakdown */}
              <div className="space-y-2 mb-5">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingsData.breakdown[stars] || 0;
                  const pct = ratingsData.totalTrips > 0 ? (count / ratingsData.totalTrips) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="font-body text-xs text-warm-500 w-3">{stars}</span>
                      <Star className="w-3 h-3 fill-amber-200 text-amber-200" />
                      <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div className="h-full bg-forest-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-body text-xs text-warm-400 w-14 text-right">{count} ({Math.round(pct)}%)</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent reviews */}
              {ratingsData.reviews?.length > 0 && (
                <div>
                  <h3 className="font-body text-sm font-semibold text-warm-900 mb-3">Recent reviews</h3>
                  <div className="space-y-3">
                    {ratingsData.reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border border-warm-100 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm font-medium text-warm-900">{review.touristName}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'fill-amber-200 text-amber-200' : 'text-warm-200')} />
                            ))}
                          </div>
                        </div>
                        {review.review && (
                          <p className="font-body text-sm text-warm-600 line-clamp-3">{review.review}</p>
                        )}
                        {review.tourName && (
                          <span className="inline-block mt-1 font-body text-[10px] text-warm-400 bg-warm-50 px-2 py-0.5 rounded-pill">{review.tourName}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="font-body text-sm text-warm-400">No reviews yet — they'll appear after tourists rate their trips.</p>
          )}
        </div>

        {/* Documents section */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-body text-lg font-semibold text-warm-900 mb-1">My Documents</h2>
          <p className="font-body text-[13px] text-warm-500 mb-4">Keep your documents up to date for trip assignments</p>

          <div className="space-y-3">
            {DOC_TYPES.map(docType => {
              const doc = docByType[docType.key];
              const Icon = docType.icon;
              const statusInfo = doc ? DOC_STATUS_STYLE[doc.status] : null;

              return (
                <div key={docType.key} className="border border-warm-100 rounded-xl p-4 flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    doc ? 'bg-forest-50 text-forest-600' : 'bg-warm-50 text-warm-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[15px] font-medium text-warm-900">{docType.label}</p>
                    {doc ? (
                      <p className="font-body text-xs text-warm-400 mt-0.5">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {doc.expiresAt && ` · Expires: ${new Date(doc.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    ) : (
                      <p className="font-body text-xs text-warm-400 mt-0.5">Not uploaded yet</p>
                    )}
                    {doc?.status === 'REJECTED' && doc.rejectionReason && (
                      <p className="font-body text-xs text-red-500 mt-0.5">{doc.rejectionReason}</p>
                    )}
                  </div>
                  {doc && statusInfo ? (
                    <span className={cn('font-body text-[11px] font-medium px-2.5 py-1 rounded-pill shrink-0', statusInfo.cls)}>
                      {statusInfo.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDocUpload(docType.key)}
                      disabled={uploadDoc.isPending}
                      className="font-body text-xs font-medium text-forest-500 border border-forest-200 px-3 py-1.5 rounded-pill hover:bg-forest-50 transition-colors shrink-0"
                    >
                      <Upload className="w-3 h-3 inline mr-1" />Upload
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability section */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-lg font-semibold text-warm-900">Availability</h2>
            <button
              onClick={handleAvailabilityToggle}
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
          <p className="font-body text-sm text-warm-500 mb-3">
            {available ? 'Available for trips' : 'Unavailable — you won\'t receive new trip assignments'}
          </p>
          {!available && (
            <div className="mb-4 bg-amber-50 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="font-body text-sm text-amber-700">You won't receive new trip assignments while unavailable</p>
            </div>
          )}

          {/* Availability calendar */}
          <div className="border border-warm-100 rounded-xl p-4">
            <p className="font-body text-[13px] font-medium text-warm-600 mb-3">Set unavailable dates</p>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-warm-50 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-warm-500" />
              </button>
              <span className="font-body text-sm font-medium text-warm-900">{calMonthLabel}</span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-warm-50 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-warm-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className="text-center font-body text-[10px] text-warm-400 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((day, i) => {
                const isBooked = bookedDates.has(day.date);
                const isUnavailable = localUnavailable.has(day.date);
                const isToday = day.date === todayStr;

                return (
                  <button
                    key={i}
                    onClick={() => day.isCurrentMonth && !isBooked && handleDateToggle(day.date)}
                    disabled={!day.isCurrentMonth || isBooked}
                    className={cn(
                      'relative flex items-center justify-center rounded-lg py-2 text-sm font-body transition-colors min-h-[40px]',
                      !day.isCurrentMonth && 'opacity-20',
                      isBooked && 'bg-forest-50 text-forest-600 cursor-default',
                      isUnavailable && !isBooked && 'bg-rosewood-50 text-rosewood-400',
                      !isBooked && !isUnavailable && day.isCurrentMonth && 'hover:bg-warm-50 cursor-pointer',
                      isToday && !isBooked && !isUnavailable && 'ring-1 ring-forest-300',
                    )}
                  >
                    <span className={cn(isUnavailable && !isBooked && 'line-through')}>{day.day}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-warm-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-forest-50 border border-forest-200" />
                <span className="font-body text-[10px] text-warm-400">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rosewood-50 border border-rosewood-200" />
                <span className="font-body text-[10px] text-warm-400">Unavailable</span>
              </div>
            </div>

            {/* Unavailable summary */}
            {localUnavailable.size > 0 && (
              <p className="font-body text-xs text-warm-500 mt-2">
                Unavailable: {Array.from(localUnavailable).sort().map(d =>
                  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                ).join(', ')}
              </p>
            )}

            {availDirty && (
              <button
                onClick={handleSaveAvailability}
                disabled={updateAvail.isPending}
                className="mt-3 w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full min-h-[44px] transition-all duration-200 disabled:opacity-60"
              >
                {updateAvail.isPending ? 'Saving...' : 'Save availability'}
              </button>
            )}
          </div>
        </div>

        {/* Vehicles section */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body text-sm font-semibold text-warm-900">My Vehicles</h2>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="flex items-center gap-1.5 text-forest-500 font-body text-sm font-medium hover:text-forest-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add vehicle
            </button>
          </div>

          <div className="space-y-4">
            {profile.vehicles.map((vehicle: any) => (
              <div key={vehicle.id} className="border border-warm-100 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-warm-50 overflow-hidden shrink-0">
                    {vehicle.image ? (
                      <img src={vehicle.image} alt={vehicle.type} className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warm-300">
                        <span className="font-body text-xs text-center px-1">{vehicle.type}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-body font-semibold text-warm-900 text-sm">{vehicle.type}</h3>
                      <button className="font-body text-xs text-forest-500 font-medium hover:underline">Edit</button>
                    </div>
                    <p className="font-body text-xs text-warm-400 mt-0.5">{vehicle.model} {vehicle.year ? `· ${vehicle.year}` : ''}</p>
                    <p className="font-body text-xs text-warm-500 mt-0.5">{vehicle.plate}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {vehicle.features.map((f: string) => (
                        <span key={f} className="bg-warm-50 text-warm-500 font-body text-[10px] px-2 py-0.5 rounded-pill">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {profile.vehicles.length === 0 && (
              <p className="font-body text-sm text-warm-400 text-center py-4">No vehicles added yet.</p>
            )}
          </div>

          {showAddVehicle && (
            <div className="mt-4 border border-warm-200 rounded-xl p-5 bg-warm-50 space-y-4">
              <h3 className="font-body text-sm font-semibold text-warm-900">Add new vehicle</h3>
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Vehicle type</label>
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
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Plate number</label>
                  <input type="text" placeholder="WP-XXX-0000" className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Year</label>
                  <input type="text" placeholder="2024" className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 min-h-[48px]" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Features</label>
                <div className="flex flex-wrap gap-2">
                  {['AC', 'WiFi', 'USB charging', 'Cooler box', 'Bluetooth', 'GPS'].map(f => (
                    <label key={f} className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-pill px-3 py-1.5 cursor-pointer hover:bg-forest-50 transition-colors">
                      <input type="checkbox" className="accent-forest-600" />
                      <span className="font-body text-xs">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full min-h-[48px] transition-all duration-200">
                  Add vehicle
                </button>
                <button
                  onClick={() => setShowAddVehicle(false)}
                  className="px-6 border border-warm-200 text-warm-500 font-body text-sm font-medium rounded-full min-h-[48px] hover:bg-warm-50 transition-all duration-200"
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
