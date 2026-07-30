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
      <div className="flex gap-2">
        {MODE_BUTTONS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onPickModeChange(mode)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              pickMode === mode
                ? "bg-orange-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{PICK_MODE_LABEL[pickMode]}</p>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-400">Start</dt>
          <dd className="truncate">{start ? fmt(start) : "–"}</dd>
        </div>
        {via.map((point, i) => (
          <div key={i} className="flex justify-between gap-2">
            <dt className="text-gray-400">Via {i + 1}</dt>
            <dd className="flex items-center gap-2">
              {fmt(point)}
              <button
                type="button"
                onClick={() => onRemoveVia(i)}
                className="text-gray-500 hover:text-red-400"
                aria-label={`Fjern via-punkt ${i + 1}`}
              >
                ✕
              </button>
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-2">
          <dt className="text-gray-400">Slutt</dt>
          <dd className="truncate">{end ? fmt(end) : "–"}</dd>
        </div>
      </dl>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPlan}
          disabled={!start || !end || planning}
          className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {planning ? "Planlegger…" : "Planlegg svingete rute"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
        >
          Nullstill
        </button>
      </div>
    </div>
  );
}
