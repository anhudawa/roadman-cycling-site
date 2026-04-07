"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

type GutTraining = "none" | "some" | "trained";
type SessionType = "recovery" | "endurance" | "tempo" | "sweetspot" | "threshold" | "vo2" | "race" | "intervals";

/**
 * Evidence-based fuelling calculator v3.
 *
 * Sources:
 * - James Morton (Liverpool John Moores / Team Sky): "Fuel for the work required"
 * - Sam Impey & David Dunne (Hexis): gut-training, periodised fuelling
 * - Asker Jeukendrup: dual-transporter model, carb absorption limits
 * - Baker et al. (2016): sweat sodium concentration data
 * - Sawka et al. (2007) ACSM: heat and fluid replacement
 */

interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  location: string;
}

interface FuellingResult {
  carbsPerHour: number;
  totalCarbs: number;
  fluidPerHour: number;
  totalFluid: number;
  sodiumPerHour: number;
  glucosePerHour: number;
  fructosePerHour: number;
  strategy: string[];
  feedingInterval: number;
  startFuellingAt: number;
  dualSource: boolean;
  heatCategory: "cool" | "mild" | "warm" | "hot";
  weatherNote: string | null;
  intensityLabel: string;
  intensityPercent: number;
}

// Session type → physiological profile
// Each session type has a known glycolytic demand and sweat characteristics
// regardless of what the average power reads. A VO2 session at 200W avg
// has VERY different fuelling needs than a Z2 ride at 200W avg.
const SESSION_PROFILES: Record<SessionType, {
  label: string;
  ftpRange: string;
  carbOxidation: number; // g/hr carb oxidation rate
  sweatMultiplier: number; // relative to baseline
  description: string;
}> = {
  recovery: {
    label: "Recovery Spin",
    ftpRange: "<55% FTP",
    carbOxidation: 20,
    sweatMultiplier: 0.7,
    description: "Easy spin, active recovery. Primarily fat oxidation.",
  },
  endurance: {
    label: "Endurance / Z2",
    ftpRange: "55-75% FTP",
    carbOxidation: 35,
    sweatMultiplier: 0.85,
    description: "Steady aerobic riding. Mixed fat and carb oxidation.",
  },
  tempo: {
    label: "Tempo / Z3",
    ftpRange: "76-87% FTP",
    carbOxidation: 55,
    sweatMultiplier: 1.0,
    description: "Sustained moderate effort. Meaningful glycogen use.",
  },
  sweetspot: {
    label: "Sweet Spot",
    ftpRange: "88-94% FTP",
    carbOxidation: 70,
    sweatMultiplier: 1.1,
    description: "Just below threshold. High glycolytic demand.",
  },
  threshold: {
    label: "Threshold / Z4",
    ftpRange: "95-105% FTP",
    carbOxidation: 85,
    sweatMultiplier: 1.2,
    description: "At or near FTP. Very high carb oxidation rate.",
  },
  vo2: {
    label: "VO2max Intervals",
    ftpRange: "106-120% FTP",
    carbOxidation: 95,
    sweatMultiplier: 1.3,
    description: "Repeated hard efforts with recovery. Highest glycolytic demand.",
  },
  intervals: {
    label: "Mixed Intervals",
    ftpRange: "Variable",
    carbOxidation: 75,
    sweatMultiplier: 1.15,
    description: "Varied intensity session (e.g. group ride, fartlek, crits). High avg carb burn from surges.",
  },
  race: {
    label: "Race / Sportive",
    ftpRange: "Variable, sustained",
    carbOxidation: 90,
    sweatMultiplier: 1.25,
    description: "Competitive effort with surges. Maximum fuelling needed.",
  },
};

