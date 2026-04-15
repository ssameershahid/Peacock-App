import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, Check, Car, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const HERO_DESTINATIONS = [
  { id: 'colombo', label: 'Colombo' },
  { id: 'kandy', label: 'Kandy' },
  { id: 'sigiriya', label: 'Sigiriya' },
  { id: 'galle', label: 'Galle' },
  { id: 'ella', label: 'Ella' },
  { id: 'yala', label: 'Yala' },
  { id: 'trincomalee', label: 'Trincomalee' },
  { id: 'nuwaraeliya', label: 'Nuwara Eliya' },
  { id: 'dambulla', label: 'Dambulla' },
  { id: 'mirissa', label: 'Mirissa' },
  { id: 'udawalawe', label: 'Udawalawe' },
  { id: 'anuradhapura', label: 'Anuradhapura' },
  { id: 'bentota', label: 'Bentota' },
  { id: 'jaffna', label: 'Jaffna' },
];

interface TravelerOption {
  id: string;
  label: string;
  description: string;
  range: string;
}

const TRAVELER_OPTIONS: TravelerOption[] = [
  { id: 'solo',        label: 'Just me',      description: 'Solo adventure',  range: '1'   },
  { id: 'couple',      label: 'Two people',   description: 'Perfect pair',    range: '2'   },
  { id: 'small-group', label: '2–4 people',   description: 'Small group',     range: '2-4' },
  { id: 'large-group', label: '5–7 people',   description: 'Larger party',    range: '5-7' },
  { id: 'xl-group',    label: '8+ people',    description: 'Large group',     range: '8+'  },
];

interface VehicleOption {
  id: string;
  label: string;
  model: string;
  capacity: string;
  image: string;
}

// IDs and images align with /public/vehicles/ assets and vehicles.json
const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'any',        label: 'Any vehicle',  model: "We'll recommend the best fit", capacity: '',           image: '' },
  { id: 'car',        label: 'Car / Sedan',  model: 'Toyota Prius',                 capacity: 'Up to 3 pax', image: '/vehicles/car-v2.png' },
  { id: 'minivan',    label: 'Minivan',      model: 'Toyota HiAce',                 capacity: 'Up to 6 pax', image: '/vehicles/minivan-v2.png' },
  { id: 'large-van',  label: 'Large Van',    model: 'Toyota HiAce HR',              capacity: 'Up to 10 pax', image: '/vehicles/large-van-v3.png' },
  { id: 'small-bus',  label: 'Small Bus',    model: 'Toyota Coaster',               capacity: 'Up to 20 pax', image: '/vehicles/small-bus-v2.png' },
  { id: 'medium-bus', label: 'Medium Bus',   model: 'King Long',                    capacity: 'Up to 35 pax', image: '/vehicles/medium-bus-v2.png' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DateRange { start: Date | null; end: Date | null; }
type DropdownId = 'where' | 'when' | 'who' | 'vehicle' | null;

/* ─── Dropdown content (shared between desktop & mobile) ────────────────── */

const WhereContent: React.FC<{
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}> = ({ selected, onToggle, onClear }) => (
  <div className="p-6">
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4">
      Choose your destinations
    </p>
    <div className="flex flex-wrap gap-2">
      {HERO_DESTINATIONS.map((dest) => {
        const isSelected = selected.includes(dest.id);
        return (
          <button
            key={dest.id}
            onClick={() => onToggle(dest.id)}
            className={cn(
              'px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 border cursor-pointer',
              isSelected
                ? 'bg-[#CCFFDE] text-[#14524C] border-[#CCFFDE] shadow-sm font-semibold'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50',
            )}
          >
            {dest.label}
          </button>
        );
      })}
    </div>
    {selected.length > 0 && (
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {selected.length} destination{selected.length > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClear}
          className="text-sm font-medium text-[#14524C] hover:underline cursor-pointer"
        >
          Clear all
        </button>
      </div>
    )}
  </div>
);

const WhenContent: React.FC<{
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
}> = ({ dateRange, onDateChange }) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const nights =
    dateRange.start && dateRange.end
      ? Math.ceil(
          (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDateClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day);
    if (clicked < today) return;
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      onDateChange({ start: clicked, end: null });
    } else {
      if (clicked < dateRange.start) onDateChange({ start: clicked, end: null });
      else if (isSameDay(clicked, dateRange.start)) onDateChange({ start: null, end: null });
      else onDateChange({ start: dateRange.start, end: clicked });
    }
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="h-10" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(viewYear, viewMonth, day);
    const isDisabled = cellDate < today;
    const isStart = dateRange.start ? isSameDay(cellDate, dateRange.start) : false;
    const isEnd = dateRange.end ? isSameDay(cellDate, dateRange.end) : false;
    const isInRange =
      dateRange.start && dateRange.end
        ? cellDate > dateRange.start && cellDate < dateRange.end
        : false;
    const isToday = isSameDay(cellDate, today);
    cells.push(
      <button
        key={day}
        disabled={isDisabled}
        onClick={() => handleDateClick(day)}
        className={cn(
          'h-10 w-full flex items-center justify-center text-[13px] rounded-full transition-all duration-150',
          isDisabled && 'text-gray-300 cursor-default',
          !isDisabled && !isStart && !isEnd && !isInRange &&
            'hover:bg-gray-100 cursor-pointer text-gray-700',
          isStart && 'bg-[#14524C] text-white font-semibold',
          isEnd && 'bg-[#14524C] text-white font-semibold',
          isInRange && 'bg-[#CCFFDE]/60 text-[#14524C] font-medium',
          isToday && !isStart && !isEnd && !isInRange && 'font-bold text-[#14524C]',
        )}
      >
        {day}
      </button>,
    );
  }

  return (
    <div className="p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4">
        Select travel dates
      </p>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-full transition-colors',
            canGoPrev ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-30 cursor-default',
          )}
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        <span className="text-[15px] font-semibold text-gray-800">
          {CALENDAR_MONTHS[viewMonth]}{' '}
          <span className="text-gray-400 font-normal">{viewYear}</span>
        </span>
        <button
          onClick={nextMonth}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(wd => (
          <div
            key={wd}
            className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">{cells}</div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onDateChange({ start: null, end: null })}
          className="text-sm font-medium text-[#14524C] hover:underline cursor-pointer"
        >
          Clear dates
        </button>
        {nights !== null && (
          <span className="text-sm text-gray-500 font-medium">
            {nights} night{nights > 1 ? 's' : ''}
          </span>
        )}
        {dateRange.start && !dateRange.end && (
          <span className="text-xs text-gray-400">Pick an end date</span>
        )}
      </div>
    </div>
  );
};

