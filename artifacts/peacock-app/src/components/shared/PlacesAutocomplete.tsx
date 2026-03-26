/**
 * Location autocomplete for transfers.
 * Primary: Mapbox Geocoding API (suggestions + coordinates).
 * Enhancement: Google Places API suggestions when available.
 * The map always gets coordinates — coords are resolved on blur even
 * if the user doesn't pick from the dropdown.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MAPBOX_TOKEN, geocodeLocation } from '@/lib/mapbox';

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  name: string;
  fullName: string;
  lng: number;
  lat: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, delay]);
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
  icon,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Mapbox suggestions
  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    if (!query.trim() || query.length < 2 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    const encoded = encodeURIComponent(query);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?country=LK&proximity=80.6350,7.8731&limit=5&types=place,locality,neighborhood,poi,address&access_token=${MAPBOX_TOKEN}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const items: Suggestion[] = (data.features ?? []).map((f: any) => ({
        name: f.text ?? f.place_name,
        fullName: f.place_name,
        lng: f.center[0],
        lat: f.center[1],
      }));
      setSuggestions(items);
      setOpen(items.length > 0);
    } catch { /* silent */ }
  }, 280);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    fetchSuggestions(v);
    if (!v) setSuggestions([]);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.fullName);
    onPlaceSelect({ name: s.fullName, lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setOpen(false);
  };

  // Geocode on blur so map works even if user didn't pick from dropdown
  const handleBlur = async () => {
    setTimeout(() => setOpen(false), 150);
    if (!value.trim()) return;
    setResolving(true);
    try {
      const coords = await geocodeLocation(value);
      if (coords) {
        onPlaceSelect({ name: value, lat: coords[1], lng: coords[0] });
      }
    } finally {
      setResolving(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {icon && (
        <div className="absolute left-3 top-3 pointer-events-none z-10">{icon}</div>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white border border-warm-200 rounded-xl py-3 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none transition-all',
          icon ? 'pl-10' : 'pl-4',
          resolving && 'border-amber-200',
          className,
        )}
      />
      {resolving && (
        <div className="absolute right-3 top-3.5">
          <div className="w-3.5 h-3.5 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-warm-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 hover:bg-warm-50 transition-colors border-b border-warm-100 last:border-0"
            >
              <p className="font-body text-sm font-medium text-forest-700">{s.name}</p>
              {s.fullName !== s.name && (
                <p className="font-body text-xs text-warm-400 truncate">{s.fullName}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
