/** Delte geometri-hjelpere brukt av curviness- og waypoint-reduksjonsalgoritmene. */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Haversine-avstand i km mellom to [lng, lat]-punkter. */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Retning (kompassgrader, 0-360) fra punkt a til punkt b, begge [lng, lat]. */
export function bearingDeg(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Minste vinkelforskjell (0-180 grader) mellom to retninger. */
export function angleDiffDeg(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function totalDistanceKm(geometry: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < geometry.length; i++) {
    total += haversineKm(geometry[i - 1], geometry[i]);
  }
  return total;
}

/** Plukker `count` jevnt fordelte punkter langs ruten (inkl. start og slutt) for værvarsel. */
export function sampleKeyPoints(geometry: [number, number][], count = 5): [number, number][] {
  if (geometry.length <= count) return geometry;
  const step = (geometry.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => geometry[Math.round(i * step)]);
}