function calculateFuelling(
  durationMin: number,
  sessionType: SessionType,
  weightKg: number,
  gutTraining: GutTraining,
  weather: WeatherData | null
): FuellingResult {
  const hours = durationMin / 60;
  const profile = SESSION_PROFILES[sessionType];

  const intensityLabel = profile.label;
  const intensityPercent = 0; // Not used for display when session-based

  // --- CARBOHYDRATE CALCULATION ---
  // Morton's "fuel for the work required": carb need matches glycolytic demand
  // Each session type has a known carb oxidation rate from Jeukendrup (2014)
  const carbOxidation = profile.carbOxidation;

  // Duration modifier: longer rides need slightly higher rates to preserve glycogen
  let durationMod: number;
  if (durationMin <= 60) durationMod = 0.7;       // Short — minimal need
  else if (durationMin <= 90) durationMod = 0.85;
  else if (durationMin <= 150) durationMod = 1.0;  // Standard
  else if (durationMin <= 240) durationMod = 1.05;
  else durationMod = 1.1;                           // Ultra — front-load

  // Gut training sets the ceiling
  const gutCeiling: Record<GutTraining, number> = {
    none: 70,     // Untrained gut — GI distress risk above this
    some: 90,     // Some practice — can handle moderate intake
    trained: 120, // Systematically trained — can push to max absorption
  };

  const rawCarbs = carbOxidation * durationMod;
  const carbsPerHour = Math.round(Math.min(gutCeiling[gutTraining], Math.max(0, rawCarbs)));
  const totalCarbs = Math.round(carbsPerHour * hours);

  // --- GLUCOSE:FRUCTOSE SPLIT ---
  // Morton/Jeukendrup: 1:0.8 ratio above 60g/hr via dual transporters
  const dualSource = carbsPerHour > 60;
  let glucosePerHour: number;
  let fructosePerHour: number;

  if (dualSource) {
    glucosePerHour = Math.round(carbsPerHour / 1.8);
    fructosePerHour = Math.round(carbsPerHour - glucosePerHour);
  } else {
    glucosePerHour = carbsPerHour;
    fructosePerHour = 0;
  }

  // --- HEAT CATEGORY (from weather) ---
  let heatCategory: "cool" | "mild" | "warm" | "hot";
  let heatMultiplier: number;
  let weatherNote: string | null = null;

  if (weather) {
    const heatIndex = weather.temperature + (weather.humidity > 60 ? (weather.humidity - 60) * 0.15 : 0);

    if (heatIndex < 12) {
      heatCategory = "cool";
      heatMultiplier = 0.8;
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — cool conditions.`;
    } else if (heatIndex < 22) {
      heatCategory = "mild";
      heatMultiplier = 1.0;
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — standard conditions.`;
    } else if (heatIndex < 30) {
      heatCategory = "warm";
      heatMultiplier = 1.25;
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — warm. Increase fluid and sodium.`;
    } else {
      heatCategory = "hot";
      heatMultiplier = 1.5;
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — hot. Significantly increase fluid and sodium. Pre-cool if possible.`;
    }
  } else {
    heatCategory = "mild";
    heatMultiplier = 1.0;
  }

  // --- FLUID ---
  // Sawka et al.: sweat rate scales with intensity and heat
  const baseFluidPerKg = 7 * profile.sweatMultiplier; // ~7ml/kg/hr baseline scaled by session type
  const rawFluid = Math.round(weightKg * baseFluidPerKg * heatMultiplier);
  const fluidPerHour = Math.max(300, Math.min(1200, rawFluid));
  const totalFluid = Math.round((fluidPerHour * hours) / 100) / 10;

  // --- SODIUM ---
  // Baker et al. (2016): sweat [Na+] ~900mg/L average, sweat rate ~0.5-2.0L/hr
  // Conservative base scaled by intensity and heat
  const sweatRateLHr = (fluidPerHour / 1000) * 1.4; // Estimate: drinking replaces ~70% of sweat
  const sweatSodiumConc = 800; // mg/L — moderate estimate (range 200-2000)
  const sodiumPerHour = Math.round(sweatRateLHr * sweatSodiumConc * (heatMultiplier > 1 ? 1 : 1));
  // Already captured by heatMultiplier in fluid → sweat rate estimate

  // --- TIMING ---
  const startFuellingAt = durationMin <= 60 ? 30 : durationMin <= 90 ? 20 : 15;
  const feedingInterval = carbsPerHour >= 80 ? 15 : 20;

  // --- STRATEGY ---
  const strategy: string[] = [];

  if (durationMin <= 45) {
    strategy.push(
      "Under 45 minutes: water is sufficient. A carbohydrate mouth rinse can improve performance by 2-3% without needing to digest anything (Chambers et al. 2009)."
    );
  } else if (durationMin <= 75) {
    strategy.push(
      `A ${profile.label.toLowerCase()} session for ${durationMin} minutes burns roughly ${carbsPerHour}g carbs/hr. Start fuelling at ${startFuellingAt} minutes with a gel or energy drink every 20 minutes.`
    );
  } else if (durationMin <= 150) {
    strategy.push(
      `A ${durationMin}-minute ${profile.label.toLowerCase()} session has a carb oxidation rate of ~${carbsPerHour}g/hr. Start within the first ${startFuellingAt} minutes — set a timer every ${feedingInterval} minutes.`
    );
    if (dualSource) {
      strategy.push(
        `At ${carbsPerHour}g/hr you need dual-source products (glucose + fructose at 1:0.8). Single-source glucose saturates at ~60g/hr — fructose uses the GLUT5 transporter independently.`
      );
    }
  } else {
    strategy.push(
      `${durationMin} minutes of ${profile.label.toLowerCase()} requires ${carbsPerHour}g carbs/hr — that's ~${Math.round(carbsPerHour / (60 / feedingInterval))}g every ${feedingInterval} minutes. Front-load your intake. It's far easier to maintain glycogen than recover from depletion.`
    );
    if (dualSource) {
      strategy.push(
        `Dual-source (glucose:fructose 1:0.8) is essential at this rate. Mix gels, energy drink, and real food (rice cakes, bars). Flavour fatigue is real after 3+ hours.`
      );
    }
  }

  if (sessionType === "intervals" || sessionType === "vo2") {
    strategy.push(
      "Interval sessions have high peak glycolytic demand during efforts, even if average power is moderate. Fuel for the efforts, not the recovery valleys — your muscles are burning through glycogen during those hard reps."
    );
  }

  if (gutTraining === "none" && carbsPerHour > 50) {
    strategy.push(
      `Your target is ${carbsPerHour}g/hr but without gut training, start at 40-50g/hr and build by 5-10g per week over 4-6 weeks (Impey, Hexis). The gut adapts — trained athletes absorb double what beginners tolerate.`
    );
  }

  if (heatCategory === "warm" || heatCategory === "hot") {
    strategy.push(
      `${heatCategory === "hot" ? "Hot" : "Warm"} conditions detected. Sweat rate increases 20-30% per 5°C above 20°C (Sawka et al.). Prioritise fluid and sodium — dehydration above 2% bodyweight meaningfully impairs performance.`
    );
  }

  return {
    carbsPerHour,
    totalCarbs,
    fluidPerHour,
    totalFluid,
    sodiumPerHour,
    glucosePerHour,
    fructosePerHour,
    strategy,
    feedingInterval,
    startFuellingAt,
    dualSource,
    heatCategory,
    weatherNote,
    intensityLabel,
    intensityPercent,
  };
}

