"use client";

import { motion } from "framer-motion";

interface Zone {
  name: string;
  shortName: string;
  minWatts: number;
  maxWatts: number | null;
  color: string;
}

interface ZoneChartProps {
  zones: Zone[];
  ftp: number;
}

/**
 * Visual bar chart showing power zones as stacked horizontal bars.
 * Each zone animates in from the left with a stagger.
 * The width of each bar represents the zone's power range relative to max.
 */
export function ZoneChart({ zones, ftp }: ZoneChartProps) {
  const maxPower = Math.round(ftp * 1.7);

  return (
    <div className="space-y-2">
      {zones.map((zone, i) => {
        const min = zone.minWatts;
        const max = zone.maxWatts || maxPower;
        const widthPercent = Math.min(((max - min) / maxPower) * 100, 100);
        const leftPercent = (min / maxPower) * 100;

        return (
          <motion.div
            key={zone.name}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3">
              {/* Zone label */}
              <div className="w-8 shrink-0 text-right">
                <span
                  className="font-heading text-sm"
                  style={{ color: zone.color }}
                >
                  Z{i + 1}
                </span>
              </div>

              {/* Bar container */}
              <div className="flex-1 h-10 bg-white/[0.03] rounded-lg relative overflow-hidden">
                {/* Filled bar */}
                <motion.div
                  className="absolute top-0 bottom-0 rounded-lg flex items-center"
                  style={{
                    left: `${leftPercent}%`,
                    backgroundColor: zone.color,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      boxShadow: `0 0 20px ${zone.color}`,
                    }}
                  />
                </motion.div>

                {/* Power range text overlay */}
                <div className="absolute inset-0 flex items-center px-3 justify-between pointer-events-none">
                  <span className="text-xs text-off-white font-medium z-10 drop-shadow-sm">
                    {zone.shortName}
                  </span>
                  <span className="text-xs text-off-white/80 font-heading z-10 drop-shadow-sm">
                    {zone.maxWatts
                      ? `${min}$–${max}W`
                      : `${min}W+`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* FTP marker line */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-8" />
        <div className="flex-1 relative h-6">
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-off-white"
            style={{ left: `${(ftp / maxPower) * 100}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
          <motion.div
            className="absolute -top-1"
            style={{ left: `${(ftp / maxPower) * 100}%`, transform: "translateX(-50%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            <span className="text-[10px] text-off-white font-heading bg-charcoal px-1.5 py-0.5 rounded border border-white/10">
              FTP {ftp}W
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
