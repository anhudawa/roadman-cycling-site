"use client";

import { useState, useMemo } from "react";
import { EmbedFrame } from "@/components/embed/EmbedFrame";
import {
  calculateSportiveTime,
  formatHms,
  SPORTIVE_EVENTS,
  type SportiveEventKey,
} from "@/lib/tools/calculators";

const DEFAULT_FTP = 250;
const DEFAULT_WEIGHT = 75;

export default function RacePredictorEmbedPage() {
  const [ftpInput, setFtpInput] = useState(String(DEFAULT_FTP));
  const [weightInput, setWeightInput] = useState(String(DEFAULT_WEIGHT));
  const [eventKey, setEventKey] = useState<SportiveEventKey>("etape");
  const [customDistance, setCustomDistance] = useState("100");
  const [customElevation, setCustomElevation] = useState("1500");
  const [pacingPercent, setPacingPercent] = useState(75);

  const ftp = parseInt(ftpInput, 10);
  const weight = parseFloat(weightInput);
  const ftpValid = ftp >= 100 && ftp <= 500;
  const weightValid = weight >= 40 && weight <= 150;

  const event = useMemo(() => {
    if (eventKey === "custom") {
      const d = parseFloat(customDistance);
      const e = parseFloat(customElevation);
      if (!Number.isFinite(d) || !Number.isFinite(e) || d < 5 || d > 600) return null;
      return {
        name: "Custom event",
        distanceKm: d,
        elevationM: Math.max(0, e),
      };
    }
    const preset = SPORTIVE_EVENTS.find((e) => e.key === eventKey);
    return preset ?? null;
  }, [eventKey, customDistance, customElevation]);

  const result = useMemo(() => {
    if (!ftpValid || !weightValid || !event) return null;
    return calculateSportiveTime({
      ftp,
      weightKg: weight,
      distanceKm: event.distanceKm,
      elevationM: event.elevationM,
      pacingPercent,
    });
  }, [ftp, ftpValid, weight, weightValid, event, pacingPercent]);

  return (
    <EmbedFrame
      title="Sportive Finish Time"
      toolPath="/tools/race-predictor"
      utmSource="embed_race_predictor"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
              FTP (W)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={500}
              value={ftpInput}
              onChange={(e) => setFtpInput(e.target.value)}
              className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
              Weight (kg)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={40}
              max={150}
              step={0.5}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
            Event
          </span>
          <select
            value={eventKey}
            onChange={(e) => setEventKey(e.target.value as SportiveEventKey)}
            className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
          >
            {SPORTIVE_EVENTS.map((e) => (
              <option key={e.key} value={e.key}>
                {e.name} — {e.distanceKm}km / {e.elevationM}m
              </option>
            ))}
            <option value="custom">Custom — enter your own</option>
          </select>
        </label>

        {eventKey === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
                Distance (km)
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={5}
                max={600}
                value={customDistance}
                onChange={(e) => setCustomDistance(e.target.value)}
                className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
                Elevation (m)
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={15000}
                value={customElevation}
                onChange={(e) => setCustomElevation(e.target.value)}
                className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
              />
            </label>
          </div>
        )}

        <label className="block">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5]">
              Pacing (% of FTP)
            </span>
            <span className="text-xs font-mono tabular-nums text-[#FAFAFA]">
              {pacingPercent}%
            </span>
          </div>
          <input
            type="range"
            min={55}
            max={90}
            step={1}
            value={pacingPercent}
            onChange={(e) => setPacingPercent(parseInt(e.target.value, 10))}
            className="w-full accent-[#F16363]"
          />
          <div className="flex justify-between text-[9px] text-[#7F7F85] mt-0.5">
            <span>Survive</span>
            <span>Endurance</span>
            <span>Race</span>
          </div>
        </label>

        {!ftpValid || !weightValid ? (
          <p className="text-xs text-[#F16363]">
            Enter FTP (100–500W) and weight (40–150kg).
          </p>
        ) : result && event ? (
          <div className="rounded-md bg-[#2E2E30] border border-white/10 p-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5]">
                Predicted finish
              </span>
              <span className="font-heading text-3xl text-[#F16363] tracking-wider">
                {formatHms(result.totalSeconds)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
              <div>
                <div className="font-mono tabular-nums text-sm">
                  {result.averageSpeedKph.toFixed(1)}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-[#7F7F85]">
                  km/h avg
                </div>
              </div>
              <div>
                <div className="font-mono tabular-nums text-sm">
                  {result.wattsPerKg.toFixed(2)}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-[#7F7F85]">
                  W/kg
                </div>
              </div>
              <div>
                <div className="font-mono tabular-nums text-sm">
                  {Math.round(result.averagePowerW)}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-[#7F7F85]">
                  Avg watts
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#7F7F85] leading-relaxed pt-1">
              Estimate uses a 6%-climb course model and standard tarmac at sea
              level. Real-world time varies with wind, group dynamics and
              fuelling.
            </p>
          </div>
        ) : null}
      </div>
    </EmbedFrame>
  );
}
