import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { NamedPoint } from "../../types/route";
import type { WeatherPoint } from "../../lib/routing";
import { fixLeafletDefaultIcon } from "../../lib/leafletIconFix";
import { PICK_MODE_LABEL, type PickMode } from "../../types/pickMode";

fixLeafletDefaultIcon();

interface RouteMapProps {
  start: NamedPoint | null;
  end: NamedPoint | null;
  via: NamedPoint[];
  pickMode: PickMode;
  onPick: (point: NamedPoint) => void;
  /** [lng, lat]-par for den valgte rute-kandidaten. */
  routeGeometry: [number, number][] | null;
  weatherPoints: WeatherPoint[];
}

const NORWAY_CENTER: [number, number] = [61.5, 8.5];

function ClickHandler({ onPick }: { onPick: (point: NamedPoint) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function weatherDivIcon(point: WeatherPoint): L.DivIcon {
  const temp = point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "–";
  return L.divIcon({
    className: "",
    html: `<div style="background:#1f2937;color:#f8fafc;border:1px solid #f97316;border-radius:9999px;padding:2px 8px;font-size:12px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.4)">${temp}</div>`,
    iconSize: [0, 0],
  });
}

export function RouteMap({ start, end, via, pickMode, onPick, routeGeometry, weatherPoints }: RouteMapProps) {
  const polylinePositions = useMemo<[number, number][]>(
    () => (routeGeometry ?? []).map(([lng, lat]) => [lat, lng]),
    [routeGeometry],
  );

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute left-1/2 top-2 z-[1000] -translate-x-1/2 rounded-full bg-gray-900/90 px-3 py-1 text-xs text-gray-200 shadow">
        {PICK_MODE_LABEL[pickMode]}
      </div>
      <MapContainer center={NORWAY_CENTER} zoom={6} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere'
        />
        <ClickHandler onPick={onPick} />

        {start && (
          <Marker position={[start.lat, start.lng]}>
            <Popup>Start{start.name ? `: ${start.name}` : ""}</Popup>
          </Marker>
        )}
        {via.map((point, i) => (
          <Marker key={`via-${i}`} position={[point.lat, point.lng]}>
            <Popup>Via-punkt {i + 1}</Popup>
          </Marker>
        ))}
        {end && (
          <Marker position={[end.lat, end.lng]}>
            <Popup>Slutt{end.name ? `: ${end.name}` : ""}</Popup>
          </Marker>
        )}

        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} pathOptions={{ color: "#f97316", weight: 4 }} />
        )}

        {weatherPoints.map((wp, i) => (
          <Marker
            key={`weather-${i}`}
            position={[wp.point.lat, wp.point.lng]}
            icon={weatherDivIcon(wp)}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
}
