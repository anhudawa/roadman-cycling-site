"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

type EventType = "road-race" | "gran-fondo" | "hill-climb" | "time-trial" | "gravel";

function calculateRaceWeight(
  heightCm: number,
  currentWeightKg: number,
  bodyFatPercent: number,
  eventType: EventType
): {
  targetWeightMin: number;
  targetWeightMax: number;
  targetBfMin: number;
  targetBfMax: number;
  currentPowerToWeight: string;
  weeksToTarget: number;
  approach: string;
} {
  // Target body fat ranges by event type (competitive amateur)
  const targetBf: Record<EventType, [number, number]> = {
    "road-race": [8, 12],
    "gran-fondo": [10, 14],
    "hill-climb": [7, 10],
    "time-trial": [10, 14],
    "gravel": [10, 15],
  };

  const [bfMin, bfMax] = targetBf[eventType];
  const leanMass = currentWeightKg * (1 - bodyFatPercent / 100);
  const targetMin = leanMass / (1 - bfMax / 100);
  const targetMax = leanMass / (1 - bfMin / 100);

  // Estimate weeks at safe rate (0.5% body weight per week)
  const weightToLose = Math.max(0, currentWeightKg - (targetMin + targetMax) / 2);
  const weeklyLoss = currentWeightKg * 0.005;
  const weeks = weeklyLoss > 0 ? Math.ceil(weightToLose / weeklyLoss) : 0;

  // Simple W/kg estimate (assuming ~3.5 W/kg as baseline)
  const estimatedFTP = currentWeightKg * 3.2;
  const currentWkg = (estimatedFTP / currentWeightKg).toFixed(1);

  let approach = "";
  if (weeks === 0) {
    approach = "You're already within your target race weight range. Focus on maintaining body composition while building power.";
  } else if (weeks <= 8) {
    approach = "A moderate deficit through better food quality and fuelling timing. No need to restrict calories — just eat smarter around your training.";
  } else if (weeks <= 16) {
    approach = "A structured body composition phase. Focus on protein adequacy (1.6-2.2g/kg), fuelling your key sessions, and creating a small deficit on easy days.";
  } else {
    approach = "A longer-term approach is needed. Prioritise slow, sustainable change — 0.5% body weight per week maximum. Faster than that and you risk losing power, getting sick, or developing an unhealthy relationship with food.";
  }

  return {
    targetWeightMin: Math.round(targetMin * 10) / 10,
    targetWeightMax: Math.round(targetMax * 10) / 10,
    targetBfMin: bfMin,
    targetBfMax: bfMax,
    currentPowerToWeight: currentWkg,
    weeksToTarget: weeks,
    approach,
  };
}

export default function RaceWeightPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [eventType, setEventType] = useState<EventType>("road-race");
  const [result, setResult] = useState<ReturnType<typeof calculateRaceWeight> | null>(null);

  const handleCalculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    if (h > 0 && w > 0 && bf > 0 && bf < 50) {
      setResult(calculateRaceWeight(h, w, bf, eventType));
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
              RACE WEIGHT CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Your target weight range for peak cycling performance. Based on body composition, not BMI.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">HEIGHT (CM)</label>
                <input type="number" min="140" max="210" placeholder="e.g. 178"
                  value={height} onChange={(e) => { setHeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">CURRENT WEIGHT (KG)</label>
                <input type="number" min="40" max="150" step="0.1" placeholder="e.g. 82"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">BODY FAT %</label>
                <p className="text-xs text-foreground-subtle mb-2">Estimate is fine. Most male cyclists are 12-25%. Use a smart scale or caliper test for accuracy.</p>
                <input type="number" min="4" max="45" step="0.5" placeholder="e.g. 18"
                  value={bodyFat} onChange={(e) => { setBodyFat(e.target.value); setResult(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-heading text-lg text-off-white mb-2">TARGET EVENT</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    ["road-race", "Road Race"],
                    ["gran-fondo", "Gran Fondo"],
                    ["hill-climb", "Hill Climb"],
                    ["time-trial", "Time Trial"],
                    ["gravel", "Gravel"],
                  ] as const).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setEventType(val); setResult(null); }}
                      className={`py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        eventType === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            {result && (
              <div className="mt-8 space-y-4">
                <h2 className="font-heading text-2xl text-off-white">YOUR RACE WEIGHT RANGE</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center">
                    <p className="text-sm text-foreground-subtle mb-1">TARGET RANGE</p>
                    <p className="font-heading text-3xl text-coral">
                      {result.targetWeightMin}–{result.targetWeightMax}
                    </p>
                    <p className="text-foreground-muted text-sm">kg</p>
                  </div>
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center">
                    <p className="text-sm text-foreground-subtle mb-1">TARGET BODY FAT</p>
                    <p className="font-heading text-3xl text-coral">
                      {result.targetBfMin}–{result.targetBfMax}
                    </p>
                    <p className="text-foreground-muted text-sm">%</p>
                  </div>
                </div>

                {result.weeksToTarget > 0 && (
                  <div className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center">
                    <p className="text-sm text-foreground-subtle mb-1">ESTIMATED TIMELINE</p>
                    <p className="font-heading text-3xl text-coral">{result.weeksToTarget}</p>
                    <p className="text-foreground-muted text-sm">weeks (at safe rate)</p>
                  </div>
                )}

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">RECOMMENDED APPROACH</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{result.approach}</p>
                </div>

                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                  <h3 className="font-heading text-lg text-off-white mb-3">IMPORTANT</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    Race weight is about body composition, not the number on the scale.
                    Anthony lost 7kg in 12 weeks while eating <em>more</em> food — by focusing on food quality,
                    protein timing, and properly fuelling rides. Crash diets destroy power and health.
                    If you&apos;re unsure about your approach, the Not Done Yet community includes
                    nutrition guidance from the same principles discussed on the podcast.
                  </p>
                </div>

                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">BODY COMPOSITION IS THE HIDDEN LEVER</h3>
                  <p className="text-foreground-muted mb-6">
                    Most cyclists focus on power. The fastest route to a better power-to-weight ratio is often the weight side.
                    Get the approach right with expert guidance.
                  </p>
                  <Button href="/community/not-done-yet" size="lg">See Not Done Yet Plans</Button>
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
