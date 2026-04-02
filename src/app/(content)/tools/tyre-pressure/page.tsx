"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

type Surface = "smooth" | "rough" | "gravel";
type Condition = "dry" | "wet";

function calculatePressure(
  riderWeight: number,
  bikeWeight: number,
  tyreWidth: number,
  surface: Surface,
  condition: Condition
): { front: number; rear: number } {
  const totalWeight = riderWeight + bikeWeight;
  const rearLoad = totalWeight * 0.55;
  const frontLoad = totalWeight * 0.45;

  // Base PSI from weight distribution and tyre width
  // Using a simplified model based on industry standards
  const widthFactor: Record<number, number> = {
    23: 1.15,
    25: 1.0,
    28: 0.88,
    30: 0.82,
    32: 0.76,
    35: 0.68,
    38: 0.62,
    40: 0.58,
    42: 0.55,
    45: 0.50,
  };

  const closest = Object.keys(widthFactor)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - tyreWidth) < Math.abs(prev - tyreWidth) ? curr : prev
    );

  const factor = widthFactor[closest] || 1.0;

  let rearPSI = rearLoad * factor * 0.95;
  let frontPSI = frontLoad * factor * 0.95;

  // Surface adjustments
  const surfaceModifier: Record<Surface, number> = {
    smooth: 1.0,
    rough: 0.92,
    gravel: 0.82,
  };
  rearPSI *= surfaceModifier[surface];
  frontPSI *= surfaceModifier[surface];

  // Wet conditions: reduce by 5-8%
  if (condition === "wet") {
    rearPSI *= 0.93;
    frontPSI *= 0.93;
  }

  // Clamp to reasonable ranges
  rearPSI = Math.max(25, Math.min(130, rearPSI));
  frontPSI = Math.max(25, Math.min(120, frontPSI));

  return {
    front: Math.round(frontPSI),
    rear: Math.round(rearPSI),
  };
}

export default function TyrePressurePage() {
  const [riderWeight, setRiderWeight] = useState("");
  const [bikeWeight, setBikeWeight] = useState("8.5");
  const [tyreWidth, setTyreWidth] = useState("25");
  const [surface, setSurface] = useState<Surface>("smooth");
  const [condition, setCondition] = useState<Condition>("dry");
  const [result, setResult] = useState<{ front: number; rear: number } | null>(null);

  const handleCalculate = () => {
    const rw = parseFloat(riderWeight);
    const bw = parseFloat(bikeWeight);
    const tw = parseInt(tyreWidth);
    if (rw > 0 && bw > 0 && tw > 0) {
      setResult(calculatePressure(rw, bw, tw, surface, condition));
    }
  };

  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              TYRE PRESSURE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Optimal front and rear PSI based on your weight, tyre width, road surface, and conditions.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Rider Weight */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">RIDER WEIGHT (KG)</label>
                <input
                  type="number" min="40" max="150" placeholder="e.g. 75"
                  value={riderWeight}
                  onChange={(e) => { setRiderWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors"
                />
              </div>

              {/* Bike Weight */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">BIKE WEIGHT (KG)</label>
                <input
                  type="number" min="5" max="20" step="0.1" placeholder="e.g. 8.5"
                  value={bikeWeight}
                  onChange={(e) => { setBikeWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors"
                />
              </div>

              {/* Tyre Width */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">TYRE WIDTH (MM)</label>
                <select
                  value={tyreWidth}
                  onChange={(e) => { setTyreWidth(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider focus:border-coral focus:outline-none transition-colors appearance-none"
                >
                  {[23, 25, 28, 30, 32, 35, 38, 40, 42, 45].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm</option>
                  ))}
                </select>
              </div>

              {/* Surface */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">ROAD SURFACE</label>
                <div className="flex gap-3">
                  {([["smooth", "Smooth"], ["rough", "Rough"], ["gravel", "Gravel"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setSurface(val); setResult(null); }}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        surface === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">CONDITIONS</label>
                <div className="flex gap-3">
                  {([["dry", "Dry"], ["wet", "Wet"]] as const).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setCondition(val); setResult(null); }}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        condition === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 space-y-4">
                <h2 className="font-heading text-2xl text-off-white">YOUR RECOMMENDED PRESSURE</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center">
                    <p className="text-sm text-foreground-subtle mb-1">FRONT</p>
                    <p className="font-heading text-5xl text-coral">{result.front}</p>
                    <p className="text-foreground-muted text-sm">PSI</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center">
                    <p className="text-sm text-foreground-subtle mb-1">REAR</p>
                    <p className="font-heading text-5xl text-coral">{result.rear}</p>
                    <p className="text-foreground-muted text-sm">PSI</p>
                  </div>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">WHY DIFFERENT FRONT AND REAR?</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    Your weight distribution on a road bike is roughly 45% front / 55% rear.
                    The rear tyre carries more load and needs higher pressure. Running slightly
                    lower pressure in the front improves grip and comfort without sacrificing rolling resistance.
                  </p>
                </div>

                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">WANT TO GET FASTER ON EVERY RIDE?</h3>
                  <p className="text-foreground-muted mb-6">
                    Tyre pressure is just one of the small details. Join the Clubhouse for the full system.
                  </p>
                  <Button href="/community/clubhouse" size="lg">Join the Clubhouse — Free</Button>
                </div>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
