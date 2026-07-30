import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { PickMode } from "./types/pickMode";
import { RoutePlanner } from "./components/RoutePlanner/RoutePlanner";
import { WeatherBadges } from "./components/WeatherBadges/WeatherBadges";
import { HazardBanner } from "./components/HazardBanner/HazardBanner";
import { SavedRoutes } from "./components/SavedRoutes/SavedRoutes";
import { ExportMenu } from "./components/ExportMenu/ExportMenu";
import { fetchRoute, fetchWeatherForPoints, type WeatherPoint } from "./lib/routing";
import { saveRoute } from "./lib/db";
import { sampleKeyPoints } from "./lib/geo";
import { decodeShareRouteFromUrl } from "./lib/shareLink";
import type { NamedPoint, PlannedRoute, RouteResult } from "./types/route";

// Leaflet og Recharts er de tyngste avhengighetene i bunten — last dem først
// når de faktisk trengs, ikke i den initielle app-bunten.
const RouteMap = lazy(() => import("./components/Map/RouteMap").then((m) => ({ default: m.RouteMap })));
const ElevationProfile = lazy(() =>
  import("./components/ElevationProfile/ElevationProfile").then((m) => ({ default: m.ElevationProfile })),
);

export default function App() {
  const [start, setStart] = useState<NamedPoint | null>(null);
  const [end, setEnd] = useState<NamedPoint | null>(null);
  const [via, setVia] = useState<NamedPoint[]>([]);
  const [pickMode, setPickMode] = useState<PickMode>("start");

  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [routeName, setRouteName] = useState("");

  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Forhåndsutfyll planleggeren dersom siden ble åpnet via en "del rute"-lenke.
  useEffect(() => {
    const shared = decodeShareRouteFromUrl(window.location.search);
    if (!shared) return;
    setStart(shared.start);
    setEnd(shared.end);
    setVia(shared.via);
    setRouteName(shared.name);
    setPickMode("start");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const selectedCandidate = routeResult?.candidates[selectedIndex] ?? null;

  const plannedRoute = useMemo<PlannedRoute | null>(() => {
    if (!selectedCandidate || !start || !end || !routeId) return null;
    return {
      id: routeId,
      name: routeName || "MC-tur",
      start,
      end,
      via,
      createdAt: Date.now(),
      geometry: selectedCandidate.geometry,
      distanceKm: selectedCandidate.distanceKm,
      durationMin: selectedCandidate.durationMin,
      elevation: selectedCandidate.elevation,
    };
  }, [selectedCandidate, start, end, via, routeId, routeName]);

  useEffect(() => {
    if (!selectedCandidate) {
      setWeatherPoints([]);
      return;
    }
    const keyPoints = sampleKeyPoints(selectedCandidate.geometry, 5).map(
      ([lng, lat]): NamedPoint => ({ lat, lng }),
    );
    setWeatherLoading(true);
    fetchWeatherForPoints(keyPoints)
      .then(setWeatherPoints)
      .catch(() => setWeatherPoints([]))
      .finally(() => setWeatherLoading(false));
  }, [selectedCandidate]);

  function handlePick(point: NamedPoint) {
    if (pickMode === "start") {
      setStart(point);
      setPickMode("end");
    } else if (pickMode === "end") {
      setEnd(point);
      setPickMode("via");
    } else {
      setVia((prev) => [...prev, point]);
    }
  }

  function handleRemoveVia(index: number) {
    setVia((prev) => prev.filter((_, i) => i !== index));
  }

  function handleClear() {
    setStart(null);
    setEnd(null);
    setVia([]);
    setPickMode("start");
    setRouteResult(null);
    setRouteId(null);
    setRouteName("");
    setPlanError(null);
  }

  async function handlePlan() {
    if (!start || !end) return;
    setPlanning(true);
    setPlanError(null);
    try {
      const result = await fetchRoute({ start, end, via });
      setRouteResult(result);
      setSelectedIndex(Math.max(0, result.recommendedIndex));
      setRouteId(crypto.randomUUID());
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Klarte ikke å planlegge rute");
    } finally {
      setPlanning(false);
    }
  }

  async function handleSave(name: string) {
    if (!plannedRoute) return;
    await saveRoute({ ...plannedRoute, name });
  }

  function handleLoadSaved(route: PlannedRoute) {
    setStart(route.start);
    setEnd(route.end);
    setVia(route.via);
    setRouteName(route.name);
    setRouteId(route.id);
    setRouteResult({
      candidates: [
        {
          geometry: route.geometry,
          distanceKm: route.distanceKm,
          durationMin: route.durationMin,
          elevation: route.elevation,
          curvinessScore: 0,
        },
      ],
      recommendedIndex: 0,
    });
    setSelectedIndex(0);
    setPickMode("start");
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100 md:flex-row">
      <aside className="order-2 flex w-full flex-col overflow-y-auto border-t border-slate-200 bg-white md:order-1 md:h-full md:w-[26rem] md:border-t-0 md:border-r">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-base font-bold text-white shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-slate-900">Kubikk</h1>
            <p className="text-xs text-slate-500">MC-turplanlegger</p>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-5 py-5">
          <HazardBanner />

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <RoutePlanner
              start={start}
              end={end}
              via={via}
              pickMode={pickMode}
              onPickModeChange={setPickMode}
              onRemoveVia={handleRemoveVia}
              onClear={handleClear}
              onPlan={() => void handlePlan()}
              planning={planning}
              error={planError}
            />
          </section>

          {routeResult && routeResult.candidates.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {routeResult.candidates.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    i === selectedIndex
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Alt. {i + 1} · {c.distanceKm.toFixed(0)} km · {c.curvinessScore.toFixed(0)}°/km
                </button>
              ))}
            </div>
          )}

          <WeatherBadges points={weatherPoints} loading={weatherLoading} />

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Eksporter / lagre</h2>
            <ExportMenu route={plannedRoute} onSave={(name) => void handleSave(name)} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Lagrede turer</h2>
            <SavedRoutes onLoad={handleLoadSaved} />
          </section>
        </div>
      </aside>

      <main className="order-1 flex-1 md:order-2">
        <div className="h-64 md:h-2/3 md:min-h-0">
          <Suspense fallback={<div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">Laster kart…</div>}>
            <RouteMap
              start={start}
              end={end}
              via={via}
              pickMode={pickMode}
              onPick={handlePick}
              routeGeometry={selectedCandidate?.geometry ?? null}
              weatherPoints={weatherPoints}
            />
          </Suspense>
        </div>
        <div className="h-32 border-t border-slate-200 bg-white md:h-1/3">
          <Suspense fallback={null}>
            <ElevationProfile elevation={selectedCandidate?.elevation ?? []} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
