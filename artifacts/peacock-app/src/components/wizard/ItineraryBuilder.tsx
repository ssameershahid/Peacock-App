import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Plus, X, ChevronDown, ArrowRight, Search, Info } from 'lucide-react';
import { geocodeLocation, getCoords, MAPBOX_TOKEN } from '@/lib/mapbox';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  /** Resolved coordinates for custom (non-dropdown) locations */
  toLat?: number;
  toLng?: number;
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

interface MapboxSuggestion {
  name: string;
  fullName: string;
  lat: number;
  lng: number;
}

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
  onSelect: (name: string, id: string, coords?: { lat: number; lng: number }) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  const fetchSuggestions = useCallback((query: string) => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(query);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?country=LK&proximity=80.6350,7.8731&autocomplete=true&limit=5&types=place,locality,neighborhood,poi,address&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const items: MapboxSuggestion[] = (data.features ?? []).map((f: any) => ({
          name: f.text ?? f.place_name,
          fullName: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        }));
        setSuggestions(items);
      } catch { /* silent */ }
    }, 280);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    fetchSuggestions(v);
    if (!v) setSuggestions([]);
  };

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
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="flex-1 bg-transparent font-body text-sm text-forest-600 outline-none placeholder:text-warm-400"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSuggestions([]); }} className="text-warm-300 hover:text-warm-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mapbox live suggestions */}
      {suggestions.length > 0 && (
        <div className="border-b border-warm-100">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onSelect(s.name, '', { lat: s.lat, lng: s.lng }); onClose(); }}
              className="w-full text-left px-4 py-2.5 hover:bg-forest-50 transition-colors border-b border-warm-50 last:border-0 flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-forest-400 shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-forest-700">{s.name}</p>
                {s.fullName !== s.name && (
                  <p className="font-body text-[11px] text-warm-400 truncate">{s.fullName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

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
  onExpand: () => void;
  onRemove: () => void;
  onPickerOpen: (field: 'from' | 'to') => void;
  dragHandleListeners?: Record<string, unknown>;
  dragHandleAttributes?: Record<string, unknown>;
}

function DayRow({
  dayNumber, fromLabel, toLabel, expanded, isDay1,
  isDragging,
  onExpand, onRemove, onPickerOpen,
  dragHandleListeners, dragHandleAttributes,
}: DayRowProps) {
  const title = toLabel
    ? `${fromLabel || '?'} to ${toLabel}`
    : fromLabel
    ? `${fromLabel} → ?`
    : `Day ${dayNumber}`;

  return (
    <div
      className={`rounded-2xl border-2 bg-white transition-all duration-200 ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-warm-200 shadow-xl'
          : 'border-warm-200 hover:border-warm-300'
      }`}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={onExpand}>
        {/* Drag handle — 6-dot grid; listeners make it the dnd-kit handle */}
        <div
          {...dragHandleListeners}
          {...dragHandleAttributes}
          className="shrink-0 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity touch-none"
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

// ── SortableDayRow — dnd-kit wrapper around DayRow ───────────────────────────

function SortableDayRow({
  dayId,
  ...props
}: { dayId: string } & Omit<DayRowProps, 'isDragging' | 'dragHandleListeners' | 'dragHandleAttributes'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dayId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        position: isDragging ? 'relative' : undefined,
      }}
    >
      <DayRow
        {...props}
        isDragging={isDragging}
        dragHandleListeners={listeners as Record<string, unknown> | undefined}
        dragHandleAttributes={attributes as unknown as Record<string, unknown>}
      />
    </div>
  );
}

// ── ItineraryBuilder (exported) ───────────────────────────────────────────────

interface ItineraryBuilderProps {
  startFrom: string;
  startFromId: string;
  /** Resolved coords for a custom-typed startFrom (no id) */
  startFromLat?: number;
  startFromLng?: number;
  itinerary: ItineraryDay[];
  knownDestinations: DestInfo[];
  onChange: (
    itinerary: ItineraryDay[],
    startFrom: string,
    startFromId: string,
    startFromCoords?: { lat: number; lng: number }
  ) => void;
}

export function ItineraryBuilder({
  startFrom,
  startFromId,
  startFromLat,
  startFromLng,
  itinerary,
  knownDestinations,
  onChange,
}: ItineraryBuilderProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [pickerField, setPickerField] = useState<'from' | 'to'>('to');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Airport prepended to all known destinations for the picker
  const allDests: DestInfo[] = [AIRPORT, ...knownDestinations];

  // Derived: FROM label for each day — chained from previous TO
  const fromLabels = [startFrom, ...itinerary.slice(0, -1).map(d => d.to)];

  // Reference coords for distance display in picker (= the FROM of the day being edited)
  function getRefCoords(dayIdx: number, field: 'from' | 'to'): { lat: number; lng: number } | null {
    if (field === 'from') return null;
    if (dayIdx === 0) {
      if (startFromId) {
        const d = allDests.find(x => x.id === startFromId);
        return d ? { lat: d.lat, lng: d.lng } : null;
      }
      // Custom startFrom — use stored coords if available
      if (startFromLat !== undefined && startFromLng !== undefined) {
        return { lat: startFromLat, lng: startFromLng };
      }
      return null;
    }
    const prevDay = itinerary[dayIdx - 1];
    if (!prevDay) return null;
    if (prevDay.toId) {
      const d = allDests.find(x => x.id === prevDay.toId);
      return d ? { lat: d.lat, lng: d.lng } : null;
    }
    // Custom "to" location — use stored coords
    if (prevDay.toLat !== undefined && prevDay.toLng !== undefined) {
      return { lat: prevDay.toLat, lng: prevDay.toLng };
    }
    return null;
  }

  function openPicker(dayIdx: number, field: 'from' | 'to') {
    setPickerDay(dayIdx);
    setPickerField(field);
    setExpandedDay(dayIdx);
  }

  async function handleSelect(name: string, id: string, googleCoords?: { lat: number; lng: number }) {
    // Capture picker state immediately before any async work
    const field = pickerField;
    const dayIdx = pickerDay;
    setPickerDay(null);

    // Preserve current startFrom coords to pass through on "to" changes
    const currentStartFromCoords: { lat: number; lng: number } | undefined =
      !startFromId && startFromLat !== undefined && startFromLng !== undefined
        ? { lat: startFromLat, lng: startFromLng }
        : undefined;

    if (id) {
      // Known dropdown destination — no geocoding needed
      if (field === 'from' && dayIdx === 0) {
        onChange(itinerary, name, id, undefined);
      } else if (field === 'to' && dayIdx !== null) {
        const next = itinerary.map((d, i) =>
          i === dayIdx ? { ...d, to: name, toId: id, toLat: undefined, toLng: undefined } : d
        );
        onChange(next, startFrom, startFromId, currentStartFromCoords);
      }
      return;
    }

    // Google Places selection — use authoritative coords directly, skip geocoding
    let coords: { lat: number; lng: number } | undefined = googleCoords;

    if (!coords) {
      // Fallback: local lookup then Mapbox (only reached if Google API unavailable)
      const synced = getCoords(name);
      if (synced) {
        coords = { lat: synced[1], lng: synced[0] };
      } else {
        const gc = await geocodeLocation(name);
        if (gc) coords = { lat: gc[1], lng: gc[0] };
      }
    }

    if (field === 'from' && dayIdx === 0) {
      onChange(itinerary, name, '', coords);
    } else if (field === 'to' && dayIdx !== null) {
      const next = itinerary.map((d, i) =>
        i === dayIdx
          ? { ...d, to: name, toId: '', toLat: coords?.lat, toLng: coords?.lng }
          : d
      );
      onChange(next, startFrom, startFromId, currentStartFromCoords);
    }
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

  function handleDndEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = itinerary.findIndex(d => d.id === String(active.id));
    const newIdx = itinerary.findIndex(d => d.id === String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    const sfCoords = !startFromId && startFromLat !== undefined && startFromLng !== undefined
      ? { lat: startFromLat, lng: startFromLng } : undefined;
    onChange(arrayMove(itinerary, oldIdx, newIdx), startFrom, startFromId, sfCoords);
    setExpandedDay(null);
    setPickerDay(null);
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={itinerary.map(d => d.id)} strategy={verticalListSortingStrategy}>
            {itinerary.map((day, i) => (
              <div key={day.id}>
                <SortableDayRow
                  dayId={day.id}
                  dayNumber={i + 1}
                  fromLabel={fromLabels[i] ?? ''}
                  toLabel={day.to}
                  expanded={expandedDay === i}
                  isDay1={i === 0}
                  onExpand={() => {
                    if (expandedDay === i) { setExpandedDay(null); setPickerDay(null); }
                    else { setExpandedDay(i); setPickerDay(null); }
                  }}
                  onRemove={() => removeDay(i)}
                  onPickerOpen={field => openPicker(i, field)}
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
          </SortableContext>
        </DndContext>

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
  knownDestinations: DestInfo[],
  startFromCoords?: { lat: number; lng: number }
) {
  const allDests = [AIRPORT, ...knownDestinations];
  const markers: { id: string; lng: number; lat: number; label: string; index: number }[] = [];

  if (startFromId) {
    const d = allDests.find(x => x.id === startFromId);
    if (d) markers.push({ id: 'start', lng: d.lng, lat: d.lat, label: d.name, index: 0 });
  } else if (startFrom && startFromCoords) {
    // Custom startFrom with resolved coordinates
    markers.push({ id: 'start', lng: startFromCoords.lng, lat: startFromCoords.lat, label: startFrom, index: 0 });
  }

  itinerary.forEach((day, i) => {
    if (day.toId) {
      const d = allDests.find(x => x.id === day.toId);
      if (d) markers.push({ id: day.id, lng: d.lng, lat: d.lat, label: d.name, index: i + 1 });
    } else if (day.to && day.toLat !== undefined && day.toLng !== undefined) {
      // Custom "to" location with resolved coordinates
      markers.push({ id: day.id, lng: day.toLng, lat: day.toLat, label: day.to, index: i + 1 });
    }
  });

  return markers;
}
