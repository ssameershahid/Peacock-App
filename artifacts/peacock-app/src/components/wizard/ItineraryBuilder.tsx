import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, ChevronDown, ArrowRight, Search, Info } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DestInfo {
  id: string;
  name: string;
  desc: string;
  lat: number;
  lng: number;
}

export interface ItineraryDay {
  id: string;
  to: string;
  toId: string;
}

// Airport is a special start location not in the main DESTINATIONS list
const AIRPORT: DestInfo = {
  id: 'airport',
  name: 'Airport (BIA)',
  desc: 'Bandaranaike International Airport',
  lat: 7.1807,
  lng: 79.8842,
};

// ── Haversine distance ─────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ── DestPreviewPopup ──────────────────────────────────────────────────────────

function DestPreviewPopup({ dest, onClose }: { dest: DestInfo; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    // slight delay so the same click that opens doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-50 w-56 bg-white rounded-2xl border border-warm-200 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 pr-2">
          <p className="font-display text-sm text-forest-600">{dest.name}</p>
          <p className="font-body text-[11px] text-warm-400 mt-0.5">{dest.desc}</p>
        </div>
        <button type="button" onClick={onClose} className="text-warm-300 hover:text-warm-500 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="bg-warm-50 rounded-xl p-2 mb-3">
        <p className="font-body text-[10px] text-warm-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-forest-400 shrink-0" />
          {dest.lat.toFixed(3)}°N, {dest.lng.toFixed(3)}°E
        </p>
      </div>
      <a
        href={`/destinations#${dest.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-body text-[11px] text-forest-500 hover:text-forest-700 font-medium transition-colors"
      >
        View full details <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  );
}

// ── LocationPickerDropdown ─────────────────────────────────────────────────────

function LocationPickerDropdown({
  value,
  valueId,
  placeholder,
  refLat,
  refLng,
  pickerDests,
  onSelect,
  onClose,
}: {
  value: string;
  valueId: string;
  placeholder: string;
  refLat?: number;
  refLng?: number;
  pickerDests: DestInfo[];
  onSelect: (name: string, id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = pickerDests.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className="mt-2 bg-white rounded-2xl border border-warm-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Search bar */}
      <div className="p-3 border-b border-warm-100">
        <div className="flex items-center gap-2 bg-warm-50 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-warm-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent font-body text-sm text-forest-600 outline-none placeholder:text-warm-400"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-warm-300 hover:text-warm-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Destination chips */}
      <div className="p-3 max-h-[260px] overflow-y-auto">
        {refLat !== undefined && refLng !== undefined && (
          <p className="font-body text-[10px] text-warm-400 mb-2">
            Distances shown from previous location
          </p>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map(d => {
            const isSelected = d.id === valueId || d.name === value;
            const distKm =
              refLat !== undefined && refLng !== undefined
                ? haversineKm(refLat, refLng, d.lat, d.lng)
                : null;
            return (
              <div key={d.id} className="relative">
                <button
                  type="button"
                  onClick={() => { onSelect(d.name, d.id); onClose(); }}
                  className={`w-full text-left p-2.5 pr-7 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-forest-400 bg-forest-50'
                      : 'border-warm-100 hover:border-forest-300 hover:bg-warm-50'
                  }`}
                >
                  <p className="font-body text-sm font-medium text-forest-600 leading-tight">{d.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="font-body text-[10px] text-warm-400 leading-tight truncate flex-1">{d.desc}</p>
                    {distKm !== null && distKm > 0 && (
                      <span className="font-body text-[10px] text-amber-600 font-medium shrink-0">
                        {distKm}km
                      </span>
                    )}
                  </div>
                </button>

                {/* Info button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setPreviewId(prev => (prev === d.id ? null : d.id));
                  }}
                  className="absolute top-2 right-1.5 w-5 h-5 rounded-full bg-warm-100 hover:bg-forest-100 flex items-center justify-center transition-colors"
                >
                  <Info className="w-2.5 h-2.5 text-warm-500" />
                </button>

                {previewId === d.id && (
                  <DestPreviewPopup dest={d} onClose={() => setPreviewId(null)} />
                )}
              </div>
            );
          })}
        </div>

        {/* Custom text entry when search doesn't match any known destination */}
        {search && !filtered.some(d => d.name.toLowerCase() === search.toLowerCase()) && (
          <button
            type="button"
            onClick={() => { onSelect(search, ''); onClose(); }}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-warm-300 hover:border-forest-400 hover:bg-forest-50 text-left transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-warm-400 shrink-0" />
            <span className="font-body text-sm text-warm-600">
              Use "<strong className="text-forest-600">{search}</strong>"
            </span>
          </button>
        )}

        {filtered.length === 0 && !search && (
          <p className="font-body text-xs text-warm-400 text-center py-4">No destinations found</p>
        )}
      </div>
    </div>
  );
}

// ── DayRow ────────────────────────────────────────────────────────────────────

interface DayRowProps {
  dayNumber: number;
  fromLabel: string;
  toLabel: string;
  expanded: boolean;
  isDay1: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onExpand: () => void;
  onRemove: () => void;
  onPickerOpen: (field: 'from' | 'to') => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}

function DayRow({
  dayNumber, fromLabel, toLabel, expanded, isDay1,
  isDragging, isDragOver,
  onExpand, onRemove, onPickerOpen,
  onDragStart, onDragOver, onDragEnd, onDrop,
}: DayRowProps) {
  const title = toLabel
    ? `${fromLabel || '?'} to ${toLabel}`
    : fromLabel
    ? `${fromLabel} → ?`
    : `Day ${dayNumber}`;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`rounded-2xl border-2 bg-white transition-all duration-200 ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-warm-200'
          : isDragOver
          ? 'border-forest-400 bg-forest-50 shadow-lg'
          : 'border-warm-200 hover:border-warm-300'
      }`}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={onExpand}>
        {/* Drag handle — 6-dot grid */}
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-[3px]">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-warm-600" />
            ))}
          </div>
        </div>

        {/* Day number badge */}
        <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center font-body text-sm font-semibold text-forest-600 shrink-0">
          {dayNumber}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className={`font-display text-[15px] leading-snug ${toLabel ? 'text-forest-600' : 'text-warm-400 italic'}`}>
            {title}
          </p>
          {toLabel && (
            <p className="font-body text-xs text-warm-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {toLabel}
            </p>
          )}
        </div>

        {/* Remove + chevron */}
        <div className="flex items-center gap-1 shrink-0">
          {!isDay1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-warm-300 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-warm-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded: from / to fields */}
      {expanded && (
        <div className="border-t border-warm-100 px-4 pb-4 pt-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
          {/* FROM */}
          <div>
            <p className="font-body text-[11px] text-warm-400 font-medium mb-1.5 uppercase tracking-wide">
              From
            </p>
            <button
              type="button"
              onClick={() => isDay1 && onPickerOpen('from')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 border rounded-xl text-left font-body text-sm transition-all ${
                isDay1
                  ? 'border-warm-200 hover:border-forest-400 bg-white cursor-pointer'
                  : 'border-warm-100 bg-warm-50 cursor-default'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className={fromLabel ? 'text-forest-600' : 'text-warm-400'}>
                {fromLabel || (isDay1 ? 'Select start location' : 'Auto-filled from previous day')}
              </span>
              {isDay1 && !fromLabel && (
                <span className="ml-auto text-xs text-forest-500 font-medium">Tap to set</span>
              )}
            </button>
          </div>

          {/* TO */}
          <div>
            <p className="font-body text-[11px] text-warm-400 font-medium mb-1.5 uppercase tracking-wide">
              To
            </p>
            <button
              type="button"
              onClick={() => onPickerOpen('to')}
              className="w-full flex items-center gap-2.5 px-4 py-3 border border-warm-200 hover:border-forest-400 rounded-xl text-left bg-white font-body text-sm cursor-pointer transition-all"
            >
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className={toLabel ? 'text-forest-600' : 'text-warm-400'}>
                {toLabel || 'Select destination'}
              </span>
              {!toLabel && (
                <span className="ml-auto text-xs text-forest-500 font-medium">Tap to set</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ItineraryBuilder (exported) ───────────────────────────────────────────────

interface ItineraryBuilderProps {
  startFrom: string;
  startFromId: string;
  itinerary: ItineraryDay[];
  knownDestinations: DestInfo[];
  onChange: (itinerary: ItineraryDay[], startFrom: string, startFromId: string) => void;
}

export function ItineraryBuilder({
  startFrom,
  startFromId,
  itinerary,
  knownDestinations,
  onChange,
}: ItineraryBuilderProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [pickerField, setPickerField] = useState<'from' | 'to'>('to');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Airport prepended to all known destinations for the picker
  const allDests: DestInfo[] = [AIRPORT, ...knownDestinations];

  // Derived: FROM label for each day — chained from previous TO
  const fromLabels = [startFrom, ...itinerary.slice(0, -1).map(d => d.to)];

  // Reference coords for distance display in picker (= the FROM of the day being edited)
  function getRefCoords(dayIdx: number, field: 'from' | 'to'): { lat: number; lng: number } | null {
    if (field === 'from') return null; // no reference for the very first from
    const refId = dayIdx === 0 ? startFromId : (itinerary[dayIdx - 1]?.toId ?? '');
    if (!refId) return null;
    const d = allDests.find(x => x.id === refId);
    return d ? { lat: d.lat, lng: d.lng } : null;
  }

  function openPicker(dayIdx: number, field: 'from' | 'to') {
    setPickerDay(dayIdx);
    setPickerField(field);
    setExpandedDay(dayIdx);
  }

  function handleSelect(name: string, id: string) {
    if (pickerField === 'from' && pickerDay === 0) {
      onChange(itinerary, name, id);
    } else if (pickerField === 'to' && pickerDay !== null) {
      const next = itinerary.map((d, i) =>
        i === pickerDay ? { ...d, to: name, toId: id } : d
      );
      onChange(next, startFrom, startFromId);
    }
    setPickerDay(null);
  }

  function addDay() {
    const newDay: ItineraryDay = {
      id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      to: '',
      toId: '',
    };
    const next = [...itinerary, newDay];
    onChange(next, startFrom, startFromId);
    const newIdx = next.length - 1;
    setExpandedDay(newIdx);
    setPickerDay(newIdx);
    setPickerField('to');
  }

  function removeDay(i: number) {
    const next = itinerary.filter((_, idx) => idx !== i);
    onChange(next, startFrom, startFromId);
    if (expandedDay === i) { setExpandedDay(null); setPickerDay(null); }
  }

  function handleDrop(dropIdx: number) {
    if (dragIndex === null || dragIndex === dropIdx) {
      setDragIndex(null); setDropIndex(null);
      return;
    }
    const next = [...itinerary];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIdx, 0, moved);
    onChange(next, startFrom, startFromId);
    setDragIndex(null); setDropIndex(null);
    setExpandedDay(null); setPickerDay(null);
  }

  const refCoords = pickerDay !== null ? getRefCoords(pickerDay, pickerField) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-xs uppercase tracking-wider text-warm-400 font-medium">
          Your itinerary
        </p>
        {itinerary.length > 0 && (
          <span className="font-body text-xs font-medium text-forest-500 bg-sage px-3 py-1 rounded-full">
            {itinerary.length} day{itinerary.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {itinerary.map((day, i) => (
          <div key={day.id}>
            <DayRow
              dayNumber={i + 1}
              fromLabel={fromLabels[i] ?? ''}
              toLabel={day.to}
              expanded={expandedDay === i}
              isDay1={i === 0}
              isDragging={dragIndex === i}
              isDragOver={dropIndex === i && dragIndex !== i}
              onExpand={() => {
                if (expandedDay === i) { setExpandedDay(null); setPickerDay(null); }
                else { setExpandedDay(i); setPickerDay(null); }
              }}
              onRemove={() => removeDay(i)}
              onPickerOpen={field => openPicker(i, field)}
              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIndex(i); }}
              onDragOver={e => { e.preventDefault(); setDropIndex(i); }}
              onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
              onDrop={e => { e.preventDefault(); handleDrop(i); }}
            />

            {/* Picker shown inline below the active expanded day */}
            {pickerDay === i && expandedDay === i && (
              <LocationPickerDropdown
                value={pickerField === 'from' ? startFrom : day.to}
                valueId={pickerField === 'from' ? startFromId : day.toId}
                placeholder={pickerField === 'from' ? 'Search start location...' : 'Search destination...'}
                refLat={refCoords?.lat}
                refLng={refCoords?.lng}
                pickerDests={allDests}
                onSelect={handleSelect}
                onClose={() => setPickerDay(null)}
              />
            )}
          </div>
        ))}

        {itinerary.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-warm-200 p-8 text-center">
            <MapPin className="w-8 h-8 text-warm-300 mx-auto mb-3" />
            <p className="font-display text-base text-warm-400 mb-1">No days yet</p>
            <p className="font-body text-xs text-warm-400">
              Click "+ Add Day" below to start building your itinerary
            </p>
          </div>
        )}
      </div>

      {/* Add Day button */}
      <button
        type="button"
        onClick={addDay}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-warm-300 hover:border-forest-400 hover:bg-forest-50 text-warm-500 hover:text-forest-600 transition-all font-body text-sm font-medium group"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Add Day
        {itinerary.length > 0 && itinerary[itinerary.length - 1].to && (
          <span className="text-xs text-warm-400 font-normal">
            (continues from {itinerary[itinerary.length - 1].to})
          </span>
        )}
      </button>
    </div>
  );
}

// ── Exported map marker helper ────────────────────────────────────────────────

export function itineraryToMapMarkers(
  startFrom: string,
  startFromId: string,
  itinerary: ItineraryDay[],
  knownDestinations: DestInfo[]
) {
  const allDests = [AIRPORT, ...knownDestinations];
  const markers: { id: string; lng: number; lat: number; label: string; index: number }[] = [];

  if (startFromId) {
    const d = allDests.find(x => x.id === startFromId);
    if (d) markers.push({ id: 'start', lng: d.lng, lat: d.lat, label: d.name, index: 0 });
  }

  itinerary.forEach((day, i) => {
    if (day.toId) {
      const d = allDests.find(x => x.id === day.toId);
      if (d) markers.push({ id: day.id, lng: d.lng, lat: d.lat, label: d.name, index: i + 1 });
    }
  });

  return markers;
}
