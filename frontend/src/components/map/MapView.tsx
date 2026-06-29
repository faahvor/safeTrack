'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2 } from 'lucide-react';

/* ── User / destination icons ── */

const userIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="background:rgba(28,32,40,.85);color:white;font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;display:flex;align-items:center;gap:5px;white-space:nowrap;backdrop-filter:blur(6px)">
        <span style="width:5px;height:5px;border-radius:50%;background:white;flex-shrink:0"></span>
        You're here
      </div>
      <div style="width:14px;height:14px;border-radius:50%;background:#3B82F6;border:2.5px solid white;box-shadow:0 2px 10px rgba(59,130,246,.6)"></div>
    </div>
  `,
  className: '',
  iconSize: [110, 46],
  iconAnchor: [55, 46],
});

const destIcon = L.divIcon({
  html: `
    <div style="width:18px;height:18px;border-radius:50%;background:#EF4444;border:2.5px solid white;box-shadow:0 2px 8px rgba(239,68,68,.5);display:flex;align-items:center;justify-content:center">
      <div style="width:7px;height:7px;border-radius:50%;background:white"></div>
    </div>
  `,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* ── POI icons (cached by color) ── */

const poiIconCache = new Map<string, L.DivIcon>();
function createPoiIcon(color: string): L.DivIcon {
  if (poiIconCache.has(color)) return poiIconCache.get(color)!;
  const icon = L.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
  poiIconCache.set(color, icon);
  return icon;
}

/* ── POI category metadata ── */

const AMENITY_META: Record<string, { label: string; color: string }> = {
  restaurant:       { label: 'Restaurant',      color: '#F59E0B' },
  cafe:             { label: 'Café',             color: '#8B5CF6' },
  fast_food:        { label: 'Fast Food',        color: '#FB923C' },
  bar:              { label: 'Bar',              color: '#6366F1' },
  pub:              { label: 'Pub',              color: '#7C3AED' },
  food_court:       { label: 'Food Court',       color: '#F59E0B' },
  hospital:         { label: 'Hospital',         color: '#EF4444' },
  clinic:           { label: 'Clinic',           color: '#F87171' },
  doctors:          { label: 'Doctor',           color: '#F87171' },
  pharmacy:         { label: 'Pharmacy',         color: '#14B8A6' },
  school:           { label: 'School',           color: '#EC4899' },
  university:       { label: 'University',       color: '#DB2777' },
  college:          { label: 'College',          color: '#DB2777' },
  bank:             { label: 'Bank',             color: '#3B82F6' },
  atm:              { label: 'ATM',              color: '#60A5FA' },
  fuel:             { label: 'Fuel Station',     color: '#64748B' },
  place_of_worship: { label: 'Worship',          color: '#78716C' },
  parking:          { label: 'Parking',          color: '#94A3B8' },
  police:           { label: 'Police Station',   color: '#1D4ED8' },
  fire_station:     { label: 'Fire Station',     color: '#DC2626' },
  library:          { label: 'Library',          color: '#10B981' },
  post_office:      { label: 'Post Office',      color: '#F97316' },
  cinema:           { label: 'Cinema',           color: '#A855F7' },
  theatre:          { label: 'Theatre',          color: '#9333EA' },
  gym:              { label: 'Gym',              color: '#0EA5E9' },
  marketplace:      { label: 'Market',           color: '#22C55E' },
};

function getPoiMeta(tags: Record<string, string>): { label: string; color: string } {
  if (tags.amenity && AMENITY_META[tags.amenity]) return AMENITY_META[tags.amenity];
  if (tags.shop === 'supermarket' || tags.shop === 'grocery')
    return { label: 'Supermarket', color: '#22C55E' };
  if (tags.shop === 'convenience') return { label: 'Convenience Store', color: '#10B981' };
  if (tags.shop === 'mall' || tags.shop === 'department_store')
    return { label: 'Shopping Mall', color: '#D97706' };
  if (tags.shop) return { label: 'Shop', color: '#10B981' };
  if (tags.office === 'company' || tags.office === 'government')
    return { label: 'Office', color: '#3B82F6' };
  if (tags.office) return { label: 'Office', color: '#3B82F6' };
  return { label: tags.amenity ?? 'Place', color: '#6B7280' };
}

/* ── Data types ── */

interface NearbyPlace {
  id: number;
  lat: number;
  lon: number;
  name: string;
  label: string;
  color: string;
  address?: string;
}

/* ── Map child components ── */

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

function ResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

function MapInteraction({
  onHover,
  onMoveEnd,
}: {
  onHover: (lat: number, lng: number) => void;
  onMoveEnd: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    mousemove(e) { onHover(e.latlng.lat, e.latlng.lng); },
    moveend(e) {
      const c = (e.target as L.Map).getCenter();
      onMoveEnd(c.lat, c.lng);
    },
  });
  return null;
}

/* ── Main component ── */

export interface MapViewProps {
  userPosition?: [number, number] | null;
  destinationPosition?: [number, number] | null;
}

export function MapView({ userPosition, destinationPosition }: MapViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [hoverInfo, setHoverInfo] = useState('');

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeoPos = useRef<{ lat: number; lng: number } | null>(null);

  const center: [number, number] = userPosition ?? [20, 0];
  const zoom = userPosition ? 15 : 2;

  /* Close fullscreen with Escape key */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  /* Fetch nearby places via Overpass API */
  useEffect(() => {
    if (!userPosition) return;
    const [lat, lng] = userPosition;
    const q =
      `[out:json][timeout:15];` +
      `(node["amenity"](around:600,${lat},${lng});` +
      `node["shop"](around:600,${lat},${lng});` +
      `node["office"](around:600,${lat},${lng}););` +
      `out 80;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        const results: NearbyPlace[] = (
          d.elements as Array<{
            id: number;
            lat: number;
            lon: number;
            tags: Record<string, string>;
          }>
        )
          .filter((el) => el.lat && el.lon && el.tags?.name)
          .slice(0, 60)
          .map((el) => {
            const meta = getPoiMeta(el.tags);
            return {
              id: el.id,
              lat: el.lat,
              lon: el.lon,
              name: el.tags.name,
              address: el.tags['addr:street']
                ? `${el.tags['addr:housenumber'] ?? ''} ${el.tags['addr:street']}`.trim()
                : undefined,
              ...meta,
            };
          });
        setPlaces(results);
      })
      .catch(() => {});
  }, [userPosition?.[0], userPosition?.[1]]);

  /* Reverse geocode on hover/move-end — debounced 900 ms */
  const geocode = useCallback((lat: number, lng: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      const p = lastGeoPos.current;
      if (p && Math.abs(p.lat - lat) < 0.0002 && Math.abs(p.lng - lng) < 0.0002) return;
      lastGeoPos.current = { lat, lng };
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=17`,
        { headers: { 'Accept-Language': 'en' } },
      )
        .then((r) => r.json())
        .then((data) => {
          const a = data.address ?? {};
          const parts = [
            a.road,
            a.suburb ?? a.neighbourhood ?? a.city_district,
            a.city ?? a.town ?? a.village,
          ].filter(Boolean);
          setHoverInfo(
            parts.join(', ') ||
            (data.display_name ?? '').split(',').slice(0, 3).join(',').trim(),
          );
        })
        .catch(() => {});
    }, 900);
  }, []);

  return (
    <div className={expanded ? 'fixed inset-0 z-[9000]' : 'relative w-full h-full'}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <ResizeHandler trigger={expanded} />
        <MapInteraction onHover={geocode} onMoveEnd={geocode} />

        {userPosition && <RecenterMap lat={userPosition[0]} lng={userPosition[1]} />}
        {userPosition && <Marker position={userPosition} icon={userIcon} />}
        {destinationPosition && <Marker position={destinationPosition} icon={destIcon} />}

        {places.map((pl) => (
          <Marker key={pl.id} position={[pl.lat, pl.lon]} icon={createPoiIcon(pl.color)}>
            <Popup minWidth={140}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', color: '#111' }}>
                {pl.name}
              </p>
              <p style={{ fontSize: 11, color: pl.color, fontWeight: 600, margin: '0 0 2px' }}>
                {pl.label}
              </p>
              {pl.address && (
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{pl.address}</p>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Expand / collapse button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="absolute bottom-9 right-2 z-[1000] w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        title={expanded ? 'Exit fullscreen (Esc)' : 'Expand map'}
      >
        {expanded
          ? <Minimize2 className="w-4 h-4 text-gray-600" />
          : <Maximize2 className="w-4 h-4 text-gray-600" />}
      </button>

      {/* Street / area name tooltip */}
      {hoverInfo && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-[rgba(28,32,40,.85)] text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none max-w-[80%] truncate">
          {hoverInfo}
        </div>
      )}
    </div>
  );
}
