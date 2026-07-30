import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ElevationPoint } from "../../types/route";

interface ElevationProfileProps {
  elevation: ElevationPoint[];
}

export function ElevationProfile({ elevation }: ElevationProfileProps) {
  if (elevation.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500">
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
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="km" unit=" km" stroke="#6b7280" fontSize={11} />
          <YAxis stroke="#6b7280" fontSize={11} unit=" m" width={48} />
          <Tooltip
            contentStyle={{ background: "#1f2937", border: "1px solid #374151", fontSize: 12 }}
            labelFormatter={(km) => `${km} km`}
            formatter={(value: number) => [`${value} moh`, "Høyde"]}
          />
          <Area type="monotone" dataKey="moh" stroke="#f97316" fill="url(#elevationFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
