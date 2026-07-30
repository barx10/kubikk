import type { NamedPoint, RouteResult } from "../types/route";

export interface RouteRequest {
  start: NamedPoint;
  end: NamedPoint;
  via: NamedPoint[];
}

function pointToParam(point: NamedPoint): string {
  return `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
}

/**
 * Bruker GET med kanonisk sorterte query-parametre (ikke POST) slik at Vercels
 * CDN/Edge-cache kan cache responsen på selve URL-en — samme (start, slutt,
 * via)-kombinasjon gir samme cache-nøkkel automatisk. Se api/route.ts for
 * Cache-Control-strategien.
 */
export async function fetchRoute(request: RouteRequest): Promise<RouteResult> {
  const params = new URLSearchParams({
    start: pointToParam(request.start),
    end: pointToParam(request.end),
  });
  if (request.via.length > 0) {
    params.set("via", request.via.map(pointToParam).join(";"));
  }

  const res = await fetch(`/api/route?${params.toString()}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ruteoppslag feilet (${res.status}): ${body}`);
  }

  return (await res.json()) as RouteResult;
}

export interface WeatherPoint {
  point: NamedPoint;
  temperatureC: number | null;
  symbolCode: string | null;
  precipitationMm: number | null;
  windSpeedMs: number | null;
  time: string;
}

export async function fetchWeatherForPoints(points: NamedPoint[]): Promise<WeatherPoint[]> {
  const params = new URLSearchParams({
    points: points.map(pointToParam).join(";"),
  });
  const res = await fetch(`/api/weather?${params.toString()}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Væroppslag feilet (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { points: WeatherPoint[] };
  return data.points;
}
