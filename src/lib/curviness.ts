import { angleDiffDeg, bearingDeg, totalDistanceKm } from "./geo.js";
import type { RouteCandidate } from "../types/route.js";

/**
 * OpenRouteService har ingen "foretrekk svingete vei"-parameter — avoid_features
 * unngår kun motorveier. Denne funksjonen er den pragmatiske erstatningen: den
 * regner ut hvor svingete en rute er (summert retningsendring per km) slik at vi
 * kan velge/fremheve det mest svingete blant flere alternative ruter fra ORS.
 */
export function computeCurvinessScore(geometry: [number, number][]): number {
  if (geometry.length < 3) return 0;

  let totalTurnDeg = 0;
  for (let i = 2; i < geometry.length; i++) {
    const b1 = bearingDeg(geometry[i - 2], geometry[i - 1]);
    const b2 = bearingDeg(geometry[i - 1], geometry[i]);
    totalTurnDeg += angleDiffDeg(b1, b2);
  }

  const distanceKm = totalDistanceKm(geometry);
  if (distanceKm === 0) return 0;

  return totalTurnDeg / distanceKm;
}

/**
 * Velger den mest svingete kandidaten blant flere alternative ruter, men bare
 * hvis den ikke er mer enn `maxDetourRatio` lengre enn den korteste kandidaten.
 * Standard 25% omvei-toleranse: en rute som er dobbelt så svingete men tar
 * 3x så lang tid er sjelden det brukeren faktisk vil ha.
 */
export function pickRecommendedRoute(
  candidates: RouteCandidate[],
  maxDetourRatio = 0.25,
): number {
  if (candidates.length === 0) return -1;
  if (candidates.length === 1) return 0;

  const shortestKm = Math.min(...candidates.map((c) => c.distanceKm));
  const eligible = candidates
    .map((c, index) => ({ index, c }))
    .filter(({ c }) => c.distanceKm <= shortestKm * (1 + maxDetourRatio));

  const pool = eligible.length > 0 ? eligible : candidates.map((c, index) => ({ index, c }));

  return pool.reduce((best, current) =>
    current.c.curvinessScore > best.c.curvinessScore ? current : best,
  ).index;
}
