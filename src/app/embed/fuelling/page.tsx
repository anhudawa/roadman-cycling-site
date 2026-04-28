"use client";

import { useState, useMemo } from "react";
import { EmbedFrame } from "@/components/embed/EmbedFrame";
import {
  calculateFuelling,
  FUELLING_SESSION_PROFILES,
  type FuellingSessionType,
  type FuellingGutTraining,
} from "@/lib/tools/calculators";

const SESSION_OPTIONS: FuellingSessionType[] = [
  "endurance",
  "tempo",
  "sweetspot",
  "threshold",
  "race",
];

export default function FuellingEmbedPage() {
  const [weightInput, setWeightInput] = useState("75");
  const [durationInput, setDurationInput] = useState("180");
  const [wattsInput, setWattsInput] = useState("200");
  const [sessionType, setSessionType] = useState<FuellingSessionType>("endurance");
  const [gut, setGut] = useState<FuellingGutTraining>("some");

  const weight = parseFloat(weightInput);
  const duration = parseInt(durationInput, 10);
  const watts = parseInt(wattsInput, 10);
  const valid =
    weight >= 30 && weight <= 200
    && duration >= 10 && duration <= 720
    && watts >= 30 && watts <= 600;

  const result = useMemo(() => {
    if (!valid) return null;
    return calculateFuelling({
      durationMin: duration,
      sessionType,
      targetWatts: watts,
      weightKg: weight,
      gutTraining: gut,
    });
  }, [valid, duration, sessionType, watts, weight, gut]);

  return (
    <EmbedFrame
      title="Carbs / Hour Fuelling"
      toolPath="/tools/fuelling"
      utmSource="embed_fuelling"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
              Weight (kg)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={30}
              max={200}
              step={0.5}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
              Duration (min)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={10}
              max={720}
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
              Avg watts
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={30}
              max={600}
              value={wattsInput}
              onChange={(e) => setWattsInput(e.target.value)}
              className="w-full px-2 py-2 rounded-md bg-[#1B1B1C] border border-white/10 text-[#FAFAFA] text-sm focus:outline-none focus:border-[#F16363]"
            />
          </label>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
            Session type
          </span>
          <div className="grid grid-cols-5 gap-1">
            {SESSION_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSessionType(s)}
                className={[
                  "px-1 py-1.5 rounded-md text-[10px] font-heading tracking-wider uppercase transition-colors border",
                  sessionType === s
                    ? "bg-[#F16363] border-[#F16363] text-[#FAFAFA]"
                    : "bg-[#1B1B1C] border-white/10 text-[#B0B0B5] hover:border-white/30",
                ].join(" ")}
              >
                {FUELLING_SESSION_PROFILES[s].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#B0B0B5] block mb-1">
            Gut training
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(["none", "some", "trained"] as FuellingGutTraining[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGut(g)}
                className={[
                  "px-1 py-1.5 rounded-md text-[10px] font-heading tracking-wider uppercase transition-colors border",
                  gut === g
                    ? "bg-[#4C1273] border-[#4C1273] text-[#FAFAFA]"
                    : "bg-[#1B1B1C] border-white/10 text-[#B0B0B5] hover:border-white/30",
                ].join(" ")}
              >
                {g === "none" ? "None" : g === "some" ? "Some" : "Trained"}
              </button>
            ))}
          </div>
        </div>

        {!valid ? (
          <p className="text-xs text-[#F16363]">
            Weight 30–200kg · Duration 10–720min · Watts 30–600W.
          </p>
        ) : result ? (
          <div className="rounded-md bg-[#2E2E30] border border-white/10 p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Carbs / hr" value={`${result.carbsPerHour}g`} accent />
              <Stat label="Fluid / hr" value={`${result.fluidPerHour}ml`} />
              <Stat label="Sodium / hr" value={`${result.sodiumPerHour}mg`} />
            </div>
            <div className="text-[10px] text-[#B0B0B5] leading-relaxed pt-1 border-t border-white/5">
              <strong className="text-[#FAFAFA]">Total:</strong>{" "}
              {result.totalCarbs}g carbs · {result.totalFluid}L fluid over{" "}
              {duration}min.
              {result.dualSource ? (
                <>
                  {" "}
                  <strong className="text-[#FAFAFA]">Use 1:0.8 glucose:fructose</strong>{" "}
                  ({result.glucosePerHour}g + {result.fructosePerHour}g).
                </>
              ) : null}
              {" "}Start at <strong className="text-[#FAFAFA]">{result.startFuellingAt}min</strong>,
              feed every {result.feedingInterval}min.
            </div>
          </div>
        ) : null}
      </div>
    </EmbedFrame>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={[
          "font-mono tabular-nums text-lg",
          accent ? "text-[#F16363]" : "text-[#FAFAFA]",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-[#7F7F85]">
        {label}
      </div>
    </div>
  );
}
