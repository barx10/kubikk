export interface LatLng {
  lat: number;
  lng: number;
}

export interface NamedPoint extends LatLng {
  name?: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

/** En enkelt kandidat-rute slik den kommer fra /api/route, før klienten evt. velger den. */
export interface RouteCandidate {
  /** [lng, lat] par i rekkefølge, slik GeoJSON/ORS returnerer dem. */
  geometry: [number, number][];
  distanceKm: number;
  durationMin: number;
  elevation: ElevationPoint[];
  /** Regnet ut av curviness.ts: retningsendring (grader) per km. Høyere = mer svingete. */
  curvinessScore: number;
}

export interface RouteResult {
  candidates: RouteCandidate[];
  /** Indeks i candidates som er valgt som "mest svingete innenfor akseptabel omvei". */
  recommendedIndex: number;
}

export interface PlannedRoute {
  id: string;
  name: string;
  start: NamedPoint;
  end: NamedPoint;
  via: NamedPoint[];
  createdAt: number;
  /** Full geometri for den valgte ruten, lagret slik at GPX/kart kan gjenskapes uten nytt API-kall. */
  geometry: [number, number][];
  distanceKm: number;
  durationMin: number;
  elevation: ElevationPoint[];
}

export type MotorcycleProfile = "driving-motorcycle" | "driving-car";
