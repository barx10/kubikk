import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ElevationPoint } from "../../types/route";

interface ElevationProfileProps {
  elevation: ElevationPoint[];
}

export function ElevationProfile({ elevation }: ElevationProfileProps) {
  if (elevation.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
        Planlegg en rute for å se høydeprofilen
      </div>
    );
  }

  const data = elevation.map((p) => ({ km: Number(p.distanceKm.toFixed(1)), moh: Math.round(p.elevationM) }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis dataKey="km" unit=" km" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} unit=" m" width={48} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#1e293b" }}
            itemStyle={{ color: "#ea580c" }}
            labelFormatter={(km) => `${km} km`}
            formatter={(value: number) => [`${value} moh`, "Høyde"]}
          />
          <Area type="monotone" dataKey="moh" stroke="#f97316" fill="url(#elevationFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
