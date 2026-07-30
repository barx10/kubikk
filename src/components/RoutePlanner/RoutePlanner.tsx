import type { NamedPoint } from "../../types/route";
import { PICK_MODE_LABEL, type PickMode } from "../../types/pickMode";

interface RoutePlannerProps {
  start: NamedPoint | null;
  end: NamedPoint | null;
  via: NamedPoint[];
  pickMode: PickMode;
  onPickModeChange: (mode: PickMode) => void;
  onRemoveVia: (index: number) => void;
  onClear: () => void;
  onPlan: () => void;
  planning: boolean;
  error: string | null;
}

function fmt(point: NamedPoint): string {
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}

const MODE_BUTTONS: { mode: PickMode; label: string }[] = [
  { mode: "start", label: "Start" },
  { mode: "via", label: "Via-punkt" },
  { mode: "end", label: "Slutt" },
];

export function RoutePlanner({
  start,
  end,
  via,
  pickMode,
  onPickModeChange,
  onRemoveVia,
  onClear,
  onPlan,
  planning,
  error,
}: RoutePlannerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
        {MODE_BUTTONS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onPickModeChange(mode)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              pickMode === mode
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{PICK_MODE_LABEL[pickMode]}</p>

      <dl className="space-y-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Start</dt>
          <dd className="truncate font-medium text-slate-800">{start ? fmt(start) : "–"}</dd>
        </div>
        {via.map((point, i) => (
          <div key={i} className="flex justify-between gap-2">
            <dt className="text-slate-500">Via {i + 1}</dt>
            <dd className="flex items-center gap-2 font-medium text-slate-800">
              {fmt(point)}
              <button
                type="button"
                onClick={() => onRemoveVia(i)}
                className="text-slate-400 hover:text-red-500"
                aria-label={`Fjern via-punkt ${i + 1}`}
              >
                ✕
              </button>
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Slutt</dt>
          <dd className="truncate font-medium text-slate-800">{end ? fmt(end) : "–"}</dd>
        </div>
      </dl>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPlan}
          disabled={!start || !end || planning}
          className="flex-1 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-orange-500"
        >
          {planning ? "Planlegger…" : "Planlegg svingete rute"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Nullstill
        </button>
      </div>
    </div>
  );
}