// Validation
const VALIDATION = {
  duration: { min: 10, max: 720, label: "Duration", unit: " minutes" },
  weight: { min: 30, max: 200, label: "Body weight", unit: "kg" },
} as const;

function getValidationError(value: string, field: keyof typeof VALIDATION): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const { min, max, label, unit } = VALIDATION[field];
  if (num < min) return `${label} must be at least ${min}${unit}`;
  if (num > max) return `${label} must be under ${max}${unit}`;
  return null;
}

const heatColors: Record<string, string> = {
  cool: "text-blue-400",
  mild: "text-green-400",
  warm: "text-amber-400",
  hot: "text-red-400",
};

export default function FuellingPage() {
  const [duration, setDuration] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("endurance");
  const [weight, setWeight] = useState("");
  const [gutTraining, setGutTraining] = useState<GutTraining>("some");
  const [result, setResult] = useState<FuellingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Auto-fetch weather from Open-Meteo (free, no API key)
  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;

      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`),
      ]);

      const weatherData = await weatherRes.json();
      const geoData = await geoRes.json();
      const location = geoData.address?.city || geoData.address?.town || geoData.address?.county || "Your location";

      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        humidity: Math.round(weatherData.current.relative_humidity_2m),
        location,
      });
    } catch {
      setWeatherError("Location unavailable — using standard estimates for sodium and fluid.");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      fetchWeather();
    }
  }, [fetchWeather]);

  const durationError = getValidationError(duration, "duration");
  const weightError = getValidationError(weight, "weight");
  const hasErrors = !!durationError || !!weightError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const d = parseInt(duration);
    const wt = parseFloat(weight);
    if (d > 0 && wt > 0) {
      setResult(calculateFuelling(d, sessionType, wt, gutTraining, weather));
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const profile = SESSION_PROFILES[sessionType];
    const text = `Fuelling Plan: ${result.carbsPerHour}g carbs/hr (${result.dualSource ? `${result.glucosePerHour}g glucose + ${result.fructosePerHour}g fructose` : "single source"}), ${result.fluidPerHour}ml fluid/hr, ${result.sodiumPerHour}mg sodium/hr (${duration}min ${profile.label}, ${weight}kg${weather ? `, ${weather.temperature}°C` : ""}) — roadmancycling.com/tools/fuelling`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses = "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              IN-RIDE FUELLING CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Personalised carb, fluid, and sodium targets powered by your watts, weather, and gut readiness. Based on Morton, Jeukendrup, and Hexis research.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Weather banner */}
            {weather && (
              <motion.div
                className="mb-4 bg-background-elevated rounded-lg border border-white/5 px-4 py-3 flex items-center justify-between"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {weather.temperature <= 10 ? "🥶" : weather.temperature <= 20 ? "🌤" : weather.temperature <= 28 ? "☀️" : "🔥"}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {weather.location}: <span className={heatColors[weather.temperature <= 10 ? "cool" : weather.temperature <= 20 ? "mild" : weather.temperature <= 28 ? "warm" : "hot"]}>{weather.temperature}°C</span>, {weather.humidity}% humidity
                  </span>
                </div>
                <span className="text-[10px] text-foreground-subtle">LIVE WEATHER</span>
              </motion.div>
            )}
            {weatherLoading && (
              <div className="mb-4 bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                Fetching local weather for sodium & fluid estimates...
              </div>
            )}
            {weatherError && (
              <div className="mb-4 bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                {weatherError}
              </div>
            )}

            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Duration */}
              <div>
                <label htmlFor="fuel-duration" className="block font-heading text-sm text-off-white mb-2 tracking-wider">RIDE DURATION (MINUTES)</label>
                <input id="fuel-duration" type="number" min="15" max="600" placeholder="e.g. 180"
                  value={duration} onChange={(e) => { setDuration(e.target.value); setResult(null); }}
                  className={`${durationError ? errorInputClasses : inputClasses} text-xl`}
                />
                {durationError && <p className="text-red-400 text-xs mt-1">{durationError}</p>}
              </div>

              {/* Session Type */}
              <div>
                <label className="block font-heading text-sm text-off-white mb-1 tracking-wider">SESSION TYPE</label>
                <p className="text-foreground-subtle text-[11px] mb-3">
                  What kind of ride are you fuelling for? This determines carb oxidation rate more accurately than average watts.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(SESSION_PROFILES) as [SessionType, typeof SESSION_PROFILES[SessionType]][]).map(([key, profile]) => (
                    <button key={key} type="button"
                      onClick={() => { setSessionType(key); setResult(null); }}
                      className={`py-3 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                        sessionType === key ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span className="font-heading text-[11px] tracking-wider block leading-tight">{profile.label}</span>
                      <span className="text-[9px] opacity-60 block mt-0.5">{profile.ftpRange}</span>
                    </button>
                  ))}
                </div>
                {/* Selected session description */}
                <p className="text-foreground-subtle text-[11px] mt-2 italic">
                  {SESSION_PROFILES[sessionType].description}
                </p>
              </div>

              {/* Body Weight */}
              <div>
                <label htmlFor="fuel-weight" className="block font-heading text-sm text-off-white mb-2 tracking-wider">BODY WEIGHT (KG)</label>
                <input id="fuel-weight" type="number" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && <p className="text-red-400 text-xs mt-1">{weightError}</p>}
              </div>

              {/* Gut Training */}
              <div>
                <label className="block font-heading text-sm text-off-white mb-1 tracking-wider">GUT TRAINING LEVEL</label>
                <p className="text-foreground-subtle text-[11px] mb-3">
                  How practiced is your gut at absorbing carbs during exercise? This sets your ceiling. (Impey et al., Hexis)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["none", "Beginner", "Max ~70g/hr"],
                    ["some", "Moderate", "Max ~90g/hr"],
                    ["trained", "Trained", "Max ~120g/hr"],
                  ] as const).map(([val, label, desc]) => (
                    <button key={val} type="button"
                      onClick={() => { setGutTraining(val); setResult(null); }}
                      className={`py-3 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                        gutTraining === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span className="font-heading text-xs tracking-wider block">{label}</span>
                      <span className="text-[10px] opacity-70 block mt-0.5">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full">Calculate</Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-8 space-y-4"
                  key={`${result.carbsPerHour}-${result.totalCarbs}-${result.sodiumPerHour}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-off-white">YOUR FUELLING PLAN</h2>
                    <button
                      onClick={handleCopyResults}
                      className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  {/* Session badge */}
                  <div className="bg-white/[0.03] rounded-lg px-4 py-2 flex items-center justify-between">
                    <span className="text-foreground-subtle text-xs">SESSION TYPE</span>
                    <span className="font-heading text-off-white">{result.intensityLabel} <span className="text-foreground-subtle text-xs font-body">({SESSION_PROFILES[sessionType].ftpRange})</span></span>
                  </div>

                  {/* Primary metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">CARBS/HOUR</p>
                      <p className="font-heading text-3xl text-coral">{result.carbsPerHour}g</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">FLUID/HOUR</p>
                      <p className="font-heading text-3xl text-coral">{result.fluidPerHour}ml</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">~{result.totalFluid}L total</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">SODIUM/HOUR</p>
                      <p className={`font-heading text-3xl ${heatColors[result.heatCategory]}`}>{result.sodiumPerHour}mg</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">{result.heatCategory} conditions</p>
                    </motion.div>
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                    >
                      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">TOTAL CARBS</p>
                      <p className="font-heading text-3xl text-coral">{result.totalCarbs}g</p>
                      <p className="text-[10px] text-foreground-subtle mt-1">for entire ride</p>
                    </motion.div>
                  </div>

                  {/* Weather note */}
                  {result.weatherNote && (
                    <motion.div
                      className={`rounded-lg px-4 py-2.5 text-sm border ${
                        result.heatCategory === "hot" ? "bg-red-500/10 border-red-500/20 text-red-300" :
                        result.heatCategory === "warm" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" :
                        result.heatCategory === "cool" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" :
                        "bg-green-500/10 border-green-500/20 text-green-300"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.28 }}
                    >
                      {result.weatherNote}
                    </motion.div>
                  )}

                  {/* Glucose:Fructose split */}
                  {result.dualSource && (
                    <motion.div
                      className="bg-coral/10 rounded-xl border border-coral/20 p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.3 }}
                    >
                      <h3 className="font-heading text-xs text-coral mb-3 tracking-wider">GLUCOSE : FRUCTOSE SPLIT (1:0.8)</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-foreground-muted mb-1">
                            <span>Glucose (SGLT1)</span>
                            <span className="font-heading">{result.glucosePerHour}g/hr</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-coral rounded-full" style={{ width: `${(result.glucosePerHour / result.carbsPerHour) * 100}%` }} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-foreground-muted mb-1">
                            <span>Fructose (GLUT5)</span>
                            <span className="font-heading">{result.fructosePerHour}g/hr</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple rounded-full" style={{ width: `${(result.fructosePerHour / result.carbsPerHour) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Timing */}
                  <motion.div
                    className="bg-background-elevated rounded-xl border border-white/5 p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.34 }}
                  >
                    <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">TIMING</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-foreground-subtle text-[10px] tracking-wider mb-0.5">START AT</p>
                        <p className="font-heading text-xl text-off-white">{result.startFuellingAt} min</p>
                      </div>
                      <div>
                        <p className="text-foreground-subtle text-[10px] tracking-wider mb-0.5">FEED EVERY</p>
                        <p className="font-heading text-xl text-off-white">{result.feedingInterval} min</p>
                      </div>
                      <div>
                        <p className="text-foreground-subtle text-[10px] tracking-wider mb-0.5">PER FEED</p>
                        <p className="font-heading text-xl text-off-white">~{Math.round(result.carbsPerHour / (60 / result.feedingInterval))}g</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Strategy */}
                  <motion.div
                    className="bg-deep-purple/30 rounded-xl border border-purple/20 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.38 }}
                  >
                    <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">STRATEGY</h3>
                    <div className="space-y-3">
                      {result.strategy.map((paragraph, i) => (
                        <p key={i} className="text-foreground-muted text-sm leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.42 }}
                  >
                    <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/blog/cycling-in-ride-nutrition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling In-Ride Nutrition Guide →
                        </a>
                      </li>
                      <li>
                        <a href="/blog/cycling-energy-gels-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Energy Gels Guide →
                        </a>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.48 }}
                  >
                    <EmailCapture
                      heading="NEVER BONK AGAIN"
                      subheading="Weekly fuelling tips backed by sports science. One email, every week."
                      source="tool-fuelling"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
