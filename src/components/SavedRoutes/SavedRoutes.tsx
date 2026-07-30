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
    return <p className="text-sm text-gray-500">Ingen lagrede turer ennå.</p>;
  }

  return (
    <ul className="divide-y divide-gray-800">
      {routes.map((route) => (
        <li key={route.id} className="flex items-center justify-between gap-2 py-2">
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
              className="min-w-0 flex-1 rounded bg-gray-800 px-2 py-1 text-sm"
            />
          ) : (
            <button
              type="button"
              onClick={() => onLoad(route)}
              className="min-w-0 flex-1 truncate text-left text-sm hover:text-orange-400"
              title="Last inn denne ruten"
            >
              {route.name} <span className="text-gray-500">· {route.distanceKm.toFixed(0)} km</span>
            </button>
          )}
          <div className="flex shrink-0 gap-2 text-xs text-gray-500">
            <button
              type="button"
              onClick={() => {
                setEditingId(route.id);
                setDraftName(route.name);
              }}
              className="hover:text-gray-200"
            >
              Endre navn
            </button>
            <button
              type="button"
              onClick={() => void deleteRoute(route.id)}
              className="hover:text-red-400"
            >
              Slett
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
