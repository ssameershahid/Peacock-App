import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, Check, Car } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'solo', label: 'Just me', description: 'Solo adventure', range: '1' },
  { id: 'couple', label: 'Two people', description: 'Perfect pair', range: '2' },
  { id: 'small-group', label: '2–4 people', description: 'Small group', range: '2-4' },
  { id: 'large-group', label: '5–7 people', description: 'Larger party', range: '5-7' },
];

interface VehicleOption {
  id: string;
  label: string;
  description: string;
  capacity: string;
  emoji: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'any', label: 'Any vehicle', description: 'We\'ll recommend the best fit', capacity: '', emoji: '🚗' },
  { id: 'sedan', label: 'Sedan', description: 'Ideal for couples & solo', capacity: 'Up to 3 pax', emoji: '🚙' },
  { id: 'suv', label: 'SUV / 4×4', description: 'Comfort for small groups', capacity: 'Up to 5 pax', emoji: '🛻' },
  { id: 'van', label: 'Van / Minivan', description: 'Spacious for families', capacity: 'Up to 8 pax', emoji: '🚐' },
  { id: 'minibus', label: 'Minibus', description: 'Great for larger groups', capacity: 'Up to 14 pax', emoji: '🚌' },
  { id: 'luxury', label: 'Luxury', description: 'Premium travel experience', capacity: 'Up to 4 pax', emoji: '✨' },
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
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const dropdownVariants = {
  initial: { opacity: 0, scale: 0.96, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
  exit: { opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.15 } },
};

interface DateRange { start: Date | null; end: Date | null; }

