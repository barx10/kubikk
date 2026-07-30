import type { VercelRequest, VercelResponse } from "@vercel/node";

interface Point {
  lat: number;
  lng: number;
}

function parsePoint(raw: string): Point | null {
  const [latRaw, lngRaw] = raw.split(",");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

interface MetNoResponse {
  properties: {
    timeseries: {
      time: string;
      data: {
        instant: { details: { air_temperature?: number; wind_speed?: number } };
        next_1_hours?: {
          summary: { symbol_code: string };
          details?: { precipitation_amount?: number };
        };
      };
    }[];
  };
}

interface WeatherPointResult {
  point: Point;
  temperatureC: number | null;
  symbolCode: string | null;
  precipitationMm: number | null;
  windSpeedMs: number | null;
  time: string;
}

// met.no krever en unik User-Agent som identifiserer applikasjonen og en
// kontaktmåte, ellers risikerer man å bli blokkert. Sett WEATHER_USER_AGENT i
// Vercel-miljøet til noe som faktisk identifiserer denne utrullingen, f.eks.
// "kubikk-mc-turplanlegger contact@dittdomene.no".
const USER_AGENT =
  process.env.WEATHER_USER_AGENT ?? "kubikk-mc-turplanlegger/0.1 (sett WEATHER_USER_AGENT i env)";

async function fetchWeatherForPoint(point: Point): Promise<{ result: WeatherPointResult; expires: Date | null }> {
  const url = new URL("https://api.met.no/weatherapi/locationforecast/2.0/complete");
  url.searchParams.set("lat", point.lat.toFixed(4));
  url.searchParams.set("lon", point.lng.toFixed(4));

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`met.no feilet (${res.status}) for ${point.lat},${point.lng}`);
  }

  const expiresHeader = res.headers.get("expires");
  const expires = expiresHeader ? new Date(expiresHeader) : null;

  const data = (await res.json()) as MetNoResponse;
  const first = data.properties.timeseries[0];

  return {
    result: {
      point,
      temperatureC: first?.data.instant.details.air_temperature ?? null,
      symbolCode: first?.data.next_1_hours?.summary.symbol_code ?? null,
      precipitationMm: first?.data.next_1_hours?.details?.precipitation_amount ?? null,
      windSpeedMs: first?.data.instant.details.wind_speed ?? null,
      time: first?.time ?? new Date().toISOString(),
    },
    expires,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Kun GET er støttet" });
    return;
  }

  const { points } = req.query;
  if (typeof points !== "string" || points.length === 0) {
    res.status(400).json({ error: "points (lat,lng;lat,lng;...) er påkrevd" });
    return;
  }

  const parsedPoints: Point[] = [];
  for (const raw of points.split(";")) {
    const point = parsePoint(raw);
    if (!point) {
      res.status(400).json({ error: `Ugyldig punkt: ${raw}` });
      return;
    }
    parsedPoints.push(point);
  }

  // Maks 5 nøkkelpunkter langs ruten, per spec.
  const limitedPoints = parsedPoints.slice(0, 5);

  try {
    const responses = await Promise.all(limitedPoints.map(fetchWeatherForPoint));

    const now = Date.now();
    const expirySeconds = responses
      .map((r) => r.expires)
      .filter((d): d is Date => d !== null)
      .map((d) => Math.floor((d.getTime() - now) / 1000));

    // Respekter met.no sin Expires-header: cache aldri lenger enn det korteste
    // gyldighetsvinduet blant punktene, med et gulv på 60s og et tak på 30 min.
    const maxAge = expirySeconds.length > 0
      ? Math.min(30 * 60, Math.max(60, Math.min(...expirySeconds)))
      : 15 * 60;

    res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=600`);
    res.status(200).json({ points: responses.map((r) => r.result) });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Væroppslag feilet" });
  }
}
