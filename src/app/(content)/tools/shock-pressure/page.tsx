"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

type RidingStyle = "xc" | "trail" | "enduro" | "dh";

function calculateShockPressure(
  riderWeightKg: number,
  ridingStyle: RidingStyle
): {
  rearPSI: number;
  frontPSI: number;
  sagTarget: string;
  description: string;
} {
  // Approximate air spring pressure based on rider weight and style
  // These are starting points — actual setup requires sag measurement
  const styleConfig: Record<RidingStyle, { sagPercent: [number, number]; rearBase: number; frontBase: number }> = {
    xc: { sagPercent: [20, 25], rearBase: 0.95, frontBase: 0.9 },
    trail: { sagPercent: [25, 30], rearBase: 0.85, frontBase: 0.8 },
    enduro: { sagPercent: [28, 33], rearBase: 0.78, frontBase: 0.73 },
    dh: { sagPercent: [30, 35], rearBase: 0.72, frontBase: 0.67 },
  };

  const config = styleConfig[ridingStyle];
  const rearPSI = Math.round(riderWeightKg * config.rearBase + 15);
  const frontPSI = Math.round(riderWeightKg * config.frontBase + 10);

  const descriptions: Record<RidingStyle, string> = {
    xc: "Cross-country: firmer setup for efficiency on climbs. Less sag = more pedalling platform. Use lockout on smooth climbs.",
    trail: "Trail riding: balanced setup for climbing and descending. The all-rounder. Adjust rebound to match trail conditions.",
    enduro: "Enduro: softer setup to absorb big hits on descents. Slightly more sag for better small-bump sensitivity and grip.",
    dh: "Downhill: maximum plushness for high-speed impacts. Run more sag and slower rebound. Climbing efficiency doesn't matter here.",
  };

  return {
    rearPSI,
    frontPSI,
    sagTarget: `${config.sagPercent[0]}–${config.sagPercent[1]}%`,
    description: descriptions[ridingStyle],
  };
}

export default function ShockPressurePage() {
  const [weight, setWeight] = useState("");
  const [style, setStyle] = useState<RidingStyle>("trail");
  const [result, setResult] = useState<ReturnType<typeof calculateShockPressure> | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    if (w > 0) {
      setResult(calculateShockPressure(w, style));
    }
  };

  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              SHOCK PRESSURE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Starting air pressure and sag targets for your suspension. Based on rider weight and riding style.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">RIDER WEIGHT (KG)</label>
                <p className="text-xs text-foreground-subtle mb-2">Include riding gear (add ~3-5kg to body weight).</p>
                <input type="number" min="40" max="150" placeholder="e.g. 80"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">RIDING STYLE</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["xc", "Cross-Country"],
                    ["trail", "Trail"],
                    ["enduro", "Enduro"],
                    ["dh", "Downhill"],
                  ] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setStyle(val); setResult(null); }}
                      className={`py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        style === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {result && (
              <div className="mt-8 space-y-4">
                <h2 className="font-heading text-2xl text-off-white">YOUR STARTING SETUP</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">REAR SHOCK</p>
                    <p className="font-heading text-3xl text-coral">{result.rearPSI}</p>
                    <p className="text-foreground-muted text-sm">PSI</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">FRONT FORK</p>
                    <p className="font-heading text-3xl text-coral">{result.frontPSI}</p>
                    <p className="text-foreground-muted text-sm">PSI</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">TARGET SAG</p>
                    <p className="font-heading text-3xl text-coral">{result.sagTarget}</p>
                  </div>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">SETUP NOTES</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-3">{result.description}</p>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    <strong className="text-off-white">Important:</strong> These are starting points.
                    Set the pressure, then measure sag with a buddy holding you upright in riding position.
                    Adjust in 5 PSI increments until you hit the target sag percentage.
                    Your shock manufacturer&apos;s chart should be consulted as the primary reference.
                  </p>
                </div>

                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">BIKE SETUP IS PART OF THE SYSTEM</h3>
                  <p className="text-foreground-muted mb-6">
                    The Clubhouse covers equipment, fit, and setup alongside training and nutrition.
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
