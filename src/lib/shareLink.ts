import type { NamedPoint } from "../types/route.js";

/**
 * "Del rute"-lenke: koder start/slutt/via-punkter + navn som en komprimert
 * query-parameter, uten backend eller konto. Mottakeren åpner lenken, appen
 * kaller /api/route på nytt med de samme punktene (samme cache-nøkkel som
 * senderen traff), og planleggeren fylles ut identisk. Dette er en
 * eksportmekanisme på linje med GPX, ikke en sosial funksjon — ingen data
 * lagres noe sted utenom i selve URL-en.
 */
export interface ShareableRoute {
  name: string;
  start: NamedPoint;
  end: NamedPoint;
  via: NamedPoint[];
}

const SHARE_PARAM = "tur";

/** Kompakt tuppel-form for å holde URL-en kort: [lat, lng, navn?]. */
type CompactPoint = [number, number] | [number, number, string];

function toCompact(point: NamedPoint): CompactPoint {
  return point.name ? [point.lat, point.lng, point.name] : [point.lat, point.lng];
}

function fromCompact(point: CompactPoint): NamedPoint {
  const [lat, lng, name] = point;
  return name ? { lat, lng, name } : { lat, lng };
}

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    input.length + ((4 - (input.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShareRoute(route: ShareableRoute): string {
  const payload = {
    n: route.name,
    s: toCompact(route.start),
    e: toCompact(route.end),
    v: route.via.map(toCompact),
  };
  return base64UrlEncode(JSON.stringify(payload));
}

export function buildShareUrl(route: ShareableRoute): string {
  const encoded = encodeShareRoute(route);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set(SHARE_PARAM, encoded);
  return url.toString();
}

export function decodeShareRouteFromUrl(search: string): ShareableRoute | null {
  const params = new URLSearchParams(search);
  const encoded = params.get(SHARE_PARAM);
  if (!encoded) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as {
      n: string;
      s: CompactPoint;
      e: CompactPoint;
      v: CompactPoint[];
    };
    return {
      name: payload.n,
      start: fromCompact(payload.s),
      end: fromCompact(payload.e),
      via: (payload.v ?? []).map(fromCompact),
    };
  } catch {
    return null;
  }
}
