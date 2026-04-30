import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import HowItWorksSteps from '@/components/peacock/HowItWorksSteps';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { VehicleSelector } from '@/components/shared/VehicleSelector';
import { MapView, type MapMarker } from '@/components/shared/MapView';
import {
  Check, Map, Calendar, Settings2, Sparkles, Send, ArrowRight, ArrowLeft,
  RotateCcw, MapPin, Car, Users, Plane, Clock,
  Bookmark, Mail, Download, X, Loader2, Eye, Minus, Plus, Maximize2,
} from 'lucide-react';
import { useVehicles, useTourGroups, useCreateSavedTrip, useUpdateSavedTrip, useEmailTripPlan, useLeadTripData, useSavedTrip, useCYOPricing } from '@/hooks/use-app-data';
import { ItineraryBuilder, itineraryToMapMarkers, type ItineraryDay } from '@/components/wizard/ItineraryBuilder';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { analytics, trackEvent } from '@/lib/analytics';

// ── Static data ─────────────────────────────────────────────────────────────

export const DESTINATIONS = [
  { id: 'colombo', name: 'Colombo', desc: 'Vibrant capital city', lng: 79.8612, lat: 6.9271 },
  { id: 'sigiriya', name: 'Sigiriya', desc: 'Ancient rock fortress', lng: 80.7597, lat: 7.9572 },
  { id: 'kandy', name: 'Kandy', desc: 'Cultural capital', lng: 80.6350, lat: 7.2906 },
  { id: 'ella', name: 'Ella', desc: 'Mountain village', lng: 81.0470, lat: 6.8667 },
  { id: 'galle', name: 'Galle', desc: 'Colonial fort town', lng: 80.2170, lat: 6.0535 },
  { id: 'yala', name: 'Yala', desc: 'Leopard safaris', lng: 81.5256, lat: 6.3718 },
  { id: 'trincomalee', name: 'Trincomalee', desc: 'East coast beaches', lng: 81.2342, lat: 8.5772 },
  { id: 'negombo', name: 'Negombo', desc: 'Beach & fishing village', lng: 79.8380, lat: 7.2083 },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya', desc: 'Little England', lng: 80.7718, lat: 6.9497 },
  { id: 'tangalle', name: 'Tangalle', desc: 'Secluded southern beaches', lng: 80.7967, lat: 6.0248 },
  { id: 'anuradhapura', name: 'Anuradhapura', desc: 'Ancient sacred city', lng: 80.3957, lat: 8.3114 },
  { id: 'haputale', name: 'Haputale', desc: 'Tea country viewpoint', lng: 80.9585, lat: 6.7667 },
];

const INTERESTS = ['Nature', 'Wildlife', 'Beaches', 'Food & Cuisine', 'Temples & History', 'Tea Plantations', 'Surfing', 'Hiking', 'Photography'];

const DURATIONS = [5, 7, 10, 14] as const;

const STORAGE_KEY = 'cyo_wizard_state';

// ── Convert API itinerary days → ItineraryDay[] ─────────────────────────────

function tourDaysToItinerary(days: any[], knownDests: typeof DESTINATIONS): import('@/components/wizard/ItineraryBuilder').ItineraryDay[] {
  return days.map((d, i) => {
    const matched = knownDests.find(dest =>
      dest.name.toLowerCase() === (d.location ?? '').toLowerCase()
    );
    return {
      id: `template-day-${i + 1}`,
      to: d.location ?? '',
      toId: matched?.id ?? '',
      toLat: d.lat ?? matched?.lat,
      toLng: d.lng ?? matched?.lng,
    };
  });
}

type WizardSelections = {
  tripType: string;           // tour group slug, or 'scratch'
  pax: number;                // derived: adults + children (kept for API compat)
  adults: number;
  children: number;
  childAges: string[];
  vehicle: string;
  // Scratch itinerary
  startFrom: string;
  startFromId: string;
  startFromLat?: number;
  startFromLng?: number;
  itinerary: ItineraryDay[];
  // Template destinations (non-scratch)
  destinations: string[];
  otherPlaces: string;
  startDate: string;
  days: number;
  flexibleDates: boolean;
  budget: string;
  travelStyle: string[];
  interests: string[];
  specialRequests: string;
  flightNumber: string;
  arrivalTime: string;
  name: string;
  email: string;
  phone: string;
  country: string;
};

const DEFAULT_SELECTIONS: WizardSelections = {
  tripType: '',
  pax: 2,
  adults: 2,
  children: 0,
  childAges: [],
  vehicle: 'minivan',
  startFrom: '',
  startFromId: '',
  startFromLat: undefined,
  startFromLng: undefined,
  itinerary: [],
  destinations: [],
  otherPlaces: '',
  startDate: '',
  days: 7,
  flexibleDates: false,
  budget: 'mid',
  travelStyle: [],
  interests: [],
  specialRequests: '',
  flightNumber: '',
  arrivalTime: '',
  name: '',
  email: '',
  phone: '',
  country: '',
};

// ── SessionStorage persistence ──────────────────────────────────────────────

function saveWizardState(selections: WizardSelections, step: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      selections,
      step,
      savedAt: new Date().toISOString(),
    }));
  } catch { /* quota exceeded, ignore */ }
}

function loadWizardState(): { selections: WizardSelections; step: number; savedAt: string } | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const savedAt = new Date(parsed.savedAt);
    const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSave > 24) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearWizardState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ── Helper: get destination names from IDs ──────────────────────────────────

function getDestNames(ids: string[]): string[] {
  return DESTINATIONS.filter(d => ids.includes(d.id)).map(d => d.name);
}

function getDestSummary(ids: string[]): string {
  const names = getDestNames(ids);
  if (names.length <= 2) return names.join(', ');
  return `${names[0]}, ${names[1]}, +${names.length - 2} more`;
}

// ── Main component ──────────────────────────────────────────────────────────

function autoVehicle(totalPax: number, vehicleList: any[]): string {
  if (!vehicleList?.length) return 'minivan';
  const sorted = [...vehicleList].sort((a, b) => (a.maxPassengers ?? 35) - (b.maxPassengers ?? 35));
  const fit = sorted.find(v => (v.maxPassengers ?? 35) >= totalPax);
  return fit?.id ?? sorted[sorted.length - 1]?.id ?? 'minivan';
}

