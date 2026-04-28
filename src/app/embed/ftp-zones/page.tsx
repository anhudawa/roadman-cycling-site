"use client";

import { useState } from "react";
import { EmbedFrame } from "@/components/embed/EmbedFrame";
import { calculateFtpZones } from "@/lib/tools/calculators";

const ZONE_COLOURS = [
  "#94A3B8", // Z1 active recovery
  "#3B82F6", // Z2 endurance
  "#22C55E", // Z3 tempo
  "#EAB308", // Z4 threshold
  "#F97316", // Z5 vo2
  "#EF4444", // Z6 anaerobic
  "#DC2626", // Z7 neuromuscular
];

export default function FtpZonesEmbedPage() {
  const [ftpInput, setFtpInput] = useState("");
  const ftp = parseInt(ftpInput, 10);
  const valid = ftp >= 50 && ftp <= 600;
  const zones = valid ? calculateFtpZones(ftp) : [];

  return (
    <EmbedFrame title="FTP Power Zones" toolPath="/tools/ftp-zones" utmSource="embed_ftp_zones">
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[#B0B0B5] block mb-1">
            Your FTP (watts)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={50}
            max={600}
            placeholder="e.g. 250"
            value={ftpInput}
            onChange={(e) => setFtpInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-base placeholder:text-[#7F7F85] focus:outline-none focus:border-[#F16363]"
          />
          {ftpInput && !valid && (
            <span className="text-xs text-[#F16363] mt-1 block">
              Enter an FTP between 50 and 600 W.
            </span>
          )}
        </label>

        {valid && (
          <ul className="space-y-1.5" aria-label="Power zones">
            {zones.map((z, i) => (
              <li
                key={z.zone}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-[#2E2E30] border-l-4"
                style={{ borderLeftColor: ZONE_COLOURS[i] }}
              >
                <div className="min-w-0">
                  <div className="font-heading tracking-wider text-sm">
                    Z{z.zone} — {z.name}
                  </div>
                  <div className="text-[11px] text-[#B0B0B5]">
                    {z.minPercentFtp}
                    {z.maxPercentFtp !== null ? `–${z.maxPercentFtp}` : "+"}% FTP
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-mono tabular-nums text-sm text-[#FAFAFA]">
                    {z.minWatts}
                    {z.maxWatts !== null ? `–${z.maxWatts}` : "+"}
                  </div>
                  <div className="text-[10px] text-[#7F7F85] uppercase tracking-wider">
                    watts
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!valid && (
          <p className="text-xs text-[#B0B0B5] leading-relaxed">
            Enter your Functional Threshold Power to see your seven training
            zones. Use a recent 20-minute test power × 0.95, or take it from
            your Vekta / TrainerRoad FTP test.
          </p>
        )}
      </div>
    </EmbedFrame>
  );
}
