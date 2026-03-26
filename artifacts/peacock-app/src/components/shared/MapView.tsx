import React, { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { MAPBOX_TOKEN, fetchRoute, type RouteGeoJSON } from '@/lib/mapbox';

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  label: string;
  index?: number;
}

interface MapViewProps {
  markers: MapMarker[];
  showRoute?: boolean;
  className?: string;
  height?: string;
  activeMarkerId?: string;
}

function getBounds(markers: MapMarker[]): [[number, number], [number, number]] | null {
  if (markers.length === 0) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const m of markers) {
    if (m.lng < minLng) minLng = m.lng;
    if (m.lat < minLat) minLat = m.lat;
    if (m.lng > maxLng) maxLng = m.lng;
    if (m.lat > maxLat) maxLat = m.lat;
  }
  const lngPad = Math.max((maxLng - minLng) * 0.2, 0.06);
  const latPad = Math.max((maxLat - minLat) * 0.2, 0.06);
  return [
    [minLng - lngPad, minLat - latPad],
    [maxLng + lngPad, maxLat + latPad],
  ];
}

export function MapView({
  markers,
  showRoute = true,
  className,
  height = '400px',
  activeMarkerId,
}: MapViewProps) {
  const [route, setRoute] = useState<RouteGeoJSON | null>(null);
  const mapRef = useRef<any>(null);
  const markerKey = markers.map(m => `${m.lng},${m.lat}`).join('|');
  const markerIds = markers.map(m => m.id).join(',');

  // Guard: no token
  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn('rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center', className)}
        style={{ height }}
      >
        <p className="font-body text-sm text-red-500 text-center px-4">
          Mapbox token missing.<br />Check VITE_MAPBOX_TOKEN in .env
        </p>
      </div>
    );
  }

  // Fetch route when markers change
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!showRoute || markers.length < 2) {
      setRoute(null);
      return;
    }
    fetchRoute(markers.map(m => [m.lng, m.lat])).then(setRoute);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey, showRoute]);

  // Fit map to bounds when markers change
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;
    const bounds = getBounds(markers);
    if (!bounds) return;
    const map = mapRef.current.getMap?.();
    if (!map) return;
    map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 40, right: 40 }, duration: 900, maxZoom: 13 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerIds]);

  const center = markers[0] ?? { lng: 80.6350, lat: 7.8731 };

  return (
    <div
      className={cn('rounded-2xl overflow-hidden border border-warm-200 shadow-md', className)}
      style={{ height }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: markers.length <= 1 ? 9 : 7,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Route glow + line */}
        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer
              id="route-glow"
              type="line"
              paint={{ 'line-color': '#1b3c34', 'line-width': 10, 'line-opacity': 0.1, 'line-blur': 8 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#1b3c34', 'line-width': 3.5, 'line-dasharray': [1, 1.8] }}
            />
          </Source>
        )}

        {/* Markers */}
        {markers.map((marker, i) => {
          const isFirst = i === 0;
          const isLast = i === markers.length - 1 && markers.length > 1;
          const isActive = marker.id === activeMarkerId;
          const num = marker.index !== undefined ? marker.index + 1 : i + 1;

          return (
            <Marker key={marker.id} longitude={marker.lng} latitude={marker.lat} anchor="bottom">
              <div className="flex flex-col items-center group">
                {/* Pulse ring for active marker */}
                {isActive && (
                  <div className="absolute w-12 h-12 rounded-full bg-forest-400/30 animate-ping -translate-y-2" />
                )}
                <div
                  className={cn(
                    'relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all duration-200',
                    isFirst ? 'bg-forest-600 text-white'
                      : isLast ? 'bg-amber-200 text-forest-800'
                      : isActive ? 'bg-forest-500 text-white scale-125'
                      : 'bg-white text-forest-700 ring-2 ring-forest-400',
                  )}
                >
                  {num}
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-0.5 mt-0.5 text-[10px] font-semibold text-forest-800 shadow border border-warm-100 whitespace-nowrap max-w-[110px] truncate">
                  {marker.label}
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
