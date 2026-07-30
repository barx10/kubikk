import { useState } from "react";
import type { PlannedRoute } from "../../types/route";
import { buildAppleMapsUrl, buildGoogleMapsUrl } from "../../lib/deepLinks";
import { downloadGpx } from "../../lib/gpx";
import { buildShareUrl } from "../../lib/shareLink";

interface ExportMenuProps {
  route: PlannedRoute | null;
  onSave: (name: string) => void;
}

export function ExportMenu({ route, onSave }: ExportMenuProps) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  if (!route) {
    return <p className="text-sm text-slate-500">Planlegg en rute for å eksportere eller lagre den.</p>;
  }

  async function handleShare() {
    if (!route) return;
    const url = buildShareUrl({ name: name || route.name, start: route.start, end: route.end, via: route.via });
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={buildGoogleMapsUrl(route)}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Google Maps
        </a>
        <a
          href={buildAppleMapsUrl(route.start, route.end)}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          title="Apple Maps støtter kun start og slutt, ingen via-punkter"
        >
          Apple Maps
        </a>
        <button
          type="button"
          onClick={() => downloadGpx(route)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Last ned GPX
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {copied ? "Lenke kopiert!" : "Del rute-lenke"}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Apple Maps viser kun start/slutt (ingen via-punkter støttes) — bruk GPX for eksakt rute på iOS. Google Maps
        kan avvike noe fra den planlagte ruten mellom via-punktene.
      </p>

      <div className="flex gap-2 border-t border-slate-100 pt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={route.name || "Navn på turen"}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        />
        <button
          type="button"
          onClick={() => onSave(name || route.name)}
          className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          Lagre
        </button>
      </div>
    </div>
  );
}
