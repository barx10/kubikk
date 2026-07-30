import type { WeatherPoint } from "../../lib/routing";

interface WeatherBadgesProps {
  points: WeatherPoint[];
  loading: boolean;
}

/**
 * Tekstlig oppsummering av værbadgene som også vises som overlays på kartet
 * (se RouteMap.tsx) — nyttig når kartet er for lite til å lese badges tydelig.
 */
export function WeatherBadges({ points, loading }: WeatherBadgesProps) {
  if (loading) {
    return <p className="text-sm text-gray-500">Henter værvarsel for ruten…</p>;
  }
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {points.map((wp, i) => (
        <div
          key={i}
          className="flex shrink-0 flex-col items-center rounded-md border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs"
        >
          <span className="text-gray-400">{wp.point.name ?? `Punkt ${i + 1}`}</span>
          <span className="text-base font-semibold">
            {wp.temperatureC !== null ? `${Math.round(wp.temperatureC)}°C` : "–"}
          </span>
          {wp.precipitationMm !== null && wp.precipitationMm > 0 && (
            <span className="text-blue-300">{wp.precipitationMm} mm</span>
          )}
        </div>
      ))}
    </div>
  );
}
