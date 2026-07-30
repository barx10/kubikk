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
    html: `<div style="background:#ffffff;color:#1e293b;border:1px solid #fdba74;border-radius:9999px;padding:2px 8px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15)">${temp}</div>`,
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
      <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md">
        {PICK_MODE_LABEL[pickMode]}
      </div>
      <MapContainer center={NORWAY_CENTER} zoom={6} className="h-full w-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
          <>
            <Polyline positions={polylinePositions} pathOptions={{ color: "#ffffff", weight: 7, opacity: 0.9 }} />
            <Polyline positions={polylinePositions} pathOptions={{ color: "#f97316", weight: 4 }} />
          </>
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