const WhoContent: React.FC<{
  selected: TravelerOption;
  onSelect: (option: TravelerOption) => void;
}> = ({ selected, onSelect }) => (
  <div className="p-4">
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3 px-2">
      How many travelers?
    </p>
    <div className="space-y-1">
      {TRAVELER_OPTIONS.map((option) => {
        const isActive = selected.id === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer',
              isActive ? 'bg-[#CCFFDE]' : 'hover:bg-gray-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
                  isActive ? 'bg-[#14524C] border-[#14524C]' : 'bg-white border-gray-300',
                )}
              >
                {isActive && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={cn('text-sm font-semibold', isActive ? 'text-[#14524C]' : 'text-gray-700')}>
                {option.label}
              </span>
            </div>
            <span className="text-xs text-gray-400">{option.description}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const VehicleContent: React.FC<{
  selected: VehicleOption;
  onSelect: (option: VehicleOption) => void;
}> = ({ selected, onSelect }) => (
  <div className="p-5">
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4 px-1">
      Choose your vehicle type
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {VEHICLE_OPTIONS.map((option) => {
        const isActive = selected.id === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className={cn(
              'flex flex-col items-start gap-1 px-3 py-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left',
              isActive
                ? 'bg-[#CCFFDE] border-[#14524C]/30 shadow-sm'
                : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50',
            )}
          >
            {/* Image / icon row */}
            <div className="flex items-start justify-between w-full mb-0.5">
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.label}
                  className="h-10 w-20 object-contain"
                />
              ) : (
                <div className="h-10 w-20 flex items-center">
                  <Car className="h-7 w-7 text-gray-300" />
                </div>
              )}
              {isActive && (
                <div className="h-4 w-4 rounded-full bg-[#14524C] flex items-center justify-center shrink-0 mt-1">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
            <span
              className={cn(
                'text-[13px] font-semibold leading-tight',
                isActive ? 'text-[#14524C]' : 'text-gray-800',
              )}
            >
              {option.label}
            </span>
            <span className={cn('text-[11px] leading-tight', isActive ? 'text-[#14524C]/60' : 'text-gray-400')}>
              {option.model}
            </span>
            {option.capacity && (
              <span className="text-[11px] font-medium text-gray-500 leading-tight">
                {option.capacity}
              </span>
            )}
          </button>
        );
      })}
    </div>
    <p className="text-[11px] text-gray-400 mt-4 px-1">
      Vehicle availability is confirmed at booking. Our team selects the best match for your group size.
    </p>
  </div>
);

/* ─── Desktop portal dropdown ───────────────────────────────────────────── */

function useDropdownStyle(
  triggerRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
  preferredWidth: number,
) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const compute = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const w = Math.min(preferredWidth, vw - 16);
    let left = rect.left;
    if (left + w > vw - 8) left = vw - w - 8;
    left = Math.max(8, left);
    setStyle({ top: rect.bottom + 8, left, width: w });
  }, [triggerRef, preferredWidth]);

  useEffect(() => {
    if (!isOpen) return;
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [isOpen, compute]);

  return style;
}

