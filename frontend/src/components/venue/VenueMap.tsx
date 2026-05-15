import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import type { Venue } from '@/types/api';

// Fix Leaflet's default marker icons (Vite doesn't ship them via the
// default CSS-relative paths). Inline an SVG-based DivIcon instead.
const limeIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;border-radius:9999px;
    background:#84cc16;border:3px solid #0a0f1c;
    box-shadow:0 4px 10px rgba(0,0,0,.25);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.5 });
  }, [center, map]);
  return null;
};

type Props = {
  venues: Venue[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  // When set, marker popups link to the venue.
  linkVenues?: boolean;
};

export const VenueMap = ({ venues, height = '420px', center, zoom = 12, linkVenues = true }: Props) => {
  const fallbackCenter: [number, number] =
    venues.length > 0
      ? [venues[0]!.lat, venues[0]!.lng]
      : [12.9716, 77.6411]; // Bengaluru
  const finalCenter = center ?? fallbackCenter;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={finalCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={limeIcon}>
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{v.name}</div>
                <div className="text-xs text-slate-500">{v.location}</div>
                {v.pricePerHour != null && (
                  <div className="text-xs font-semibold text-brand-700">
                    ₹{v.pricePerHour}/hr
                  </div>
                )}
                {linkVenues && (
                  <Link
                    to={`/venues/${v.id}`}
                    className="mt-1 inline-block text-xs font-semibold text-brand-700 underline"
                  >
                    View venue →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        <Recenter center={finalCenter} />
      </MapContainer>
    </div>
  );
};
