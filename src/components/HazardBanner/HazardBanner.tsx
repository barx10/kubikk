/**
 * v1 gjør ikke API-kall mot NVDB/DATEX II — det finnes ingen bekreftet,
 * dokumentert sanntids-feed for fjellovergang-status. I stedet lenker vi
 * direkte til Statens vegvesens offisielle side, som alltid er oppdatert.
 */
export function HazardBanner() {
  return (
    <a
      href="https://www.vegvesen.no/trafikk/fjelloverganger/"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/60"
    >
      <span aria-hidden="true">⚠️</span>
      <span>Sjekk status for fjelloverganger og veimeldinger hos Statens vegvesen</span>
    </a>
  );
}
