import { angleDiffDeg, bearingDeg, haversineKm } from "./geo";

/**
 * Google Maps' deep-link-URL tar imot maks ~9-10 punkter totalt (start + slutt +
 * via). For at Google Maps skal velge samme svingete trasé som ruten vi faktisk
 * planla, må vi ikke bare "forenkle kurvens form" (Douglas-Peucker) — vi må
 * beholde punktene der VEIVALGET skjer, altså de skarpeste retningsskiftene.
 * Dette er best-effort: Google Maps ruter fortsatt selv mellom punktene og kan
 * velge en litt annen vei enn planlagt.
 */
export function reduceToCriticalWaypoints(
  geometry: [number, number][],
  maxViaPoints = 8,
  minSpacingKm = 2,
): [number, number][] {
  if (geometry.length <= 2) return geometry;

  const start = geometry[0];
  const end = geometry[geometry.length - 1];
  const maxInterior = Math.max(0, maxViaPoints - 2);

  if (maxInterior === 0) return [start, end];

  const turns: { index: number; turnDeg: number }[] = [];
  for (let i = 2; i < geometry.length; i++) {
    const b1 = bearingDeg(geometry[i - 2], geometry[i - 1]);
    const b2 = bearingDeg(geometry[i - 1], geometry[i]);
    turns.push({ index: i - 1, turnDeg: angleDiffDeg(b1, b2) });
  }

  turns.sort((a, b) => b.turnDeg - a.turnDeg);

  const selected: { index: number; point: [number, number] }[] = [];
  for (const turn of turns) {
    if (selected.length >= maxInterior) break;
    const point = geometry[turn.index];
    const tooClose = selected.some(
      (s) => haversineKm(s.point, point) < minSpacingKm,
    );
    if (!tooClose) {
      selected.push({ index: turn.index, point });
    }
  }

  selected.sort((a, b) => a.index - b.index);

  return [start, ...selected.map((s) => s.point), end];
}
