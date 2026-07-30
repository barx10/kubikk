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
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 transition hover:bg-amber-100"
    >
      <span aria-hidden="true">⚠️</span>
      <span>Sjekk status for fjelloverganger og veimeldinger hos Statens vegvesen</span>
    </a>
  );
}
