"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

function calculateEA(
  weightKg: number,
  bodyFatPercent: number,
  dailyCalories: number,
  trainingHoursPerWeek: number,
  avgIntensity: "low" | "moderate" | "high"
): {
  ea: number;
  risk: "optimal" | "concern" | "high-risk";
  fatFreeMass: number;
  exerciseExpenditure: number;
  interpretation: string;
} {
  const fatFreeMass = weightKg * (1 - bodyFatPercent / 100);
  const calPerHour: Record<string, number> = {
    low: weightKg * 6,
    moderate: weightKg * 9,
    high: weightKg * 12,
  };
  const dailyTrainingHours = trainingHoursPerWeek / 7;
  const exerciseExpenditure = calPerHour[avgIntensity] * dailyTrainingHours;
  const ea = (dailyCalories - exerciseExpenditure) / fatFreeMass;

  let risk: "optimal" | "concern" | "high-risk";
  let interpretation: string;

  if (ea >= 45) {
    risk = "optimal";
    interpretation = "Your energy availability is in a healthy range. You're fuelling your training adequately. Keep doing what you're doing.";
  } else if (ea >= 30) {
    risk = "concern";
    interpretation = "Your energy availability is below optimal but above the danger zone. You may be able to lose body fat at this level, but monitor fatigue, mood, and performance closely. Don't stay here long-term.";
  } else {
    risk = "high-risk";
    interpretation = "Your energy availability is dangerously low. This puts you at risk of Relative Energy Deficiency in Sport (RED-S) — which can cause hormonal disruption, bone density loss, immune suppression, and performance decline. Increase your caloric intake immediately.";
  }

  return {
    ea: Math.round(ea * 10) / 10,
    risk,
    fatFreeMass: Math.round(fatFreeMass * 10) / 10,
    exerciseExpenditure: Math.round(exerciseExpenditure),
    interpretation,
  };
}

export default function EnergyAvailabilityPage() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [calories, setCalories] = useState("");
  const [hours, setHours] = useState("");
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [result, setResult] = useState<ReturnType<typeof calculateEA> | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    const cal = parseInt(calories);
    const h = parseFloat(hours);
    if (w > 0 && bf > 0 && bf < 50 && cal > 0 && h > 0) {
      setResult(calculateEA(w, bf, cal, h, intensity));
    }
  };

  const riskColors = { optimal: "#22C55E", concern: "#EAB308", "high-risk": "#EF4444" };
  const riskLabels = { optimal: "OPTIMAL", concern: "LOW — MONITOR CLOSELY", "high-risk": "DANGEROUSLY LOW" };

  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              ENERGY AVAILABILITY CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Are you eating enough to support your training? Check your EA score and RED-S risk.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">BODY WEIGHT (KG)</label>
                <input type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">BODY FAT %</label>
                <input type="number" min="4" max="45" step="0.5" placeholder="e.g. 15"
                  value={bodyFat} onChange={(e) => { setBodyFat(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">DAILY CALORIE INTAKE</label>
                <p className="text-xs text-foreground-subtle mb-2">Average across the week. Estimate is fine.</p>
                <input type="number" min="1000" max="6000" step="50" placeholder="e.g. 2500"
                  value={calories} onChange={(e) => { setCalories(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">TRAINING HOURS PER WEEK</label>
                <input type="number" min="1" max="30" step="0.5" placeholder="e.g. 10"
                  value={hours} onChange={(e) => { setHours(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">AVERAGE TRAINING INTENSITY</label>
                <div className="grid grid-cols-3 gap-2">
                  {([["low", "Low (Z1-2)"], ["moderate", "Moderate (Z2-3)"], ["high", "High (Z4+)"]] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setIntensity(val); setResult(null); }}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        intensity === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {result && (
              <div className="mt-8 space-y-4">
                <h2 className="font-heading text-2xl text-off-white">YOUR ENERGY AVAILABILITY</h2>

                <div className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center">
                  <p className="font-heading text-6xl mb-2" style={{ color: riskColors[result.risk] }}>
                    {result.ea}
                  </p>
                  <p className="text-foreground-muted text-sm">kcal/kg FFM/day</p>
                  <p className="font-heading text-lg mt-3" style={{ color: riskColors[result.risk] }}>
                    {riskLabels[result.risk]}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">FAT-FREE MASS</p>
                    <p className="font-heading text-2xl text-off-white">{result.fatFreeMass}kg</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
                    <p className="text-xs text-foreground-subtle mb-1">EST. DAILY EXERCISE BURN</p>
                    <p className="font-heading text-2xl text-off-white">{result.exerciseExpenditure}kcal</p>
                  </div>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">WHAT THIS MEANS</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{result.interpretation}</p>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">THE SCALE</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground-muted"><span style={{ color: "#22C55E" }}>45+ kcal/kg FFM/day</span> — Optimal. Full adaptation, full recovery.</p>
                    <p className="text-foreground-muted"><span style={{ color: "#EAB308" }}>30-45 kcal/kg FFM/day</span> — Low. May impair adaptation. Monitor closely.</p>
                    <p className="text-foreground-muted"><span style={{ color: "#EF4444" }}>&lt;30 kcal/kg FFM/day</span> — Dangerously low. RED-S risk. Increase intake.</p>
                  </div>
                </div>

                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">GET YOUR NUTRITION RIGHT</h3>
                  <p className="text-foreground-muted mb-6">
                    Anthony&apos;s approach: eat more of the right things, not less of everything.
                    The community includes nutrition guidance based on the same science.
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
