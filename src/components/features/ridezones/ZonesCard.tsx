"use client";

import { calculateFtpZones } from "@/lib/tools/calculators";

const ZONE_COLORS = [
  "#545559",
  "#1FA396",
  "#D99A2B",
  "#EF5D5D",
  "#9C7BE8",
  "#C84E6E",
  "#8A8A92",
];

export function ZonesCard({ ftp, lthr }: { ftp: number; lthr?: number }) {
  const zones = calculateFtpZones(ftp, lthr);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-foreground-muted">
            <th className="py-2 pr-3 font-normal">Zone</th>
            <th className="py-2 pr-3 font-normal">Power</th>
            {lthr ? <th className="py-2 pr-3 font-normal">Heart rate</th> : null}
            <th className="py-2 font-normal">What it&apos;s for</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.zone} className="border-b border-white/5">
              <td className="py-2.5 pr-3 whitespace-nowrap">
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                  style={{ backgroundColor: ZONE_COLORS[zone.zone - 1] }}
                />
                <span className="font-heading uppercase tracking-wide text-off-white">
                  Z{zone.zone} {zone.name}
                </span>
              </td>
              <td className="py-2.5 pr-3 whitespace-nowrap text-off-white">
                {zone.maxWatts === null ? `${zone.minWatts}W+` : `${zone.minWatts}–${zone.maxWatts}W`}
              </td>
              {lthr ? (
                <td className="py-2.5 pr-3 whitespace-nowrap text-off-white">
                  {zone.minBpm === null
                    ? "—"
                    : zone.maxBpm === null
                      ? `${zone.minBpm}+ bpm`
                      : `${zone.minBpm}–${zone.maxBpm} bpm`}
                </td>
              ) : null}
              <td className="py-2.5 text-foreground-muted">{zone.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
