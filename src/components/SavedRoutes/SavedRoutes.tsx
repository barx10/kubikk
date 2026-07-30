import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db, deleteRoute, renameRoute } from "../../lib/db";
import type { PlannedRoute } from "../../types/route";

interface SavedRoutesProps {
  onLoad: (route: PlannedRoute) => void;
}

export function SavedRoutes({ onLoad }: SavedRoutesProps) {
  const routes = useLiveQuery(() => db.routes.orderBy("createdAt").reverse().toArray(), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  if (!routes || routes.length === 0) {
    return <p className="text-sm text-slate-500">Ingen lagrede turer ennå.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {routes.map((route) => (
        <li key={route.id} className="flex items-center justify-between gap-2 py-2.5">
          {editingId === route.id ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => {
                void renameRoute(route.id, draftName || route.name);
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => onLoad(route)}
              className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 hover:text-orange-600"
              title="Last inn denne ruten"
            >
              {route.name} <span className="font-normal text-slate-400">· {route.distanceKm.toFixed(0)} km</span>
            </button>
          )}
          <div className="flex shrink-0 gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                setEditingId(route.id);
                setDraftName(route.name);
              }}
              className="hover:text-slate-700"
            >
              Endre navn
            </button>
            <button
              type="button"
              onClick={() => void deleteRoute(route.id)}
              className="hover:text-red-500"
            >
              Slett
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