export default function CYOWizard() {
  const [step, setStep] = useState(1);
  const { format } = useCurrency();
  const { data: vehicles } = useVehicles();
  const { data: cyoPricing } = useCYOPricing();
  const { data: tourGroups, isLoading: isLoadingGroups } = useTourGroups();
  const { user, login, register } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [selections, setSelections] = useState<WizardSelections>({ ...DEFAULT_SELECTIONS });
  const [selectedUpsells, setSelectedUpsells] = useState<Record<string, boolean>>({});

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scratchMapExpanded, setScratchMapExpanded] = useState(false);
  const [cyoRef, setCyoRef] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Recovery banner state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{ selections: WizardSelections; step: number; savedAt: string } | null>(null);

  // Save/auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Email capture state
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptureEmail, setEmailCaptureEmail] = useState('');
  const [emailCaptureName, setEmailCaptureName] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Saved trip tracking
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // PDF state
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const createSavedTrip = useCreateSavedTrip();
  const updateSavedTrip = useUpdateSavedTrip();
  const emailTripPlan = useEmailTripPlan();

  const emailCaptureRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  // ── Close expanded map on Escape ───────────────────────────────────────
  useEffect(() => {
    if (!scratchMapExpanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setScratchMapExpanded(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [scratchMapExpanded]);

  // ── Resume from URL param ───────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get('resume');
    if (!resumeId) {
      // Check for sessionStorage recovery
      const saved = loadWizardState();
      if (saved && saved.selections.destinations.length > 0) {
        setRecoveryData(saved);
        setShowRecovery(true);
      }
      return;
    }

    // Try to load from saved trip first, then from lead
    (async () => {
      try {
        const data = await api.get<any>(`/saved-trips/${resumeId}`);
        if (data?.tripData) {
          setSelections({ ...DEFAULT_SELECTIONS, ...data.tripData });
          setStep(data.currentStep || 1);
          setSavedTripId(data.id);
          setIsSaved(true);
          toast({ title: 'Your saved trip has been loaded', description: 'Continue where you left off' });
          trackEvent('cyo_wizard_recovered', { source: 'saved_trip' });
          return;
        }
      } catch { /* not a saved trip, try lead */ }

      try {
        const data = await api.get<any>(`/trip-leads/${resumeId}/trip-data`);
        if (data?.tripData) {
          setSelections({ ...DEFAULT_SELECTIONS, ...data.tripData });
          setStep(5); // jump to review for email resume
          toast({ title: 'Your trip plan has been loaded', description: 'Ready to submit for a quote!' });
          trackEvent('cyo_wizard_recovered', { source: 'email_resume' });
        }
      } catch { /* invalid resume ID, ignore */ }
    })();
  }, []);

  // ── Pre-fill user info ──────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      setSelections(s => ({
        ...s,
        name: s.name || [user.firstName, user.lastName].filter(Boolean).join(' '),
        email: s.email || user.email || '',
        phone: s.phone || user.phone || '',
        country: s.country || user.country || '',
      }));
    }
  }, [user]);

  // ── Persist to sessionStorage on every change ───────────────────────────

  useEffect(() => {
    if (selections.destinations.length > 0 || selections.tripType) {
      saveWizardState(selections, step);
    }
  }, [selections, step]);

  // ── Analytics: track step changes ───────────────────────────────────────

  const prevStep = useRef(step);
  useEffect(() => {
    if (step !== prevStep.current) {
      const stepNames = ['trip_basics', 'destinations', 'dates', 'preferences', 'review'];
      trackEvent('cyo_wizard_step_completed', {
        step: prevStep.current,
        stepName: stepNames[prevStep.current - 1],
        ...(prevStep.current === 2 ? { destinationCount: selections.destinations.length } : {}),
        ...(prevStep.current === 3 ? { duration: selections.days } : {}),
      });
      prevStep.current = step;
    }
  }, [step]);

  // ── Auto-save for logged-in users ───────────────────────────────────────

  const autoSave = useCallback(() => {
    if (!user || selections.destinations.length === 0) return;

    const tripData = { ...selections };
    const isComplete = step === 5 && !!selections.name && !!selections.email;

    if (savedTripId) {
      updateSavedTrip.mutate(
        { id: savedTripId, data: { tripData, currentStep: step, isComplete } },
        { onSuccess: () => setIsSaved(true) }
      );
    } else {
      createSavedTrip.mutate(
        { tripData, currentStep: step, isComplete },
        { onSuccess: (data: any) => { setSavedTripId(data.id); setIsSaved(true); } }
      );
    }
  }, [user, selections, step, savedTripId]);

  // Auto-save on step navigation for logged-in users
  useEffect(() => {
    if (!user || selections.destinations.length === 0 || step <= 1) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => autoSave(), 1500);
    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }, [step, user]);

  // Per-template duration selection (independent of main selections.days)
  const [templateDurations, setTemplateDurations] = useState<Record<string, number>>({});

  // Template itinerary fetch state
  const [templateItineraryLoading, setTemplateItineraryLoading] = useState(false);
  const itineraryInitialized = useRef<string>(''); // tracks "{slug}-{duration}" to avoid re-fetch

  // ── Fetch & load template itinerary when entering step 2 ───────────────
  useEffect(() => {
    const slug = selections.tripType;
    if (step !== 2 || slug === '' || slug === 'scratch') return;
    const duration = templateDurations[slug] ?? 7;
    const key = `${slug}-${duration}`;
    if (itineraryInitialized.current === key) return; // already loaded this combo

    setTemplateItineraryLoading(true);
    api.get<any>(`/tours/${slug}/${duration}`)
      .then(data => {
        const days: any[] = data.itinerary ?? [];
        const converted = tourDaysToItinerary(days, DESTINATIONS);
        itineraryInitialized.current = key;
        setSelections(s => ({
          ...s,
          itinerary: converted,
          startFrom: 'Airport (BIA)',
          startFromId: 'airport',
          startFromLat: 7.1807,
          startFromLng: 79.8842,
          days: duration,
        }));
      })
      .catch(() => {
        // If API fails, leave itinerary empty so user can build manually
        itineraryInitialized.current = key;
      })
      .finally(() => setTemplateItineraryLoading(false));
  }, [step, selections.tripType, templateDurations]);

  // ── Template + traveller helpers ────────────────────────────────────────

  const selectTemplate = (slug: string) => {
    // Auto-pick the first available variant duration so the API call matches an actual variant.
    // Falling back to 7 caused 404s for tours whose shortest variant isn't 7 days.
    const group = (tourGroups ?? []).find((g: any) => g.groupSlug === slug);
    const firstDur = group?.variants?.[0]?.durationDays;
    const dur = templateDurations[slug] ?? firstDur ?? 7;
    itineraryInitialized.current = ''; // force re-fetch for new template
    // Persist the auto-selected duration so the picker reflects it and the useEffect reads it
    setTemplateDurations(prev => prev[slug] !== undefined ? prev : { ...prev, [slug]: dur });
    setSelections(s => ({ ...s, tripType: slug, days: dur, itinerary: [], startFrom: '', startFromId: '' }));
  };

  const setTemplateDurationFor = (slug: string, days: number) => {
    setTemplateDurations(prev => ({ ...prev, [slug]: days }));
    itineraryInitialized.current = ''; // force re-fetch for new duration
    if (selections.tripType === slug) {
      setSelections(s => ({ ...s, days, itinerary: [], startFrom: '', startFromId: '' }));
    }
  };

  const setAdults = (n: number) => {
    const total = n + selections.children;
    const vehicle = autoVehicle(total, vehicles ?? []);
    setSelections(s => ({ ...s, adults: n, pax: total, vehicle }));
  };

  const setChildren = (n: number) => {
    const ages = n > selections.childAges.length
      ? [...selections.childAges, ...Array(n - selections.childAges.length).fill('')]
      : selections.childAges.slice(0, n);
    const total = selections.adults + n;
    const vehicle = autoVehicle(total, vehicles ?? []);
    setSelections(s => ({ ...s, children: n, childAges: ages, pax: total, vehicle }));
  };

  const setChildAge = (i: number, age: string) => {
    const ages = selections.childAges.map((a, idx) => (idx === i ? age : a));
    setSelections(s => ({ ...s, childAges: ages }));
  };

  // ── Selection helpers ───────────────────────────────────────────────────

  const toggleDest = (id: string) => {
    setSelections(s => ({
      ...s,
      destinations: s.destinations.includes(id)
        ? s.destinations.filter(d => d !== id)
        : [...s.destinations, id],
    }));
  };

  // ── Optimise Route — nearest-neighbour reorder of itinerary days ───────────
  // Self-contained: delete the button + this function to remove the feature entirely.
  const handleOptimiseRoute = () => {
    const allDests = DESTINATIONS;
    const startLat = selections.startFromId
      ? allDests.find(d => d.id === selections.startFromId)?.lat ?? selections.startFromLat
      : selections.startFromLat;
    const startLng = selections.startFromId
      ? allDests.find(d => d.id === selections.startFromId)?.lng ?? selections.startFromLng
      : selections.startFromLng;

    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371, toRad = (v: number) => (v * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getCoords = (day: typeof selections.itinerary[0]) => {
      if (day.toId) {
        const d = allDests.find(x => x.id === day.toId);
        if (d) return { lat: d.lat, lng: d.lng };
      }
      if (day.toLat !== undefined && day.toLng !== undefined) return { lat: day.toLat, lng: day.toLng };
      return null;
    };

    const resolvable = selections.itinerary.filter(d => getCoords(d) !== null);
    const unresolvable = selections.itinerary.filter(d => getCoords(d) === null);
    if (resolvable.length <= 1) return;

    let curLat = startLat ?? getCoords(resolvable[0])!.lat;
    let curLng = startLng ?? getCoords(resolvable[0])!.lng;
    const remaining = [...resolvable];
    const ordered: typeof resolvable = [];

    while (remaining.length > 0) {
      let bestIdx = 0, bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const c = getCoords(remaining[i])!;
        const dist = haversine(curLat, curLng, c.lat, c.lng);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      const next = remaining.splice(bestIdx, 1)[0];
      ordered.push(next);
      const nc = getCoords(next)!;
      curLat = nc.lat; curLng = nc.lng;
    }

    const sfCoords = !selections.startFromId && startLat !== undefined && startLng !== undefined
      ? { lat: startLat, lng: startLng } : undefined;
    setSelections(s => ({
      ...s,
      itinerary: [...ordered, ...unresolvable],
      startFromLat: sfCoords?.lat,
      startFromLng: sfCoords?.lng,
    }));
  };

  const toggleInterest = (interest: string) => {
    setSelections(s => ({
      ...s,
      interests: s.interests.includes(interest)
        ? s.interests.filter(i => i !== interest)
        : [...s.interests, interest],
    }));
  };

  const toggleStyle = (style: string) => {
    setSelections(s => ({
      ...s,
      travelStyle: s.travelStyle.includes(style)
        ? s.travelStyle.filter(i => i !== style)
        : [...s.travelStyle, style],
    }));
  };

  const canProceed = () => {
    if (step === 1) return selections.tripType !== '';
    if (step === 2) {
      if (templateItineraryLoading) return false;
      // Both scratch and template now use the itinerary
      return selections.itinerary.length > 0 && selections.itinerary.some(d => d.to !== '');
    }
    if (step === 3) return (!!selections.startDate || selections.flexibleDates) && !!selections.vehicle;
    if (step === 4) return selections.budget !== '' && selections.travelStyle.length > 0 && selections.interests.length > 0;
    if (step === 5) return selections.name && selections.email;
    return true;
  };

  const stepLabels = [
    { icon: <Map className="w-4 h-4" />, label: 'Basics' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Places' },
    { icon: <Users className="w-4 h-4" />, label: 'Group & Dates' },
    { icon: <Settings2 className="w-4 h-4" />, label: 'Style' },
    { icon: <Send className="w-4 h-4" />, label: 'Submit' },
  ];

  // Preserve tap order (selections.destinations stores ids in tap sequence)
  const selectedDests = selections.destinations
    .map(id => DESTINATIONS.find(d => d.id === id))
    .filter((d): d is typeof DESTINATIONS[0] => d !== undefined);
  const selectedDestNames = selectedDests.map(d => d.name);
  const cyoMapMarkers: MapMarker[] = selectedDests.map((d, i) => ({
    id: d.id,
    lng: d.lng,
    lat: d.lat,
    label: d.name,
    index: i,
  }));

  // Scratch mode: derive map markers from itinerary chain
  const scratchMapMarkers: MapMarker[] = useMemo(() =>
    itineraryToMapMarkers(
      selections.startFrom,
      selections.startFromId,
      selections.itinerary,
      DESTINATIONS,
      selections.startFromLat !== undefined && selections.startFromLng !== undefined
        ? { lat: selections.startFromLat, lng: selections.startFromLng }
        : undefined,
    ),
    [selections.startFrom, selections.startFromId, selections.startFromLat, selections.startFromLng, selections.itinerary]
  );

  // Both scratch and template now use the shared itinerary → same markers
  const activeMapMarkers = scratchMapMarkers;

  // ── Recovery banner handlers ────────────────────────────────────────────

  const handleRecoveryContinue = () => {
    if (recoveryData) {
      setSelections({ ...DEFAULT_SELECTIONS, ...recoveryData.selections });
      setStep(recoveryData.step);
      trackEvent('cyo_wizard_recovered', {
        stepRecoveredAt: recoveryData.step,
        hoursSinceSave: ((Date.now() - new Date(recoveryData.savedAt).getTime()) / (1000 * 60 * 60)).toFixed(1),
      });
    }
    setShowRecovery(false);
  };

  const handleRecoveryFresh = () => {
    clearWizardState();
    setShowRecovery(false);
  };

  // ── Save trip handler ───────────────────────────────────────────────────

  const handleSaveTrip = () => {
    if (user) {
      // Already logged in — save immediately
      autoSave();
      toast({ title: 'Trip saved!', description: 'Find it in My Account \u2192 Saved Trips' });
      trackEvent('cyo_trip_saved', { step, destinationCount: selections.destinations.length });
    } else {
      // Show auth modal
      setShowAuthModal(true);
    }
  };

  // ── Auth modal submit ───────────────────────────────────────────────────

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await register({
          email: authEmail,
          password: authPassword,
          firstName: authFirstName,
          lastName: authLastName,
        });
      } else {
        await login(authEmail, authPassword);
      }
      setShowAuthModal(false);
      // Auto-save after auth (runs in next tick when user state updates)
      setTimeout(() => {
        const tripData = { ...selections };
        const isComplete = step === 5 && !!selections.name && !!selections.email;
        createSavedTrip.mutate(
          { tripData, currentStep: step, isComplete },
          {
            onSuccess: (data: any) => {
              setSavedTripId(data.id);
              setIsSaved(true);
              toast({
                title: authMode === 'register' ? 'Account created! Your trip has been saved' : 'Logged in! Your trip has been saved',
              });
              trackEvent('cyo_trip_saved', { step, destinationCount: selections.destinations.length });
            },
          }
        );
      }, 500);
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Email capture handler ───────────────────────────────────────────────

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    try {
      await emailTripPlan.mutateAsync({
        email: emailCaptureEmail,
        name: emailCaptureName || undefined,
        tripData: selections,
        currentStep: step,
        source: 'cyo_wizard',
      });
      setEmailSent(true);
      trackEvent('cyo_email_captured', {
        step,
        destinationCount: selections.destinations.length,
        hasName: !!emailCaptureName,
      });
      toast({ title: 'Trip plan sent!', description: `Sent to ${emailCaptureEmail}` });
      setTimeout(() => {
        setShowEmailCapture(false);
        setEmailSent(false);
      }, 3000);
    } catch {
      toast({ title: 'Couldn\u2019t send email', description: 'Check the address and try again', variant: 'destructive' });
    } finally {
      setEmailSending(false);
    }
  };

  // ── PDF download handler ────────────────────────────────────────────────

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      // Generate a simple client-side printable page as a PDF substitute
      const destInfo = selectedDests.map((d, i) => `${i + 1}. ${d.name} — ${d.desc}`).join('\n');
      const tripTypeLabel = (selections.tripType || '').charAt(0).toUpperCase() + (selections.tripType || '').slice(1);
      const printContent = `
        <html>
        <head>
          <title>Trip Plan - Peacock Drivers</title>
          <style>
            body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
            h1 { color: #2D6A4F; border-bottom: 2px solid #E9C46A; padding-bottom: 12px; }
            h2 { color: #2D6A4F; margin-top: 32px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
            .box { background: #F8F5F0; border-radius: 8px; padding: 20px; margin: 16px 0; }
            .box p { margin: 6px 0; }
            .dest { padding: 8px 0; border-bottom: 1px solid #eee; }
            .dest:last-child { border-bottom: none; }
            .cta { background: #2D6A4F; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 24px; }
            .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; text-align: center; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>PEACOCK DRIVERS</h1>
          <p class="meta">Sri Lanka's Premium Chauffeur Service</p>

          <h2>Your Sri Lanka Trip Plan</h2>
          <p>${scratchDestNames.join(' → ')} · ${displayDays} day${displayDays !== 1 ? 's' : ''} · ${selections.pax} travellers</p>

          <div class="box">
            ${tripTypeLabel ? `<p><strong>Trip type:</strong> ${tripTypeLabel}</p>` : ''}
            <p><strong>Duration:</strong> ${displayDays} day${displayDays !== 1 ? 's' : ''}</p>
            <p><strong>Travellers:</strong> ${selections.pax}</p>
            <p><strong>Vehicle:</strong> ${selections.vehicle}</p>
            <p><strong>Budget:</strong> ${selections.budget}</p>
            ${selections.travelStyle.length ? `<p><strong>Travel style:</strong> ${selections.travelStyle.join(', ')}</p>` : ''}
            ${selections.interests.length ? `<p><strong>Interests:</strong> ${selections.interests.join(', ')}</p>` : ''}
            ${selections.startDate ? `<p><strong>Start date:</strong> ${selections.startDate}</p>` : ''}
            ${selections.flexibleDates ? `<p><strong>Date flexibility:</strong> Yes</p>` : ''}
            ${selections.specialRequests ? `<p><strong>Special requests:</strong> ${selections.specialRequests}</p>` : ''}
            ${selections.flightNumber.trim() ? `<p><strong>Flight number:</strong> ${selections.flightNumber.trim()}</p>` : ''}
            ${selections.arrivalTime ? `<p><strong>Scheduled arrival time:</strong> ${selections.arrivalTime}</p>` : ''}
            ${hasEstimate ? `<p style="margin-top:12px;padding-top:12px;border-top:1px solid #ddd"><strong>Estimated price:</strong> from ${format(estimatedTotal)} &nbsp;<span style="color:#888;font-size:13px">(per vehicle · subject to final confirmation)</span></p>` : ''}
          </div>

          <h2>Selected Destinations</h2>
          ${selectedDests.map((d, i) => `
            <div class="dest">
              <strong>${i + 1}. ${d.name}</strong>
              <br/><span style="color:#666">${d.desc}</span>
            </div>
          `).join('')}
          ${selections.otherPlaces ? `<div class="dest"><strong>Also visiting:</strong> ${selections.otherPlaces}</div>` : ''}

          <h2>What happens next?</h2>
          <p><strong>1. Submit your request</strong> \u2014 Hit submit and our team will review your trip details.</p>
          <p><strong>2. We'll reach out within 24 hrs</strong> \u2014 We'll contact you to confirm your trip and send a final quote${hasEstimate ? ` (estimated from ${format(estimatedTotal)})` : ''}.</p>
          <p><strong>3. Book and meet your driver</strong> \u2014 Pay securely online and we'll assign your personal driver.</p>

          <p style="margin-top:32px"><strong>Questions? Get in touch</strong></p>
          <p>Email: hello@peacockdrivers.com<br/>Website: peacockdrivers.com</p>

          <div class="footer">
            <p>Peacock Drivers \u00b7 Private driver tours across Sri Lanka</p>
            <p>Created on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }

      trackEvent('cyo_pdf_downloaded', { step, destinationCount: selections.destinations.length });
    } catch {
      toast({ title: 'Couldn\u2019t generate PDF', description: 'Please try again', variant: 'destructive' });
    } finally {
      setPdfGenerating(false);
    }
  };

  // ── Submit request handler ──────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const locations = selections.tripType === 'scratch'
        ? [
            ...(selections.startFrom ? [selections.startFrom] : []),
            ...selections.itinerary.filter(d => d.to).map(d => d.to),
          ]
        : [
            ...selectedDestNames,
            ...(selections.otherPlaces ? [selections.otherPlaces] : []),
          ];
      const result = await api.post<any>('/custom-requests', {
        tripType: selections.tripType,
        locations,
        preferredDates: selections.startDate || undefined,
        durationDays: selections.days,
        flexibility: selections.flexibleDates,
        vehiclePreference: selections.vehicle,
        passengers: selections.pax,
        budgetRange: selections.budget,
        travelStyle: selections.travelStyle,
        interests: selections.interests,
        specialRequests: selections.specialRequests || undefined,
        flightNumber: selections.flightNumber.trim() || undefined,
        arrivalTime: selections.arrivalTime.trim() || undefined,
        guestName: selections.name || undefined,
        guestEmail: selections.email || undefined,
        guestPhone: selections.phone || undefined,
        estimatedTotal: estimatedTotal > 0 ? estimatedTotal : undefined,
        selectedUpsellIds: Object.entries(selectedUpsells).filter(([, v]) => v).map(([id]) => id),
      });
      const ref = result.referenceCode || result.id || `CYO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      setCyoRef(ref);
      setSubmitted(true);
      clearWizardState();
      window.scrollTo({ top: 0, behavior: 'instant' });

      analytics.cyoRequestSubmitted(locations, selections.days);
      trackEvent('cyo_request_submitted', {
        destinationCount: selections.destinations.length,
        duration: selections.days,
        vehicleType: selections.vehicle,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close email capture on outside click ────────────────────────────────

  useEffect(() => {
    if (!showEmailCapture) return;
    const handler = (e: MouseEvent) => {
      if (emailCaptureRef.current && !emailCaptureRef.current.contains(e.target as Node)) {
        setShowEmailCapture(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmailCapture]);

  // ── Close auth modal on escape ──────────────────────────────────────────

  useEffect(() => {
    if (!showAuthModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAuthModal]);

  // ── Pre-fill email capture from user ────────────────────────────────────

  useEffect(() => {
    if (user?.email) setEmailCaptureEmail(user.email);
  }, [user]);

  // ── Track wizard start ──────────────────────────────────────────────────

  useEffect(() => {
    trackEvent('cyo_wizard_started');
  }, []);

  // ── Submitted success screen ────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-32">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-4xl text-forest-600 mb-3">Request submitted!</h1>
          <p className="font-body text-warm-500 text-lg mb-2">Your reference number:</p>
          <p className="font-mono text-2xl text-forest-600 bg-white px-6 py-3 rounded-xl border border-warm-200 inline-block mb-8">{cyoRef}</p>
          <p className="font-body text-warm-500 mb-10">Our team will review your request and send you a personalised quote within 24–48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/"><Button variant="outline" className="font-body">Back to Home</Button></Link>
            <Link href="/tours"><Button className="font-body">Browse Tours</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Scratch-mode derived display names ──────────────────────────────────

  const scratchDestNames = selections.tripType === 'scratch'
    ? [
        ...(selections.startFrom ? [selections.startFrom] : []),
        ...selections.itinerary.filter(d => d.to).map(d => d.to),
      ]
    : selectedDestNames.length > 0
      ? selectedDestNames
      : selections.itinerary.filter(d => d.to).map(d => d.to);

  // Both scratch and template now use itinerary — fall back to selections.days if not yet loaded
  const displayDays = selections.itinerary.length > 0
    ? selections.itinerary.length
    : selections.days;

  // ── Estimated price (step 5) ────────────────────────────────────────────
  // Prefer CYO-specific rates from admin; fall back to base vehicle pricePerDay
  const selectedVehicleObj = (vehicles ?? []).find((v: any) => v.id === selections.vehicle);
  const vehicleSlug = selectedVehicleObj?.slug ?? selectedVehicleObj?.type ?? selections.vehicle;
  const estimatedRate: number =
    (cyoPricing?.vehicleRates?.[vehicleSlug] ?? selectedVehicleObj?.pricePerDay ?? 0);
  const activeUpsells = (cyoPricing?.upsells ?? []).filter((u: any) => u.isActive);
  const upsellsTotal: number = activeUpsells.reduce(
    (sum: number, u: any) => sum + (selectedUpsells[u.id] ? u.priceGBP : 0), 0
  );
  const estimatedTotal: number = estimatedRate * displayDays + upsellsTotal;
  const hasEstimate = !!selections.vehicle && displayDays > 0 && estimatedRate > 0;

  // ── Determine which actions to show in summary bar ──────────────────────

  const hasPlaces = selections.itinerary.some(d => d.to !== '');

  const showSummaryBar = step >= 2 && hasPlaces;
  const showSaveAction = step >= 2 && step <= 4;
  const showEmailAction = step >= 2;
  const showDownloadAction = step === 5;

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-forest-600 py-16 -mt-24 pt-36 mb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-amber-200 mb-3">BESPOKE TRAVEL</p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Create your <em className="italic text-amber-200">own journey</em>
          </h1>
          <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
            Design your perfect Sri Lankan itinerary in minutes. Choose your destinations,
            set your pace, and we'll build the trip around you.
          </p>

          <HowItWorksSteps steps={[
            {
              title: 'Create your own journey',
              desc: 'Use any of our Ready to Go templates as a starting point or build your very own dream journey using our Trip Wizard.',
            },
            {
              title: 'Select your vehicle',
              desc: 'Select your vehicle, number of travellers, and pay securely online. Stripe-powered checkout.',
            },
            {
              title: 'Meet your driver',
              desc: 'Your personal, English-speaking and Tourist Board-certified concierge driver arrives on time, ready to bring your bespoke Sri Lankan wish list to life.',
            },
          ]} />
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6">

        {/* Recovery banner */}
        {showRecovery && (
          <div className="bg-cream border border-warm-200 rounded-xl p-4 mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-forest-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-forest-600">Welcome back! You have an unsaved trip</p>
              <p className="font-body text-xs text-warm-500">
                {recoveryData ? `${recoveryData.selections.destinations.length} destination${recoveryData.selections.destinations.length !== 1 ? 's' : ''} selected` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button size="sm" onClick={handleRecoveryContinue} className="font-body">Continue</Button>
              <button onClick={handleRecoveryFresh} className="font-body text-xs text-warm-400 hover:text-warm-600 transition-colors">Start fresh</button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="bg-white rounded-full p-1.5 shadow-sm border border-warm-100 flex justify-between mb-10 overflow-x-auto hide-scrollbar">
          {stepLabels.map((s, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isPast = step > num;
            return (
              <div
                key={num}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium transition-colors shrink-0 cursor-pointer ${
                  isActive ? 'bg-forest-500 text-white' :
                  isPast ? 'text-forest-600 bg-sage' : 'text-warm-400'
                }`}
                onClick={() => isPast && setStep(num)}
              >
                {isPast ? <Check className="w-4 h-4" /> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-warm-100 p-8 md:p-12 min-h-[500px]">

          {/* ── STEP 1: Basics ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-2">Choose your starting point</h2>
              <p className="font-body text-warm-500 text-sm mb-8">Pick a ready-to-go template, or design your own trip from scratch.</p>

              {/* ── Tour template grid ── */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {isLoadingGroups
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-[160px] bg-warm-100 rounded-2xl animate-pulse" />
                    ))
                  : (tourGroups ?? []).map((group: any) => {
                      const isSelected = selections.tripType === group.groupSlug;
                      const heroImg = group.heroImages?.[0] ?? '';
                      return (
                        <div
                          key={group.groupSlug}
                          onClick={() => selectTemplate(group.groupSlug)}
                          className={`rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                            isSelected
                              ? 'border-forest-500 shadow-md ring-2 ring-forest-200'
                              : 'border-transparent hover:border-forest-300'
                          }`}
                        >
                          <div
                            className="relative h-[160px] w-full"
                            style={{ background: `url('${heroImg}') center/cover no-repeat` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-forest-700/85 via-forest-700/20 to-transparent" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-forest-500 rounded-full flex items-center justify-center shadow">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="font-display text-xl text-white leading-tight line-clamp-2">{group.name}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                }
              </div>

              {/* ── Duration picker — shown when a template is selected ── */}
              {selections.tripType && selections.tripType !== 'scratch' && (() => {
                const selectedGroup = (tourGroups ?? []).find((g: any) => g.groupSlug === selections.tripType);
                const activeDur = templateDurations[selections.tripType] ?? selectedGroup?.variants?.[0]?.durationDays ?? 7;
                return (
                  <div className="my-5 p-5 bg-sage rounded-2xl border border-forest-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="font-body text-sm font-medium text-forest-600 mb-3">
                      How many days for your <span className="font-semibold">{selectedGroup?.name}</span>?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {DURATIONS.map(d => {
                        const hasVariant = selectedGroup?.variants?.some((v: any) => v.durationDays === d);
                        if (!hasVariant) return null;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setTemplateDurationFor(selections.tripType, d)}
                            className={`px-5 py-2 rounded-full font-body text-sm font-medium border-2 transition-all ${
                              activeDur === d
                                ? 'bg-forest-500 text-white border-forest-500 shadow-sm'
                                : 'bg-white text-warm-600 border-warm-200 hover:border-forest-400 hover:text-forest-600'
                            }`}
                          >
                            {d} days
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── Create from scratch — full width ── */}
              <div
                onClick={() => setSelections(s => ({ ...s, tripType: 'scratch' }))}
                className={`rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-4 px-6 py-5 ${
                  selections.tripType === 'scratch'
                    ? 'border-forest-500 bg-forest-50 shadow-sm'
                    : 'border-dashed border-warm-300 hover:border-forest-400 bg-warm-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  selections.tripType === 'scratch' ? 'bg-forest-500 text-white' : 'bg-warm-100 text-warm-400'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-forest-600">Create from scratch</p>
                  <p className="font-body text-xs text-warm-400 leading-snug">Design your own fully custom itinerary</p>
                </div>
                {selections.tripType === 'scratch' && <Check className="w-5 h-5 text-forest-500 ml-auto" />}
              </div>
            </div>
          )}

          {/* ── STEP 2: Places ─────────────────────────────────────────── */}
          {step === 2 && selections.tripType === 'scratch' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h2 className="font-display text-3xl text-forest-600 mb-1">Where do you want to go?</h2>
                <p className="font-body text-warm-500 text-sm">
                  Add days, pick destinations — your route builds live on the map.
                </p>
              </div>

              <div className="flex flex-col xl:flex-row gap-6">
                {/* Left: itinerary builder */}
                <div className="flex-1 min-w-0">
                  <ItineraryBuilder
                    startFrom={selections.startFrom}
                    startFromId={selections.startFromId}
                    startFromLat={selections.startFromLat}
                    startFromLng={selections.startFromLng}
                    itinerary={selections.itinerary}
                    knownDestinations={DESTINATIONS}
                    onChange={(itinerary, startFrom, startFromId, startFromCoords) =>
                      setSelections(s => ({
                        ...s,
                        itinerary,
                        startFrom,
                        startFromId,
                        startFromLat: startFromCoords?.lat,
                        startFromLng: startFromCoords?.lng,
                      }))
                    }
                  />
                </div>

                {/* Right: live map */}
                <div className="xl:w-[420px] shrink-0">
                  <div className="sticky top-24">
                    <div className="relative">
                      <MapView
                        markers={scratchMapMarkers}
                        showRoute={scratchMapMarkers.length >= 2}
                        height="520px"
                        className="shadow-xl"
                      />
                      {/* Expand button */}
                      <button
                        onClick={() => setScratchMapExpanded(true)}
                        className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-md border border-warm-200 font-body text-xs font-medium text-forest-600 transition-all"
                        title="Expand map"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Expand
                      </button>
                      {scratchMapMarkers.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
                          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 text-center shadow-lg">
                            <p className="font-display text-lg text-forest-600 mb-1">Build your route</p>
                            <p className="font-body text-xs text-warm-500">
                              Add days &amp; pick destinations<br />and watch your journey form
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {scratchMapMarkers.length >= 2 && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-forest-500" />
                        <p className="font-body text-xs text-warm-500">
                          {scratchMapMarkers.length} stops · route updating live
                        </p>
                      </div>
                    )}
                    {/* ── Optimise Route button — delete this block to remove the feature ── */}
                    {scratchMapMarkers.length >= 3 && (
                      <button
                        type="button"
                        onClick={handleOptimiseRoute}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-warm-200 hover:border-forest-400 hover:bg-forest-50 bg-white text-warm-500 hover:text-forest-600 transition-all font-body text-xs font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Optimise route order
                      </button>
                    )}
                  </div>
                </div>

                {/* Map lightbox */}
                {scratchMapExpanded && (
                  <div
                    className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                    onClick={() => setScratchMapExpanded(false)}
                  >
                    <div
                      className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
                      style={{ height: '85vh' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button
                        onClick={() => setScratchMapExpanded(false)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-warm-50 transition-colors"
                      >
                        <X className="w-5 h-5 text-forest-600" />
                      </button>

                      {/* Route stops sidebar */}
                      {scratchMapMarkers.length > 0 && (
                        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 max-h-[calc(85vh-2rem)] overflow-y-auto w-52">
                          <p className="font-body text-xs font-semibold text-forest-600 mb-3 uppercase tracking-wide">Route stops</p>
                          <div className="space-y-2">
                            {scratchMapMarkers.map((m, i) => (
                              <div key={m.id} className="flex items-center gap-2.5">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0 ${
                                  i === 0 ? 'bg-forest-600 border-forest-600 text-white' :
                                  i === scratchMapMarkers.length - 1 ? 'bg-amber-400 border-amber-400 text-forest-800' :
                                  'bg-white border-forest-400 text-forest-600'
                                }`}>{i + 1}</div>
                                <span className="font-body text-xs text-warm-700 leading-tight">{m.label}</span>
                              </div>
                            ))}
                          </div>
                          <p className="font-body text-[10px] text-warm-400 mt-3 pt-3 border-t border-warm-100">Press Esc to close</p>
                        </div>
                      )}

                      <MapView
                        markers={scratchMapMarkers}
                        showRoute={scratchMapMarkers.length >= 2}
                        height="100%"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template scenario — pre-loaded itinerary, fully editable */}
          {step === 2 && selections.tripType !== 'scratch' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Loading skeleton */}
              {templateItineraryLoading && (
                <div className="flex flex-col gap-3">
                  <div className="h-6 w-48 bg-warm-100 rounded-lg animate-pulse" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-warm-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Itinerary builder — same as scratch, pre-populated */}
              {!templateItineraryLoading && (
                <>
                  <div className="mb-6">
                    <h2 className="font-display text-3xl text-forest-600 mb-1">Your itinerary</h2>
                    <p className="font-body text-warm-500 text-sm">
                      This is a suggested route — drag to reorder, swap any destination, or add extra days to make it yours.
                    </p>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-6">
                    {/* Left: itinerary builder */}
                    <div className="flex-1 min-w-0">
                      <ItineraryBuilder
                        startFrom={selections.startFrom}
                        startFromId={selections.startFromId}
                        startFromLat={selections.startFromLat}
                        startFromLng={selections.startFromLng}
                        itinerary={selections.itinerary}
                        knownDestinations={DESTINATIONS}
                        onChange={(itinerary, startFrom, startFromId, startFromCoords) =>
                          setSelections(s => ({
                            ...s,
                            itinerary,
                            startFrom,
                            startFromId,
                            startFromLat: startFromCoords?.lat,
                            startFromLng: startFromCoords?.lng,
                          }))
                        }
                      />
                    </div>

                    {/* Right: live map */}
                    <div className="xl:w-[420px] shrink-0">
                      <div className="sticky top-24">
                        <div className="relative">
                          <MapView
                            markers={scratchMapMarkers}
                            showRoute={scratchMapMarkers.length >= 2}
                            height="520px"
                            className="shadow-xl"
                          />
                          <button
                            onClick={() => setScratchMapExpanded(true)}
                            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-md border border-warm-200 font-body text-xs font-medium text-forest-600 transition-all"
                            title="Expand map"
                          >
                            <Maximize2 className="w-3.5 h-3.5" /> Expand
                          </button>
                          {scratchMapMarkers.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
                              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 text-center shadow-lg">
                                <p className="font-display text-lg text-forest-600 mb-1">Tailor this journey</p>
                                <p className="font-body text-xs text-warm-500">
                                  Your route will appear here<br />as you customise your itinerary
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {scratchMapMarkers.length >= 2 && (
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-forest-500" />
                            <p className="font-body text-xs text-warm-500">
                              {scratchMapMarkers.length} stops · route updating live
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Map lightbox — shared with scratch */}
                    {scratchMapExpanded && (
                      <div
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                        onClick={() => setScratchMapExpanded(false)}
                      >
                        <div
                          className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
                          style={{ height: '85vh' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setScratchMapExpanded(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-warm-50 transition-colors"
                          >
                            <X className="w-5 h-5 text-forest-600" />
                          </button>
                          {scratchMapMarkers.length > 0 && (
                            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 max-h-[calc(85vh-2rem)] overflow-y-auto w-52">
                              <p className="font-body text-xs font-semibold text-forest-600 mb-3 uppercase tracking-wide">Route stops</p>
                              <div className="space-y-2">
                                {scratchMapMarkers.map((m, i) => (
                                  <div key={m.id} className="flex items-center gap-2.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0 ${
                                      i === 0 ? 'bg-forest-600 border-forest-600 text-white' :
                                      i === scratchMapMarkers.length - 1 ? 'bg-amber-400 border-amber-400 text-forest-800' :
                                      'bg-white border-forest-400 text-forest-600'
                                    }`}>{i + 1}</div>
                                    <span className="font-body text-xs text-warm-700 leading-tight">{m.label}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="font-body text-[10px] text-warm-400 mt-3 pt-3 border-t border-warm-100">Press Esc to close</p>
                            </div>
                          )}
                          <MapView
                            markers={scratchMapMarkers}
                            showRoute={scratchMapMarkers.length >= 2}
                            height="100%"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 3: Group & Dates ──────────────────────────────────── */}
          {step === 3 && (() => {
            const endDate = (() => {
              if (!selections.startDate || !displayDays) return '';
              const d = new Date(selections.startDate);
              d.setDate(d.getDate() + displayDays - 1);
              return d.toISOString().split('T')[0];
            })();
            const fmtDate = (iso: string) => {
              if (!iso) return '';
              const [y, m, day] = iso.split('-');
              return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            };
            return (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-display text-3xl text-forest-600 mb-8">Who's travelling & when?</h2>

                {/* ── Row 1: Travellers + Dates side by side ── */}
                <div className="grid md:grid-cols-2 gap-10 mb-10">
                  {/* Travellers */}
                  <div>
                    <label className="block text-sm font-medium text-forest-600 mb-4 font-body">Who's travelling?</label>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-body text-sm font-medium text-forest-600">Adults</p>
                          <p className="font-body text-xs text-warm-400">Age 18+</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setAdults(Math.max(1, selections.adults - 1))}
                            className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 disabled:opacity-30 transition-all">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{selections.adults}</span>
                          <button type="button" onClick={() => setAdults(Math.min(12, selections.adults + 1))}
                            className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-warm-100" />
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-body text-sm font-medium text-forest-600">Children</p>
                          <p className="font-body text-xs text-warm-400">Age 0–17</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setChildren(Math.max(0, selections.children - 1))}
                            className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 disabled:opacity-30 transition-all">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{selections.children}</span>
                          <button type="button" onClick={() => setChildren(Math.min(8, selections.children + 1))}
                            className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {selections.children > 0 && (
                        <div className="pt-3 border-t border-warm-100 space-y-3">
                          <p className="font-body text-xs text-warm-500 font-medium">Age of each child at time of travel</p>
                          {Array.from({ length: selections.children }, (_, i) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                              <label className="font-body text-sm text-warm-600 shrink-0">Child {i + 1}</label>
                              <select
                                value={selections.childAges[i] ?? ''}
                                onChange={e => setChildAge(i, e.target.value)}
                                className={`flex-1 max-w-[180px] px-3 py-2 border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none cursor-pointer ${
                                  !selections.childAges[i] ? 'border-amber-300 bg-amber-50 text-warm-500' : 'border-warm-200 text-forest-600'
                                }`}
                              >
                                <option value="">Select age</option>
                                <option value="0">Under 1 (Infant)</option>
                                <option value="1">1 year old</option>
                                {Array.from({ length: 16 }, (_, j) => j + 2).map(age => (
                                  <option key={age} value={String(age)}>{age} years old</option>
                                ))}
                              </select>
                            </div>
                          ))}
                          {!selections.childAges.slice(0, selections.children).every(a => a !== '') && (
                            <p className="font-body text-[11px] text-amber-600">Please select an age for each child</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start date + Trip duration */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Start date <span className="text-red-500">*</span></label>
                      <div className="relative cursor-pointer" onClick={() => startDateRef.current?.showPicker()}>
                        <input
                          ref={startDateRef}
                          type="date"
                          lang="en-GB"
                          value={selections.startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setSelections(s => ({ ...s, startDate: e.target.value }))}
                          onKeyDown={e => e.preventDefault()}
                          onClick={() => startDateRef.current?.showPicker()}
                          className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body focus:ring-2 focus:ring-forest-500 outline-none cursor-pointer"
                        />
                      </div>
                      <label className="flex items-center gap-3 mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selections.flexibleDates}
                          onChange={e => setSelections(s => ({ ...s, flexibleDates: e.target.checked }))}
                          className="w-4 h-4 rounded accent-forest-600"
                        />
                        <span className="font-body text-sm text-warm-600">My dates are flexible</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Trip duration</label>
                      <div className="flex items-center gap-3 bg-warm-50 border border-warm-200 rounded-xl py-3 px-4">
                        <Calendar className="w-4 h-4 text-forest-500 shrink-0" />
                        <span className="font-body text-sm text-forest-600 font-medium">{displayDays} day{displayDays !== 1 ? 's' : ''}</span>
                        <span className="font-body text-xs text-warm-400">
                          — {selections.tripType === 'scratch' ? 'from your itinerary' : 'from your selection'}
                        </span>
                      </div>
                      {selections.startDate && endDate && (
                        <div className="mt-3 bg-sage rounded-xl p-4">
                          <p className="font-body text-xs text-warm-500 mb-1">Your trip window</p>
                          <p className="font-body text-sm text-forest-600 font-medium">{fmtDate(selections.startDate)} → {fmtDate(endDate)}</p>
                          <p className="font-body text-xs text-warm-400 mt-1">{displayDays} days · {displayDays - 1} nights</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Row 2: Vehicle (full width, all visible) ── */}
                <div className="mb-10 pb-10 border-b border-warm-100">
                  <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Vehicle <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {(vehicles || []).map(v => {
                      const cyoRate = cyoPricing?.vehicleRates?.[v.slug ?? v.type ?? v.id] ?? v.pricePerDay;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelections(s => ({ ...s, vehicle: v.id }))}
                          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 flex-1 min-w-[100px] cursor-pointer ${
                            selections.vehicle === v.id
                              ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500 shadow-sm'
                              : 'border-warm-200 bg-white hover:border-forest-300 hover:shadow-sm'
                          }`}
                        >
                          <img src={v.image} alt={v.name} className="w-16 h-10 object-contain mb-2" />
                          <span className="font-body font-semibold text-sm text-forest-600">{v.name}</span>
                          <span className="font-body text-xs text-warm-400 mt-0.5">{v.capacity}</span>
                          <span className="font-body text-sm font-semibold text-forest-500 mt-1">
                            {format(cyoRate)}<span className="text-xs font-normal text-warm-400">/day</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-body text-xs text-warm-400 mt-3">
                    <span className="text-forest-500 font-medium">Auto-selected</span> based on {selections.pax} traveller{selections.pax !== 1 ? 's' : ''} — you can override above
                  </p>
                </div>

                {/* ── Row 3: Flight details ── */}
                <div>
                  <div className="mb-4">
                    <p className="font-body text-sm font-medium text-forest-600">Flight details <span className="text-warm-400 font-normal">(Optional)</span></p>
                    <p className="font-body text-xs text-warm-400 mt-1">Help us track your arrival so we can adjust pickup time.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-warm-500 mb-1.5 font-body uppercase tracking-wide">Flight number</label>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                        <input
                          type="text"
                          value={selections.flightNumber}
                          onChange={e => setSelections(s => ({ ...s, flightNumber: e.target.value }))}
                          maxLength={80}
                          placeholder="e.g. EK651"
                          className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-warm-500 mb-1.5 font-body uppercase tracking-wide">Scheduled arrival time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                        <input
                          type="time"
                          value={selections.arrivalTime}
                          onChange={e => setSelections(s => ({ ...s, arrivalTime: e.target.value }))}
                          className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── STEP 4: Preferences ────────────────────────────────────── */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-3">Your preferences</h2>
              <p className="font-body text-sm text-warm-600 mb-8">Tell us a little more about your preferences so we—along with your driver—can share personalised recommendations and help you get the very most from your itinerary.</p>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Budget range <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Budget', 'Mid-range', 'Premium', 'Flexible'].map(b => (
                    <div
                      key={b}
                      onClick={() => setSelections(s => ({ ...s, budget: b.toLowerCase() }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all font-body text-sm font-medium ${
                        selections.budget === b.toLowerCase()
                          ? 'border-forest-500 bg-forest-50 text-forest-600'
                          : 'border-warm-200 text-warm-500 hover:border-forest-300'
                      }`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Travel style <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {['Adventure', 'Cultural', 'Relaxation', 'Mix'].map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selections.travelStyle.includes(style)}
                        onChange={() => toggleStyle(style)}
                        className="w-4 h-4 rounded accent-forest-600"
                      />
                      <span className="font-body text-sm text-warm-600">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Interests <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                        selections.interests.includes(interest)
                          ? 'bg-forest-500 text-white shadow-sm'
                          : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Special requests</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={selections.specialRequests}
                  onChange={e => setSelections(s => ({ ...s, specialRequests: e.target.value }))}
                  className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                  placeholder="Any dietary requirements, accessibility needs, or special occasions?"
                />
                <p className="font-body text-xs text-warm-400 text-right mt-1">{selections.specialRequests.length}/500</p>
              </div>
            </div>
          )}

          {/* ── STEP 5: Review & Submit ────────────────────────────────── */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-2">Review your trip</h2>
              <p className="font-body text-warm-500 text-sm mb-8">
                {scratchDestNames.join(' → ')} · {displayDays} day{displayDays !== 1 ? 's' : ''} · {selections.adults} Adult{selections.adults !== 1 ? 's' : ''}{selections.children > 0 ? `, ${selections.children} Child${selections.children !== 1 ? 'ren' : ''}` : ''}
              </p>

              {/* Trip plan hero map */}
              {activeMapMarkers.length >= 2 && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <MapView
                    markers={activeMapMarkers}
                    showRoute={true}
                    height="200px"
                  />
                </div>
              )}

              {/* Full trip summary */}
              <div className="bg-warm-50 rounded-2xl p-6 mb-8 border border-warm-200">
                {/* 3-column stat grid */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-5 font-body text-sm pb-5 mb-5 border-b border-warm-200">
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Trip type</span>
                    <span className="text-forest-600 font-medium">
                      {selections.tripType === 'scratch' ? 'Custom trip' : ((tourGroups ?? []).find((g: any) => g.groupSlug === selections.tripType)?.name ?? selections.tripType) || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Travellers</span>
                    <span className="text-forest-600 font-medium">
                      {selections.adults} Adult{selections.adults !== 1 ? 's' : ''}
                      {selections.children > 0 && `, ${selections.children} Child${selections.children !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Duration</span>
                    <span className="text-forest-600 font-medium">{displayDays} day{displayDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Start date</span>
                    <span className="text-forest-600 font-medium">
                      {selections.flexibleDates && !selections.startDate
                        ? 'Flexible'
                        : selections.startDate
                          ? new Date(selections.startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Budget</span>
                    <span className="text-forest-600 font-medium capitalize">{selections.budget || '—'}</span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Vehicle</span>
                    <span className="text-forest-600 font-medium">
                      {(vehicles ?? []).find((v: any) => v.id === selections.vehicle)?.name ?? selections.vehicle ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Destinations / Itinerary */}
                <div className="pb-5 mb-5 border-b border-warm-200">
                  <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-2 font-body">
                    {selections.tripType === 'scratch' ? 'Itinerary' : 'Destinations'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selections.tripType === 'scratch'
                      ? selections.itinerary.filter(d => d.to).map((d, i) => (
                          <span key={d.id} className="px-3 py-1 bg-white border border-warm-200 rounded-full text-xs font-medium text-forest-600 font-body">
                            {i + 1}. {d.to}
                          </span>
                        ))
                      : scratchDestNames.map(n => (
                          <span key={n} className="px-3 py-1 bg-white border border-warm-200 rounded-full text-xs font-medium text-forest-600 font-body">{n}</span>
                        ))
                    }
                    {selections.tripType !== 'scratch' && selections.otherPlaces && (
                      <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 font-body">{selections.otherPlaces}</span>
                    )}
                  </div>
                </div>

                {/* Travel style + Interests side by side */}
                <div className="grid grid-cols-2 gap-6 pb-5 mb-5 border-b border-warm-200">
                  {selections.travelStyle.length > 0 && (
                    <div>
                      <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-2 font-body">Travel style</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selections.travelStyle.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-forest-50 border border-forest-200 rounded-full text-xs font-medium text-forest-600 font-body">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selections.interests.length > 0 && (
                    <div>
                      <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-2 font-body">Interests</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selections.interests.map(i => (
                          <span key={i} className="px-2.5 py-1 bg-forest-50 border border-forest-200 rounded-full text-xs font-medium text-forest-600 font-body">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional extras — only shown if present */}
                {(selections.specialRequests || selections.flightNumber.trim() || selections.arrivalTime) && (
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4 font-body text-sm">
                    {selections.specialRequests && (
                      <div className="col-span-3">
                        <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Special requests</span>
                        <p className="text-forest-600 text-sm">{selections.specialRequests}</p>
                      </div>
                    )}
                    {selections.flightNumber.trim() && (
                      <div>
                        <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Flight</span>
                        <p className="text-forest-600 font-medium">{selections.flightNumber.trim()}</p>
                      </div>
                    )}
                    {selections.arrivalTime && (
                      <div>
                        <span className="text-warm-400 block text-[10px] uppercase tracking-widest mb-1">Arrival time</span>
                        <p className="text-forest-600 font-medium">{selections.arrivalTime}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional upsells */}
              {activeUpsells.length > 0 && (
                <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 mb-4">
                  <p className="font-body text-[10px] uppercase tracking-widest text-warm-400 mb-3">Optional extras</p>
                  <div className="space-y-1">
                    {activeUpsells.map((u: any) => (
                      <label key={u.id} className="flex items-center gap-3 py-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!selectedUpsells[u.id]}
                          onChange={e => setSelectedUpsells(prev => ({ ...prev, [u.id]: e.target.checked }))}
                          className="w-4 h-4 accent-forest-600 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-sm text-forest-600 font-medium group-hover:text-forest-700">{u.name}</span>
                          {u.description && (
                            <span className="font-body text-xs text-warm-400 block">{u.description}</span>
                          )}
                        </div>
                        <span className="font-body text-sm text-forest-700 font-medium shrink-0">+{format(u.priceGBP)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated price block */}
              {hasEstimate && (
                <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5 mb-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-body text-sm text-warm-500">
                      {format(estimatedRate)} × {displayDays} days{upsellsTotal > 0 ? ` + extras` : ''}
                    </span>
                    <span className="font-display text-3xl text-forest-700">
                      from {format(estimatedTotal)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-warm-400">
                    Estimated price · per vehicle, not per person · Our team will confirm your final quote within 24 hrs
                  </p>
                </div>
              )}

              {/* "Not ready" nudge */}
              <p className="font-body text-sm text-warm-400 mb-6">
                Not ready to submit? You can also{' '}
                <button onClick={() => setShowEmailCapture(true)} className="text-forest-500 hover:underline">email yourself this trip</button>
                {' '}or{' '}
                <button onClick={handleDownloadPDF} className="text-forest-500 hover:underline">download a PDF</button>
                {' '}to review later.
              </p>

              {/* Contact info form */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Full name *</label>
                  <input
                    type="text"
                    value={selections.name}
                    onChange={e => setSelections(s => ({ ...s, name: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Email address *</label>
                  <input
                    type="email"
                    value={selections.email}
                    onChange={e => setSelections(s => ({ ...s, email: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Phone number</label>
                  <input
                    type="tel"
                    value={selections.phone}
                    onChange={e => setSelections(s => ({ ...s, phone: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Country</label>
                  <select
                    value={selections.country}
                    onChange={e => setSelections(s => ({ ...s, country: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                  >
                    <option value="">Select country</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="LK">Sri Lanka</option>
                    <option value="IN">India</option>
                    <option disabled>──────────────</option>
                    <option value="AF">Afghanistan</option>
                    <option value="AL">Albania</option>
                    <option value="DZ">Algeria</option>
                    <option value="AD">Andorra</option>
                    <option value="AO">Angola</option>
                    <option value="AG">Antigua and Barbuda</option>
                    <option value="AR">Argentina</option>
                    <option value="AM">Armenia</option>
                    <option value="AT">Austria</option>
                    <option value="AZ">Azerbaijan</option>
                    <option value="BS">Bahamas</option>
                    <option value="BH">Bahrain</option>
                    <option value="BD">Bangladesh</option>
                    <option value="BB">Barbados</option>
                    <option value="BY">Belarus</option>
                    <option value="BE">Belgium</option>
                    <option value="BZ">Belize</option>
                    <option value="BJ">Benin</option>
                    <option value="BT">Bhutan</option>
                    <option value="BO">Bolivia</option>
                    <option value="BA">Bosnia and Herzegovina</option>
                    <option value="BW">Botswana</option>
                    <option value="BR">Brazil</option>
                    <option value="BN">Brunei</option>
                    <option value="BG">Bulgaria</option>
                    <option value="BF">Burkina Faso</option>
                    <option value="BI">Burundi</option>
                    <option value="CV">Cabo Verde</option>
                    <option value="KH">Cambodia</option>
                    <option value="CM">Cameroon</option>
                    <option value="CF">Central African Republic</option>
                    <option value="TD">Chad</option>
                    <option value="CL">Chile</option>
                    <option value="CN">China</option>
                    <option value="CO">Colombia</option>
                    <option value="KM">Comoros</option>
                    <option value="CG">Congo</option>
                    <option value="CD">Congo (DRC)</option>
                    <option value="CR">Costa Rica</option>
                    <option value="HR">Croatia</option>
                    <option value="CU">Cuba</option>
                    <option value="CY">Cyprus</option>
                    <option value="CZ">Czech Republic</option>
                    <option value="DK">Denmark</option>
                    <option value="DJ">Djibouti</option>
                    <option value="DM">Dominica</option>
                    <option value="DO">Dominican Republic</option>
                    <option value="EC">Ecuador</option>
                    <option value="EG">Egypt</option>
                    <option value="SV">El Salvador</option>
                    <option value="GQ">Equatorial Guinea</option>
                    <option value="ER">Eritrea</option>
                    <option value="EE">Estonia</option>
                    <option value="SZ">Eswatini</option>
                    <option value="ET">Ethiopia</option>
                    <option value="FJ">Fiji</option>
                    <option value="FI">Finland</option>
                    <option value="FR">France</option>
                    <option value="GA">Gabon</option>
                    <option value="GM">Gambia</option>
                    <option value="GE">Georgia</option>
                    <option value="DE">Germany</option>
                    <option value="GH">Ghana</option>
                    <option value="GR">Greece</option>
                    <option value="GD">Grenada</option>
                    <option value="GT">Guatemala</option>
                    <option value="GN">Guinea</option>
                    <option value="GW">Guinea-Bissau</option>
                    <option value="GY">Guyana</option>
                    <option value="HT">Haiti</option>
                    <option value="HN">Honduras</option>
                    <option value="HU">Hungary</option>
                    <option value="IS">Iceland</option>
                    <option value="ID">Indonesia</option>
                    <option value="IR">Iran</option>
                    <option value="IQ">Iraq</option>
                    <option value="IE">Ireland</option>
                    <option value="IL">Israel</option>
                    <option value="IT">Italy</option>
                    <option value="JM">Jamaica</option>
                    <option value="JP">Japan</option>
                    <option value="JO">Jordan</option>
                    <option value="KZ">Kazakhstan</option>
                    <option value="KE">Kenya</option>
                    <option value="KI">Kiribati</option>
                    <option value="KW">Kuwait</option>
                    <option value="KG">Kyrgyzstan</option>
                    <option value="LA">Laos</option>
                    <option value="LV">Latvia</option>
                    <option value="LB">Lebanon</option>
                    <option value="LS">Lesotho</option>
                    <option value="LR">Liberia</option>
                    <option value="LY">Libya</option>
                    <option value="LI">Liechtenstein</option>
                    <option value="LT">Lithuania</option>
                    <option value="LU">Luxembourg</option>
                    <option value="MG">Madagascar</option>
                    <option value="MW">Malawi</option>
                    <option value="MY">Malaysia</option>
                    <option value="MV">Maldives</option>
                    <option value="ML">Mali</option>
                    <option value="MT">Malta</option>
                    <option value="MH">Marshall Islands</option>
                    <option value="MR">Mauritania</option>
                    <option value="MU">Mauritius</option>
                    <option value="MX">Mexico</option>
                    <option value="FM">Micronesia</option>
                    <option value="MD">Moldova</option>
                    <option value="MC">Monaco</option>
                    <option value="MN">Mongolia</option>
                    <option value="ME">Montenegro</option>
                    <option value="MA">Morocco</option>
                    <option value="MZ">Mozambique</option>
                    <option value="MM">Myanmar</option>
                    <option value="NA">Namibia</option>
                    <option value="NR">Nauru</option>
                    <option value="NP">Nepal</option>
                    <option value="NL">Netherlands</option>
                    <option value="NZ">New Zealand</option>
                    <option value="NI">Nicaragua</option>
                    <option value="NE">Niger</option>
                    <option value="NG">Nigeria</option>
                    <option value="KP">North Korea</option>
                    <option value="MK">North Macedonia</option>
                    <option value="NO">Norway</option>
                    <option value="OM">Oman</option>
                    <option value="PK">Pakistan</option>
                    <option value="PW">Palau</option>
                    <option value="PA">Panama</option>
                    <option value="PG">Papua New Guinea</option>
                    <option value="PY">Paraguay</option>
                    <option value="PE">Peru</option>
                    <option value="PH">Philippines</option>
                    <option value="PL">Poland</option>
                    <option value="PT">Portugal</option>
                    <option value="QA">Qatar</option>
                    <option value="RO">Romania</option>
                    <option value="RU">Russia</option>
                    <option value="RW">Rwanda</option>
                    <option value="KN">Saint Kitts and Nevis</option>
                    <option value="LC">Saint Lucia</option>
                    <option value="VC">Saint Vincent and the Grenadines</option>
                    <option value="WS">Samoa</option>
                    <option value="SM">San Marino</option>
                    <option value="ST">São Tomé and Príncipe</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="SN">Senegal</option>
                    <option value="RS">Serbia</option>
                    <option value="SC">Seychelles</option>
                    <option value="SL">Sierra Leone</option>
                    <option value="SG">Singapore</option>
                    <option value="SK">Slovakia</option>
                    <option value="SI">Slovenia</option>
                    <option value="SB">Solomon Islands</option>
                    <option value="SO">Somalia</option>
                    <option value="ZA">South Africa</option>
                    <option value="KR">South Korea</option>
                    <option value="SS">South Sudan</option>
                    <option value="ES">Spain</option>
                    <option value="SD">Sudan</option>
                    <option value="SR">Suriname</option>
                    <option value="SE">Sweden</option>
                    <option value="CH">Switzerland</option>
                    <option value="SY">Syria</option>
                    <option value="TW">Taiwan</option>
                    <option value="TJ">Tajikistan</option>
                    <option value="TZ">Tanzania</option>
                    <option value="TH">Thailand</option>
                    <option value="TL">Timor-Leste</option>
                    <option value="TG">Togo</option>
                    <option value="TO">Tonga</option>
                    <option value="TT">Trinidad and Tobago</option>
                    <option value="TN">Tunisia</option>
                    <option value="TR">Turkey</option>
                    <option value="TM">Turkmenistan</option>
                    <option value="TV">Tuvalu</option>
                    <option value="UG">Uganda</option>
                    <option value="UA">Ukraine</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="UY">Uruguay</option>
                    <option value="UZ">Uzbekistan</option>
                    <option value="VU">Vanuatu</option>
                    <option value="VE">Venezuela</option>
                    <option value="VN">Vietnam</option>
                    <option value="YE">Yemen</option>
                    <option value="ZM">Zambia</option>
                    <option value="ZW">Zimbabwe</option>
                  </select>
                </div>
              </div>

              <p className="font-body text-sm text-warm-400 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                Once submitted, we'll reach out within 24 hrs to confirm your trip details and send you a final quote.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-body text-sm text-red-600">{submitError}</div>
          )}

          {/* ── Trip Summary Bar ────────────────────────────────────────── */}
          {showSummaryBar && (
            <div className="mt-6 pt-4 border-t border-warm-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: trip summary indicators */}
                <div className="flex items-center gap-3 flex-wrap text-xs font-body text-warm-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-warm-400" />
                    {scratchDestNames.length <= 2
                      ? scratchDestNames.join(', ')
                      : `${scratchDestNames[0]}, ${scratchDestNames[1]}, +${scratchDestNames.length - 2} more`}
                  </span>
                  {displayDays > 0 && (
                    <>
                      <span className="text-warm-300">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-warm-400" />
                        {displayDays} day{displayDays !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  <span className="text-warm-300">·</span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-warm-400" />
                    <span className="capitalize">{selections.vehicle}</span>
                  </span>
                  <span className="text-warm-300">·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-warm-400" />
                    {selections.adults} Adult{selections.adults !== 1 ? 's' : ''}
                    {selections.children > 0 && `, ${selections.children} Child${selections.children !== 1 ? 'ren' : ''}`}
                  </span>
                  {/* Auto-save indicator */}
                  {user && isSaved && (
                    <>
                      <span className="text-warm-300">·</span>
                      <span className="text-warm-400 text-[11px]">Auto-saved ✓</span>
                    </>
                  )}
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-2 relative">
                  {showSaveAction && (
                    <button
                      onClick={handleSaveTrip}
                      disabled={isSaved && !!user}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium text-forest-500 hover:bg-forest-50 transition-colors disabled:opacity-50 disabled:cursor-default"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isSaved && user ? 'Saved ✓' : 'Save trip'}</span>
                    </button>
                  )}

                  {showEmailAction && (
                    <div className="relative" ref={emailCaptureRef}>
                      <button
                        onClick={() => setShowEmailCapture(!showEmailCapture)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium text-forest-500 hover:bg-forest-50 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Email me this trip</span>
                      </button>

                      {/* Email capture inline form */}
                      {showEmailCapture && (
                        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-lg border border-warm-100 p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          {emailSent ? (
                            <div className="text-center py-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Check className="w-5 h-5 text-emerald-600" />
                              </div>
                              <p className="font-body text-sm font-medium text-forest-600">Trip plan sent! Check your email</p>
                            </div>
                          ) : (
                            <form onSubmit={handleEmailCapture}>
                              <p className="font-body text-sm font-medium text-forest-600 mb-3">Get your trip plan by email</p>
                              <input
                                type="email"
                                required
                                value={emailCaptureEmail}
                                onChange={e => setEmailCaptureEmail(e.target.value)}
                                className="w-full bg-white border border-warm-200 rounded-lg py-2 px-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none mb-2"
                                placeholder="your@email.com"
                                autoFocus
                              />
                              <input
                                type="text"
                                value={emailCaptureName}
                                onChange={e => setEmailCaptureName(e.target.value)}
                                className="w-full bg-white border border-warm-200 rounded-lg py-2 px-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none mb-3"
                                placeholder="Your name (optional)"
                              />
                              <Button
                                type="submit"
                                disabled={emailSending}
                                className="w-full h-10 bg-amber-200 text-forest-600 hover:bg-amber-300 font-body text-sm"
                              >
                                {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send my trip'}
                              </Button>
                              <p className="font-body text-[11px] text-warm-400 mt-2">
                                We'll send your trip plan and may follow up with a quote. Unsubscribe anytime.
                              </p>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {showDownloadAction && (
                    <button
                      onClick={handleDownloadPDF}
                      disabled={pdfGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium text-forest-500 hover:bg-forest-50 transition-colors"
                    >
                      {pdfGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Download PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ─────────────────────────────────────── */}
          <div className="flex justify-between mt-6 pt-6 border-t border-warm-100">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="font-body">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < 5 ? (
              <Button
                size="lg"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="h-14 px-10 text-lg group font-body"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="h-14 px-10 text-lg bg-amber-200 text-warm-900 hover:bg-amber-300 font-body"
              >
                {submitting ? 'Submitting…' : hasEstimate ? `Submit request — from ${format(estimatedTotal)}` : 'Submit request'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Auth Modal (for Save Trip when not logged in) ──────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-[440px] w-full p-8 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-warm-400 hover:text-warm-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl text-forest-600 mb-1">Save your trip</h2>
            <p className="font-body text-sm text-warm-500 mb-6">
              {authMode === 'register'
                ? 'Create a free account to save this trip and access it anytime'
                : 'Log in to save this trip to your account'
              }
            </p>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-body text-sm text-red-600 mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={authFirstName}
                    onChange={e => setAuthFirstName(e.target.value)}
                    className="bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    value={authLastName}
                    onChange={e => setAuthLastName(e.target.value)}
                    className="bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="Last name"
                  />
                </div>
              )}
              <input
                type="email"
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                placeholder="Email address"
                autoFocus
              />
              <input
                type="password"
                required
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                placeholder="Password"
              />
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 font-body text-base"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : authMode === 'register' ? (
                  'Create account & save'
                ) : (
                  'Log in & save'
                )}
              </Button>
            </form>

            <p className="font-body text-sm text-warm-500 text-center mt-4">
              {authMode === 'register' ? (
                <>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="text-forest-500 hover:underline font-medium">Log in</button></>
              ) : (
                <>Need an account? <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-forest-500 hover:underline font-medium">Register</button></>
              )}
            </p>

            <p className="font-body text-xs text-warm-400 text-center mt-4">
              Your trip selections won't be lost — keep building!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