const DesktopDropdown: React.FC<{
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  preferredWidth: number;
  children: React.ReactNode;
}> = ({ isOpen, triggerRef, preferredWidth, children }) => {
  const posStyle = useDropdownStyle(triggerRef, isOpen, preferredWidth);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-peacock-dropdown="true"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          style={{
            position: 'fixed',
            zIndex: 99999,
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(40px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
            boxShadow: '0 24px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            ...posStyle,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* ─── Mobile bottom sheet ─────────────────────────────────────────────────── */

const MobileBottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 99998,
            }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              backgroundColor: 'white',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 99999,
              maxHeight: '88vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */

const TripSearchHero: React.FC = () => {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [travelerOption, setTravelerOption] = useState<TravelerOption>(TRAVELER_OPTIONS[1]);
  const [vehicleOption, setVehicleOption] = useState<VehicleOption>(VEHICLE_OPTIONS[0]);

  // Trigger refs for desktop dropdown positioning
  const whereRef = useRef<HTMLDivElement>(null);
  const whenRef = useRef<HTMLDivElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: DropdownId) => {
    setOpenDropdown(prev => (prev === id ? null : id));
  }, []);

  // Close on outside click (desktop portals escape the DOM tree, so we use data attr)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (containerRef.current?.contains(target)) return;
      if (target.closest('[data-peacock-dropdown]')) return;
      setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenDropdown(null); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const whereText = useMemo(() => {
    if (selectedDestinations.length === 0) return 'Sri Lanka';
    const first = HERO_DESTINATIONS.find(d => d.id === selectedDestinations[0])?.label;
    if (selectedDestinations.length === 1) return first;
    return `${first} +${selectedDestinations.length - 1}`;
  }, [selectedDestinations]);

  const whenText = useMemo(() => {
    if (!dateRange.start) return 'Anytime';
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (!dateRange.end) return fmt(dateRange.start);
    return `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`;
  }, [dateRange]);

  const handleStartPlanning = () => {
    const params = new URLSearchParams();
    if (selectedDestinations.length > 0) params.set('destinations', selectedDestinations.join(','));
    if (dateRange.start) params.set('startDate', dateRange.start.toISOString().split('T')[0]);
    if (dateRange.end) params.set('endDate', dateRange.end.toISOString().split('T')[0]);
    params.set('travelers', travelerOption.range);
    if (vehicleOption.id !== 'any') params.set('vehicle', vehicleOption.id);
    const qs = params.toString();
    setLocation(`/tours/custom${qs ? '?' + qs : ''}`);
  };

  const pillClass = (id: DropdownId) =>
    cn(
      'flex-1 px-5 py-3 border-r border-white/20 last:border-r-0 rounded-full transition-colors cursor-pointer group focus:outline-none',
      openDropdown === id ? 'bg-white/20' : 'hover:bg-white/10',
    );

  const handleDestinationToggle = useCallback(
    (id: string) =>
      setSelectedDestinations(prev =>
        prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id],
      ),
    [],
  );

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">

      {/* ── Desktop search pill ──────────────────────────────────────────── */}
      <div className="hidden md:flex bg-white/15 backdrop-blur-xl rounded-full shadow-2xl p-2 items-center animate-in slide-in-from-bottom-8 duration-700 delay-300 border border-white/30 ring-1 ring-white/10">

        {/* WHERE */}
        <div
          ref={whereRef}
          role="button" tabIndex={0}
          aria-expanded={openDropdown === 'where'}
          onClick={() => toggle('where')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('where'); } }}
          className={pillClass('where')}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <MapPin className="h-3.5 w-3.5 text-white/60" />
            <span className={cn('text-[10px] font-bold uppercase tracking-widest transition-colors', openDropdown === 'where' ? 'text-white' : 'text-white/55 group-hover:text-white')}>Where</span>
          </div>
          <div className="text-[15px] font-display font-normal text-white drop-shadow-sm truncate">{whereText}</div>
        </div>

        {/* WHEN */}
        <div
          ref={whenRef}
          role="button" tabIndex={0}
          aria-expanded={openDropdown === 'when'}
          onClick={() => toggle('when')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('when'); } }}
          className={pillClass('when')}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Calendar className="h-3.5 w-3.5 text-white/60" />
            <span className={cn('text-[10px] font-bold uppercase tracking-widest transition-colors', openDropdown === 'when' ? 'text-white' : 'text-white/55 group-hover:text-white')}>When</span>
          </div>
          <div className="text-[15px] font-display font-normal text-white drop-shadow-sm">{whenText}</div>
        </div>

        {/* WHO */}
        <div
          ref={whoRef}
          role="button" tabIndex={0}
          aria-expanded={openDropdown === 'who'}
          onClick={() => toggle('who')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('who'); } }}
          className={pillClass('who')}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="h-3.5 w-3.5 text-white/60" />
            <span className={cn('text-[10px] font-bold uppercase tracking-widest transition-colors', openDropdown === 'who' ? 'text-white' : 'text-white/55 group-hover:text-white')}>Who</span>
          </div>
          <div className="text-[15px] font-display font-normal text-white drop-shadow-sm">{travelerOption.label}</div>
        </div>

        {/* VEHICLE */}
        <div
          ref={vehicleRef}
          role="button" tabIndex={0}
          aria-expanded={openDropdown === 'vehicle'}
          onClick={() => toggle('vehicle')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('vehicle'); } }}
          className={pillClass('vehicle')}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Car className="h-3.5 w-3.5 text-white/60" />
            <span className={cn('text-[10px] font-bold uppercase tracking-widest transition-colors', openDropdown === 'vehicle' ? 'text-white' : 'text-white/55 group-hover:text-white')}>Vehicle</span>
          </div>
          <div className="text-[15px] font-display font-normal text-white drop-shadow-sm flex items-center gap-2">
            {vehicleOption.image && (
              <img src={vehicleOption.image} alt="" className="h-4 w-8 object-contain opacity-90" />
            )}
            <span>{vehicleOption.id === 'any' ? 'Any type' : vehicleOption.label}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pl-1 shrink-0">
          <Button
            size="lg"
            className="rounded-full h-12 px-7 text-base font-bold shadow-lg bg-accent hover:bg-accent/90 text-[#1A1917] transition-all duration-200"
            onClick={handleStartPlanning}
          >
            Start Planning
          </Button>
        </div>
      </div>

      {/* ── Mobile search card ───────────────────────────────────────────── */}
      <div className="md:hidden animate-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="bg-white/12 backdrop-blur-xl rounded-3xl border border-white/25 shadow-2xl overflow-hidden">

          <button
            onClick={() => toggle('where')}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/12 active:bg-white/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-0.5">Where</div>
              <div className="text-[15px] font-medium text-white truncate">{whereText}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/35 shrink-0" />
          </button>

          <button
            onClick={() => toggle('when')}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/12 active:bg-white/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-0.5">When</div>
              <div className="text-[15px] font-medium text-white truncate">{whenText}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/35 shrink-0" />
          </button>

          <button
            onClick={() => toggle('who')}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/12 active:bg-white/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-0.5">Who</div>
              <div className="text-[15px] font-medium text-white truncate">{travelerOption.label}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/35 shrink-0" />
          </button>

          <button
            onClick={() => toggle('vehicle')}
            className="w-full flex items-center gap-4 px-5 py-4 active:bg-white/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              {vehicleOption.image ? (
                <img src={vehicleOption.image} alt="" className="h-5 w-5 object-contain" />
              ) : (
                <Car className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-0.5">Vehicle</div>
              <div className="text-[15px] font-medium text-white truncate">
                {vehicleOption.id === 'any' ? 'Any type' : vehicleOption.label}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/35 shrink-0" />
          </button>
        </div>

        <Button
          size="lg"
          className="w-full mt-3 rounded-2xl h-14 text-lg font-bold shadow-lg bg-accent hover:bg-accent/90 text-[#1A1917] transition-all duration-200"
          onClick={handleStartPlanning}
        >
          Start Planning
        </Button>
      </div>

      {/* ── Desktop portal dropdowns (escape stacking context via portal) ── */}
      {!isMobile && (
        <>
          <DesktopDropdown isOpen={openDropdown === 'where'} triggerRef={whereRef as React.RefObject<HTMLElement>} preferredWidth={560}>
            <WhereContent
              selected={selectedDestinations}
              onToggle={handleDestinationToggle}
              onClear={() => setSelectedDestinations([])}
            />
          </DesktopDropdown>

          <DesktopDropdown isOpen={openDropdown === 'when'} triggerRef={whenRef as React.RefObject<HTMLElement>} preferredWidth={364}>
            <WhenContent dateRange={dateRange} onDateChange={setDateRange} />
          </DesktopDropdown>

          <DesktopDropdown isOpen={openDropdown === 'who'} triggerRef={whoRef as React.RefObject<HTMLElement>} preferredWidth={380}>
            <WhoContent
              selected={travelerOption}
              onSelect={opt => { setTravelerOption(opt); setTimeout(() => setOpenDropdown(null), 120); }}
            />
          </DesktopDropdown>

          <DesktopDropdown isOpen={openDropdown === 'vehicle'} triggerRef={vehicleRef as React.RefObject<HTMLElement>} preferredWidth={580}>
            <VehicleContent
              selected={vehicleOption}
              onSelect={opt => { setVehicleOption(opt); setTimeout(() => setOpenDropdown(null), 120); }}
            />
          </DesktopDropdown>
        </>
      )}

      {/* ── Mobile bottom sheets ─────────────────────────────────────────── */}
      {isMobile && (
        <>
          <MobileBottomSheet
            isOpen={openDropdown === 'where'}
            onClose={() => setOpenDropdown(null)}
            title="Choose destinations"
          >
            <WhereContent
              selected={selectedDestinations}
              onToggle={handleDestinationToggle}
              onClear={() => setSelectedDestinations([])}
            />
            <div className="px-5 pb-8 pt-2">
              <Button className="w-full rounded-2xl h-12 font-semibold" onClick={() => setOpenDropdown(null)}>
                Done
              </Button>
            </div>
          </MobileBottomSheet>

          <MobileBottomSheet
            isOpen={openDropdown === 'when'}
            onClose={() => setOpenDropdown(null)}
            title="Select travel dates"
          >
            <WhenContent dateRange={dateRange} onDateChange={setDateRange} />
            <div className="px-5 pb-8 pt-2">
              <Button className="w-full rounded-2xl h-12 font-semibold" onClick={() => setOpenDropdown(null)}>
                Done
              </Button>
            </div>
          </MobileBottomSheet>

          <MobileBottomSheet
            isOpen={openDropdown === 'who'}
            onClose={() => setOpenDropdown(null)}
            title="How many travelers?"
          >
            <WhoContent
              selected={travelerOption}
              onSelect={opt => { setTravelerOption(opt); setOpenDropdown(null); }}
            />
          </MobileBottomSheet>

          <MobileBottomSheet
            isOpen={openDropdown === 'vehicle'}
            onClose={() => setOpenDropdown(null)}
            title="Choose your vehicle"
          >
            <VehicleContent
              selected={vehicleOption}
              onSelect={opt => { setVehicleOption(opt); setOpenDropdown(null); }}
            />
          </MobileBottomSheet>
        </>
      )}
    </div>
  );
};

export default TripSearchHero;
