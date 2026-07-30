import type { NamedPoint, PlannedRoute } from "../types/route";
import { reduceToCriticalWaypoints } from "./waypointReduction";

function fmt(point: { lat: number; lng: number }): string {
  return `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
}

/**
 * Google Maps' web-URL-API tar imot maks ~9-10 punkter (origin + destination +
 * waypoints). Vi tynner ut den svingete rute-geometrien til de mest kritiske
 * retningsskiftene (se waypointReduction.ts) for at Google Maps skal velge en
 * så lik trasé som mulig. Dette er best-effort — Google Maps ruter fortsatt
 * selv mellom punktene og kan avvike noe fra den planlagte ruten.
 */
export function buildGoogleMapsUrl(route: PlannedRoute): string {
  const criticalPoints = reduceToCriticalWaypoints(route.geometry, 8);
  const via = criticalPoints.slice(1, -1).map(([lng, lat]) => `${lat.toFixed(6)},${lng.toFixed(6)}`);

  const params = new URLSearchParams({
    api: "1",
    origin: fmt(route.start),
    destination: fmt(route.end),
    travelmode: "driving",
  });
  if (via.length > 0) {
    params.set("waypoints", via.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Apple Maps' URL-scheme støtter KUN ett saddr/daddr-par — ingen via-punkter i
 * det hele tatt. En flerpunkts svingete rute kan derfor ikke gjengis ruteriktig
 * via denne lenken; den viser bare start og slutt. GPX-eksport er den anbefalte
 * veien for iOS-brukere som vil ha full ruté-troskap (se gpx.ts).
 */
export function buildAppleMapsUrl(start: NamedPoint, end: NamedPoint): string {
  const params = new URLSearchParams({
    saddr: fmt(start),
    daddr: fmt(end),
    dirflg: "d",
  });
  return `https://maps.apple.com/?${params.toString()}`;
}
