import type { VercelRequest, VercelResponse } from "@vercel/node";
import { computeCurvinessScore, pickRecommendedRoute } from "../src/lib/curviness.js";
import { haversineKm } from "../src/lib/geo.js";
import type { ElevationPoint, RouteCandidate, RouteResult } from "../src/types/route.js";

const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-motorcycle/geojson";

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

interface OrsFeature {
  geometry: { coordinates: [number, number, number?][] };
  properties: { summary: { distance: number; duration: number } };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Kun GET er støttet" });
    return;
  }

  const { start, end, via } = req.query;
  if (typeof start !== "string" || typeof end !== "string") {
    res.status(400).json({ error: "start og end (lat,lng) er påkrevd" });
    return;
  }

  const startPoint = parsePoint(start);
  const endPoint = parsePoint(end);
  if (!startPoint || !endPoint) {
    res.status(400).json({ error: "Ugyldig start/end-koordinat" });
    return;
  }

  const viaPoints: Point[] = [];
  if (typeof via === "string" && via.length > 0) {
    for (const raw of via.split(";")) {
      const point = parsePoint(raw);
      if (!point) {
        res.status(400).json({ error: `Ugyldig via-koordinat: ${raw}` });
        return;
      }
      viaPoints.push(point);
    }
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ORS_API_KEY er ikke konfigurert på serveren" });
    return;
  }

  const coordinates = [startPoint, ...viaPoints, endPoint].map((p) => [p.lng, p.lat]);

  // ORS støtter kun alternative_routes når det ikke finnes via-punkter
  // (nøyaktig én origin og én destination). Med via-punkter får vi kun én rute
  // tilbake, og curviness-scoren brukes da bare til visning, ikke til å velge mellom alternativer.
  const body: Record<string, unknown> = {
    coordinates,
    elevation: true,
    options: { avoid_features: ["highways"] },
  };
  if (viaPoints.length === 0) {
    body.alternative_routes = { target_count: 3, weight_factor: 1.6, share_factor: 0.6 };
  }

  let orsRes: Response;
  try {
    orsRes = await fetch(ORS_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    res.status(502).json({ error: "Kunne ikke nå OpenRouteService" });
    return;
  }

  if (!orsRes.ok) {
    const text = await orsRes.text().catch(() => "");
    res.status(502).json({ error: `OpenRouteService feilet (${orsRes.status}): ${text}` });
    return;
  }

  const geojson = (await orsRes.json()) as { features: OrsFeature[] };

  const candidates: RouteCandidate[] = geojson.features.map((feature) => {
    const rawCoords = feature.geometry.coordinates;
    const geometry: [number, number][] = rawCoords.map(([lng, lat]) => [lng, lat]);

    let cumulativeKm = 0;
    const elevation: ElevationPoint[] = rawCoords.map((coord, i) => {
      if (i > 0) {
        cumulativeKm += haversineKm(
          [rawCoords[i - 1][0], rawCoords[i - 1][1]],
          [coord[0], coord[1]],
        );
      }
      return { distanceKm: cumulativeKm, elevationM: coord[2] ?? 0 };
    });

    return {
      geometry,
      distanceKm: feature.properties.summary.distance / 1000,
      durationMin: feature.properties.summary.duration / 60,
      elevation,
      curvinessScore: computeCurvinessScore(geometry),
    };
  });

  const result: RouteResult = {
    candidates,
    recommendedIndex: pickRecommendedRoute(candidates),
  };

  // ORS gratis-tier har begrenset dagskvote. GET + kanonisk query-streng gjør
  // at Vercels CDN kan cache identiske (start,end,via)-kombinasjoner.
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
  res.status(200).json(result);
}
