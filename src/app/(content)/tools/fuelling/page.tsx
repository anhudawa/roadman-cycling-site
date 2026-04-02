"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

type Intensity = "easy" | "moderate" | "hard" | "race";

function calculateFuelling(
  durationMin: number,
  intensity: Intensity,
  weightKg: number
): {
  carbsPerHour: string;
  totalCarbs: number;
  fluidPerHour: string;
  totalFluid: number;
  sodiumPerHour: number;
  strategy: string;
} {
  const hours = durationMin / 60;

  // Carbs per hour based on duration and intensity
  let carbsPerHourMin: number;
  let carbsPerHourMax: number;

  if (durationMin < 60) {
    carbsPerHourMin = 0;
    carbsPerHourMax = 30;
  } else if (durationMin < 90) {
    carbsPerHourMin = 30;
    carbsPerHourMax = 60;
  } else if (durationMin < 180) {
    carbsPerHourMin = 60;
    carbsPerHourMax = 90;
  } else {
    carbsPerHourMin = 80;
    carbsPerHourMax = 120;
  }

  // Intensity modifier
  const intensityMod: Record<Intensity, number> = {
    easy: 0.7,
    moderate: 0.85,
    hard: 1.0,
    race: 1.1,
  };

  carbsPerHourMin = Math.round(carbsPerHourMin * intensityMod[intensity]);
  carbsPerHourMax = Math.round(carbsPerHourMax * intensityMod[intensity]);
  const totalCarbs = Math.round(((carbsPerHourMin + carbsPerHourMax) / 2) * hours);

  // Fluid: 500-750ml/hr, adjusted slightly for intensity
  const fluidBase = intensity === "race" || intensity === "hard" ? 700 : 550;
  const totalFluid = Math.round((fluidBase * hours) / 100) / 10;

  // Sodium: ~500-700mg per hour
  const sodiumPerHour = intensity === "race" || intensity === "hard" ? 700 : 500;

  // Strategy
  let strategy = "";
  if (durationMin < 60) {
    strategy = "Under 60 minutes: water is enough. Maybe a gel in the last 15 minutes if it's a race effort. Don't overthink this one.";
  } else if (durationMin < 90) {
    strategy = "60-90 minutes: start fuelling from the 30-minute mark. A gel or a few swigs of energy drink every 20 minutes. Sip, don't gulp.";
  } else if (durationMin < 180) {
    strategy = "90 minutes to 3 hours: this is where fuelling becomes critical. Start early (within first 20 minutes), aim for a mix of gels, bars, and energy drink. Set a timer if you need to — most people underfuel because they forget.";
  } else {
    strategy = "3+ hours: you need a fuelling plan, not just good intentions. Mix glucose and fructose sources (2:1 ratio) to absorb more carbs per hour. Alternate between gels, bars, and real food. Front-load your fuelling — it's much harder to catch up than to stay on top.";
  }

  return {
    carbsPerHour: carbsPerHourMax > 0 ? `${carbsPerHourMin}–${carbsPerHourMax}g` : "0–30g",
    totalCarbs,
    fluidPerHour: `${fluidBase}ml`,
    totalFluid,
    sodiumPerHour,
    strategy,
  };
}

export default function FuellingPage() {
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateFuelling> | null>(null);

  const handleCalculate = () => {
    const d = parseInt(duration);
    const w = parseFloat(weight);
    if (d > 0 && w > 0) {
      setResult(calculateFuelling(d, intensity, w));
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
              IN-RIDE FUELLING CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Exactly how many carbs and how much fluid you need per hour. Stop bonking. Start fuelling properly.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">RIDE DURATION (MINUTES)</label>
                <input type="number" min="15" max="600" placeholder="e.g. 180"
                  value={duration} onChange={(e) => { setDuration(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">INTENSITY</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    ["easy", "Easy (Z2)"],
                    ["moderate", "Moderate (Z3)"],
                    ["hard", "Hard (Z4-5)"],
                    ["race", "Race"],
                  ] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setIntensity(val); setResult(null); }}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        intensity === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">BODY WEIGHT (KG)</label>
                <input type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {result && (
              <div className="mt-8 space-y-4">
                <h2 className="font-heading text-2xl text-off-white">YOUR FUELLING PLAN</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">CARBS/HOUR</p>
                    <p className="font-heading text-2xl text-coral">{result.carbsPerHour}</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">FLUID/HOUR</p>
                    <p className="font-heading text-2xl text-coral">{result.fluidPerHour}</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">TOTAL CARBS</p>
                    <p className="font-heading text-2xl text-coral">{result.totalCarbs}g</p>
                  </div>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">STRATEGY</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{result.strategy}</p>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">SODIUM</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    Aim for ~{result.sodiumPerHour}mg sodium per hour, especially in hot conditions or rides over 2 hours.
                    Electrolyte tablets in one bottle, energy drink or plain water in the other.
                  </p>
                </div>

                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">NUTRITION IS THE FOURTH DISCIPLINE</h3>
                  <p className="text-foreground-muted mb-6">
                    Most cyclists train hard and fuel poorly. Get the full nutrition framework inside the Clubhouse.
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