const WhereDropdown: React.FC<{ selected: string[]; onToggle: (id: string) => void; onClear: () => void; }> = ({ selected, onToggle, onClear }) => (
  <motion.div key="where-dropdown" variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
    className="absolute top-full left-0 right-0 mt-3 z-50 rounded-3xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px) saturate(1.6)', boxShadow: '0 24px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6)' }}
  >
    <div className="p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4">Choose your destinations</p>
      <div className="flex flex-wrap gap-2">
        {HERO_DESTINATIONS.map((dest) => {
          const isSelected = selected.includes(dest.id);
          return (
            <button key={dest.id} onClick={() => onToggle(dest.id)}
              className={cn('px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 border cursor-pointer',
                isSelected ? 'bg-[#CCFFDE] text-[#14524C] border-[#CCFFDE] shadow-sm font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              )}>{dest.label}</button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">{selected.length} destination{selected.length > 1 ? 's' : ''} selected</span>
          <button onClick={onClear} className="text-sm font-medium text-[#14524C] hover:underline cursor-pointer">Clear all</button>
        </div>
      )}
    </div>
  </motion.div>
);

const WhenDropdown: React.FC<{ dateRange: DateRange; onDateChange: (range: DateRange) => void; }> = ({ dateRange, onDateChange }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };
  const handleDateClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day);
    if (clicked < today) return;
    if (!dateRange.start || (dateRange.start && dateRange.end)) { onDateChange({ start: clicked, end: null }); }
    else { if (clicked < dateRange.start) onDateChange({ start: clicked, end: null }); else if (isSameDay(clicked, dateRange.start)) onDateChange({ start: null, end: null }); else onDateChange({ start: dateRange.start, end: clicked }); }
  };
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const nights = dateRange.start && dateRange.end ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="h-10" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(viewYear, viewMonth, day);
    const isDisabled = cellDate < today;
    const isStart = dateRange.start ? isSameDay(cellDate, dateRange.start) : false;
    const isEnd = dateRange.end ? isSameDay(cellDate, dateRange.end) : false;
    const isInRange = dateRange.start && dateRange.end ? cellDate > dateRange.start && cellDate < dateRange.end : false;
    const isToday = isSameDay(cellDate, today);
    cells.push(
      <button key={day} disabled={isDisabled} onClick={() => handleDateClick(day)}
        className={cn('h-10 w-full flex items-center justify-center text-[13px] rounded-full transition-all duration-150',
          isDisabled && 'text-gray-300 cursor-default',
          !isDisabled && !isStart && !isEnd && !isInRange && 'hover:bg-gray-100 cursor-pointer text-gray-700',
          isStart && 'bg-[#14524C] text-white font-semibold',
          isEnd && 'bg-[#14524C] text-white font-semibold',
          isInRange && 'bg-[#CCFFDE]/60 text-[#14524C] font-medium',
          isToday && !isStart && !isEnd && !isInRange && 'font-bold text-[#14524C]'
        )}>{day}</button>
    );
  }
  return (
    <motion.div key="when-dropdown" variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
      className="absolute top-full left-0 right-0 mt-3 z-50 rounded-3xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px) saturate(1.6)', boxShadow: '0 24px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6)' }}
    >
      <div className="p-6 max-w-sm mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4">Select travel dates</p>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} disabled={!canGoPrev} className={cn('h-8 w-8 flex items-center justify-center rounded-full transition-colors', canGoPrev ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-30 cursor-default')}>
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <span className="text-[15px] font-semibold text-gray-800">{CALENDAR_MONTHS[viewMonth]} <span className="text-gray-400 font-normal">{viewYear}</span></span>
          <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(wd => <div key={wd} className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{wd}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">{cells}</div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => onDateChange({ start: null, end: null })} className="text-sm font-medium text-[#14524C] hover:underline cursor-pointer">Clear dates</button>
          {nights !== null && <span className="text-sm text-gray-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</span>}
          {dateRange.start && !dateRange.end && <span className="text-xs text-gray-400">Pick an end date</span>}
        </div>
      </div>
    </motion.div>
  );
};

const WhoDropdown: React.FC<{ selected: TravelerOption; onSelect: (option: TravelerOption) => void; }> = ({ selected, onSelect }) => (
  <motion.div key="who-dropdown" variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
    className="absolute top-full left-0 right-0 mt-3 z-50 rounded-3xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px) saturate(1.6)', boxShadow: '0 24px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6)' }}
  >
    <div className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3 px-2">How many travelers?</p>
      <div className="space-y-1">
        {TRAVELER_OPTIONS.map((option) => {
          const isActive = selected.id === option.id;
          return (
            <button key={option.id} onClick={() => onSelect(option)}
              className={cn('w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer', isActive ? 'bg-[#CCFFDE]' : 'hover:bg-gray-50')}
            >
              <div className="flex items-center gap-3">
                <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0', isActive ? 'bg-[#14524C] border-[#14524C]' : 'bg-white border-gray-300')}>
                  {isActive && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={cn('text-sm font-semibold', isActive ? 'text-[#14524C]' : 'text-gray-700')}>{option.label}</span>
              </div>
              <span className="text-xs text-gray-400">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  </motion.div>
);

const VehicleDropdown: React.FC<{ selected: VehicleOption; onSelect: (option: VehicleOption) => void; }> = ({ selected, onSelect }) => (
  <motion.div key="vehicle-dropdown" variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
    className="absolute top-full left-0 right-0 mt-3 z-50 rounded-3xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(40px) saturate(1.6)', boxShadow: '0 24px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6)' }}
  >
    <div className="p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-4 px-1">Choose your vehicle type</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {VEHICLE_OPTIONS.map((option) => {
          const isActive = selected.id === option.id;
          return (
            <button key={option.id} onClick={() => onSelect(option)}
              className={cn(
                'flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left',
                isActive
                  ? 'bg-[#CCFFDE] border-[#14524C]/30 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl leading-none">{option.emoji}</span>
                {isActive && (
                  <div className="h-4 w-4 rounded-full bg-[#14524C] flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <span className={cn('text-[13px] font-semibold leading-tight', isActive ? 'text-[#14524C]' : 'text-gray-800')}>{option.label}</span>
              {option.capacity && (
                <span className="text-[11px] text-gray-400 leading-tight">{option.capacity}</span>
              )}
              <span className={cn('text-[11px] leading-tight', isActive ? 'text-[#14524C]/70' : 'text-gray-400')}>{option.description}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-4 px-1">Vehicle availability is confirmed at booking. Our team selects the best match for your group size.</p>
    </div>
  </motion.div>
);

type DropdownId = 'where' | 'when' | 'who' | 'vehicle' | null;

const TripSearchHero = () => {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [travelerOption, setTravelerOption] = useState<TravelerOption>(TRAVELER_OPTIONS[1]);
  const [vehicleOption, setVehicleOption] = useState<VehicleOption>(VEHICLE_OPTIONS[0]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenDropdown(null); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggle = (id: DropdownId) => setOpenDropdown(prev => prev === id ? null : id);

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

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto relative">
      <div className="bg-white/15 backdrop-blur-xl rounded-3xl md:rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2 animate-in slide-in-from-bottom-8 duration-700 delay-300 border border-white/30 ring-1 ring-white/10">
        {/* WHERE */}
        <div role="button" tabIndex={0} aria-expanded={openDropdown === 'where'} onClick={() => toggle('where')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('where'); } }}
          className={cn('flex-1 w-full md:w-auto px-6 py-3 border-b md:border-b-0 md:border-r border-white/20 rounded-3xl transition-colors cursor-pointer group', openDropdown === 'where' ? 'bg-white/20' : 'hover:bg-white/10')}
        >
          <div className="flex items-center gap-3 mb-1"><MapPin className="h-4 w-4 text-white/70" /><span className={cn('text-xs font-bold uppercase tracking-widest transition-colors', openDropdown === 'where' ? 'text-white' : 'text-white/60 group-hover:text-white')}>Where</span></div>
          <div className="text-lg font-display font-normal text-white drop-shadow-sm">{whereText}</div>
        </div>
        {/* WHEN */}
        <div role="button" tabIndex={0} aria-expanded={openDropdown === 'when'} onClick={() => toggle('when')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('when'); } }}
          className={cn('flex-1 w-full md:w-auto px-6 py-3 border-b md:border-b-0 md:border-r border-white/20 rounded-3xl transition-colors cursor-pointer group', openDropdown === 'when' ? 'bg-white/20' : 'hover:bg-white/10')}
        >
          <div className="flex items-center gap-3 mb-1"><Calendar className="h-4 w-4 text-white/70" /><span className={cn('text-xs font-bold uppercase tracking-widest transition-colors', openDropdown === 'when' ? 'text-white' : 'text-white/60 group-hover:text-white')}>When</span></div>
          <div className="text-lg font-display font-normal text-white drop-shadow-sm">{whenText}</div>
        </div>
        {/* WHO */}
        <div role="button" tabIndex={0} aria-expanded={openDropdown === 'who'} onClick={() => toggle('who')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('who'); } }}
          className={cn('flex-1 w-full md:w-auto px-6 py-3 border-b md:border-b-0 md:border-r border-white/20 rounded-3xl transition-colors cursor-pointer group', openDropdown === 'who' ? 'bg-white/20' : 'hover:bg-white/10')}
        >
          <div className="flex items-center gap-3 mb-1"><Users className="h-4 w-4 text-white/70" /><span className={cn('text-xs font-bold uppercase tracking-widest transition-colors', openDropdown === 'who' ? 'text-white' : 'text-white/60 group-hover:text-white')}>Who</span></div>
          <div className="text-lg font-display font-normal text-white drop-shadow-sm">{travelerOption.label}</div>
        </div>
        {/* VEHICLE */}
        <div role="button" tabIndex={0} aria-expanded={openDropdown === 'vehicle'} onClick={() => toggle('vehicle')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('vehicle'); } }}
          className={cn('flex-1 w-full md:w-auto px-6 py-3 rounded-3xl transition-colors cursor-pointer group', openDropdown === 'vehicle' ? 'bg-white/20' : 'hover:bg-white/10')}
        >
          <div className="flex items-center gap-3 mb-1"><Car className="h-4 w-4 text-white/70" /><span className={cn('text-xs font-bold uppercase tracking-widest transition-colors', openDropdown === 'vehicle' ? 'text-white' : 'text-white/60 group-hover:text-white')}>Vehicle</span></div>
          <div className="text-lg font-display font-normal text-white drop-shadow-sm flex items-center gap-1.5">
            <span>{vehicleOption.emoji}</span>
            <span>{vehicleOption.id === 'any' ? 'Any type' : vehicleOption.label}</span>
          </div>
        </div>
        {/* ACTION */}
        <div className="p-1 w-full md:w-auto">
          <Button size="lg" className="w-full md:w-auto rounded-full h-14 px-8 text-lg font-bold shadow-lg bg-accent hover:bg-accent/90 text-[#1A1917] transition-all duration-200" onClick={handleStartPlanning}>
            Start Planning
          </Button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {openDropdown === 'where' && <WhereDropdown selected={selectedDestinations} onToggle={id => setSelectedDestinations(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])} onClear={() => setSelectedDestinations([])} />}
        {openDropdown === 'when' && <WhenDropdown dateRange={dateRange} onDateChange={setDateRange} />}
        {openDropdown === 'who' && <WhoDropdown selected={travelerOption} onSelect={opt => { setTravelerOption(opt); setTimeout(() => setOpenDropdown(null), 150); }} />}
        {openDropdown === 'vehicle' && <VehicleDropdown selected={vehicleOption} onSelect={opt => { setVehicleOption(opt); setTimeout(() => setOpenDropdown(null), 150); }} />}
      </AnimatePresence>
    </div>
  );
};

export default TripSearchHero;
