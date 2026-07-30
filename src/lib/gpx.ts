import type { PlannedRoute } from "../types/route";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Genererer en GPX 1.1-fil med full rutegeometri (ikke den reduserte
 * waypoint-listen som brukes for Google Maps). Dette er den eksportveien som
 * gir eksakt ruté-troskap i Garmin, OsmAnd, BMW Connected osv. — og den eneste
 * veien for iOS-brukere, siden Apple Maps' URL-scheme ikke støtter via-punkter.
 */
export function generateGpx(route: PlannedRoute): string {
  const points = route.geometry
    .map(([lng, lat], i) => {
      const ele = route.elevation[i]?.elevationM;
      const eleTag = typeof ele === "number" ? `<ele>${ele.toFixed(1)}</ele>` : "";
      return `      <trkpt lat="${lat}" lon="${lng}">${eleTag}</trkpt>`;
    })
    .join("\n");

  const name = escapeXml(route.name || "MC-tur");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Kubikk MC-turplanlegger" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}

export function downloadGpx(route: PlannedRoute): void {
  const xml = generateGpx(route);
  const blob = new Blob([xml], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(route.name || "mc-tur").replace(/[^a-z0-9æøå_-]+/gi, "-")}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
