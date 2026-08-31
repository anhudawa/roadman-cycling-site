"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { SaveToolResultForm } from "@/components/features/tools/SaveToolResultForm";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";

type GutTraining = "none" | "some" | "trained";
type SessionType = "recovery" | "endurance" | "tempo" | "sweetspot" | "threshold" | "vo2" | "race" | "intervals";
type WeatherMode = "location" | "manual" | "skip";
type TempUnit = "C" | "F";

/**
 * Evidence-informed cycling nutrition calculator v3.
 *
 * Sources:
 * - James Morton (Liverpool John Moores / Team Sky): "Fuel for the work required"
 * - Romijn et al. (1993): substrate utilisation at different intensities
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
// carbFraction = fraction of total energy from carbohydrate oxidation
// Based on respiratory exchange ratio (RER) data from Romijn et al. (1993)
// and Jeukendrup (2014). Higher intensity → higher carb dependency.
// sweatMultiplier scales fluid/sodium estimates relative to baseline.
const SESSION_PROFILES: Record<SessionType, {
  label: string;
  ftpRange: string;
  carbFraction: number; // fraction of energy from carbs (0-1)
  sweatMultiplier: number;
  description: string;
}> = {
  recovery: {
    label: "Recovery Spin",
    ftpRange: "<55% FTP",
    carbFraction: 0.30,    // Mostly fat oxidation
    sweatMultiplier: 0.7,
    description: "Easy spin, active recovery. Primarily fat oxidation.",
  },
  endurance: {
    label: "Endurance / Z2",
    ftpRange: "55-75% FTP",
    carbFraction: 0.50,    // Mixed fat and carb
    sweatMultiplier: 0.85,
    description: "Steady aerobic riding. Mixed fat and carb oxidation.",
  },
  tempo: {
    label: "Tempo / Z3",
    ftpRange: "76-87% FTP",
    carbFraction: 0.65,    // Carbs becoming primary fuel
    sweatMultiplier: 1.0,
    description: "Sustained moderate effort. Meaningful glycogen use.",
  },
  sweetspot: {
    label: "Sweet Spot",
    ftpRange: "88-94% FTP",
    carbFraction: 0.75,    // High carb dependency
    sweatMultiplier: 1.1,
    description: "Just below threshold. High glycolytic demand.",
  },
  threshold: {
    label: "Threshold / Z4",
    ftpRange: "95-105% FTP",
    carbFraction: 0.85,    // Very high carb oxidation
    sweatMultiplier: 1.2,
    description: "At or near FTP. Very high carb oxidation rate.",
  },
  vo2: {
    label: "VO2max Intervals",
    ftpRange: "106-120% FTP",
    carbFraction: 0.90,    // Near-maximal carb oxidation
    sweatMultiplier: 1.3,
    description: "Repeated hard efforts with recovery. Highest glycolytic demand.",
  },
  intervals: {
    label: "Mixed Intervals",
    ftpRange: "Variable",
    carbFraction: 0.70,    // Average across work/rest
    sweatMultiplier: 1.15,
    description: "Varied intensity session (e.g. group ride, fartlek, crits). High avg carb burn from surges.",
  },
  race: {
    label: "Race / Sportive",
    ftpRange: "Variable, sustained",
    carbFraction: 0.85,    // Racing demands near-maximal carb use
    sweatMultiplier: 1.25,
    description: "Competitive effort with surges. Maximum fuelling needed.",
  },
};

function calculateFuelling(
  durationMin: number,
  sessionType: SessionType,
  targetWatts: number,
  weightKg: number,
  gutTraining: GutTraining,
  weather: WeatherData | null
): FuellingResult {
  const hours = durationMin / 60;
  const profile = SESSION_PROFILES[sessionType];

  const intensityLabel = profile.label;

  // --- CARBOHYDRATE CALCULATION ---
  // Physics-based: watts → metabolic rate → carb oxidation
  //
  // 1. Mechanical power (W) → metabolic power via gross efficiency
  //    Gross efficiency ~22-25% for trained cyclists (Coyle, 1992)
  //    Metabolic rate (kJ/hr) = watts × 3.6 / efficiency
  //
  // 2. Carb fraction from session type (RER-based, Romijn et al. 1993)
  //    Recovery: ~30% carbs, Endurance: ~50%, Threshold: ~85%, VO2: ~90%
  //
  // 3. Convert to grams: 1g carbohydrate = 16.7 kJ
  //
  // Example: 100W Z2 = (100 × 3.6 / 0.23) × 0.50 / 16.7 = 47g/hr
  //          300W Z2 = (300 × 3.6 / 0.23) × 0.50 / 16.7 = 141g/hr → capped by gut

  const grossEfficiency = 0.23;
  const metabolicRateKJhr = (targetWatts * 3.6) / grossEfficiency;
  const carbKJhr = metabolicRateKJhr * profile.carbFraction;
  const carbOxidation = carbKJhr / 16.7; // grams per hour

  // Duration modifier: longer rides deplete glycogen faster, slight upward adjustment
  let durationMod: number;
  if (durationMin <= 60) durationMod = 0.75;
  else if (durationMin <= 90) durationMod = 0.9;
  else if (durationMin <= 150) durationMod = 1.0;
  else if (durationMin <= 240) durationMod = 1.05;
  else durationMod = 1.1;

  // Gut training sets a planning cap, not a measured absorption ceiling.
  const gutPlanningCap: Record<GutTraining, number> = {
    none: 70,
    some: 90,
    trained: 120,
  };

  // Short sessions do not inherit long-race intake numbers just because
  // their modelled carbohydrate use is high. Duration-specific caps follow
  // the practical progression in the Jeukendrup recommendations; 120 g/hr
  // remains limited to prolonged exercise and a trained gut.
  const durationPlanningCap =
    durationMin <= 45 ? 30
    : durationMin <= 75 ? 60
    : durationMin <= 120 ? 75
    : durationMin <= 150 ? 90
    : 120;

  const rawCarbs = carbOxidation * durationMod;
  const carbsPerHour = Math.round(
    Math.min(
      gutPlanningCap[gutTraining],
      durationPlanningCap,
      Math.max(0, rawCarbs),
    ),
  );
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
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — warm. The model raises the fluid and sodium starting estimates; verify them against your own sweat rate.`;
    } else {
      heatCategory = "hot";
      heatMultiplier = 1.5;
      weatherNote = `${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity — hot. The model raises the starting estimates; verify them against your own sweat rate and avoid overdrinking.`;
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
  // Baker et al. (2016): predicted whole-body sweat [Na+] averaged ~826mg/L,
  // with wide variation between athletes.
  // Sweat rate estimated from fluid intake (drinking replaces ~70% of sweat)
  // Heat is already factored in via heatMultiplier → higher fluid → higher sweat rate → higher sodium
  const sweatRateLHr = (fluidPerHour / 1000) * 1.4;
  const sweatSodiumConc = 800; // mg/L — moderate population estimate
  const sodiumPerHour = Math.round(sweatRateLHr * sweatSodiumConc);

  // --- TIMING ---
  const startFuellingAt = durationMin <= 60 ? 30 : durationMin <= 90 ? 20 : 15;
  const feedingInterval = carbsPerHour >= 80 ? 15 : 20;

  // --- STRATEGY ---
  const strategy: string[] = [];

  if (durationMin <= 45) {
    strategy.push(
      `The ${carbsPerHour}g/hr output is optional for a ride under 45 minutes. Most fed riders do not need on-bike carbohydrate at this duration. Drink to thirst; during a short race or hard test, a small intake or mouth rinse may help some riders.`
    );
  } else if (durationMin <= 75) {
    strategy.push(
      `The model estimates a ${carbsPerHour}g/hr carbohydrate target for this ${durationMin}-minute ${profile.label.toLowerCase()} session. If you choose to fuel it, start around ${startFuellingAt} minutes and spread intake across the ride.`
    );
  } else if (durationMin <= 150) {
    strategy.push(
      `The model estimates a ${carbsPerHour}g/hr carbohydrate target for this ${durationMin}-minute ${profile.label.toLowerCase()} session. Start within the first ${startFuellingAt} minutes and spread intake every ${feedingInterval} minutes.`
    );
    if (dualSource) {
      strategy.push(
        `At ${carbsPerHour}g/hr, use a multiple-transportable carbohydrate product containing glucose and fructose. This plan uses a 1:0.8 split; test the exact product and dose in training.`
      );
    }
  } else {
    strategy.push(
      `The planning target for ${durationMin} minutes of ${profile.label.toLowerCase()} is ${carbsPerHour}g/hr — about ${Math.round(carbsPerHour / (60 / feedingInterval))}g every ${feedingInterval} minutes. Start early and keep the dose steady rather than trying to catch up late.`
    );
    if (dualSource) {
      strategy.push(
        `Use multiple-transportable carbohydrate at this rate. This plan uses glucose:fructose at 1:0.8; mix familiar drinks, gels and foods, and rehearse the full dose before race day.`
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
      `Your modelled target is ${carbsPerHour}g/hr. If you have not practised high carbohydrate intake, begin around 40-50g/hr and raise it gradually across training rides. Stop increasing if gastrointestinal symptoms persist.`
    );
  }

  if (heatCategory === "warm" || heatCategory === "hot") {
    strategy.push(
      `${heatCategory === "hot" ? "Hot" : "Warm"} conditions increase the chance that fluid needs will be higher. Use this estimate as a starting point, then calibrate it with pre- and post-ride body mass. Avoid both excessive dehydration and drinking enough to gain body mass.`
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
    intensityPercent: 0,
  };
}

// Validation
const VALIDATION = {
  duration: { min: 10, max: 720, label: "Duration", unit: " minutes" },
  weight: { min: 30, max: 200, label: "Body weight", unit: "kg" },
  watts: { min: 30, max: 600, label: "Target power", unit: "W" },
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

// Weather validation — temperature range depends on the selected unit.
function getTempError(value: string, unit: TempUnit): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const min = -40;
  const max = unit === "F" ? 131 : 55;
  if (num < min) return `Temperature must be at least ${min}°${unit}`;
  if (num > max) return `Temperature must be under ${max}°${unit}`;
  return null;
}

function getHumidityError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 0) return "Humidity must be at least 0%";
  if (num > 100) return "Humidity must be 100% or less";
  return null;
}

const heatColors: Record<string, string> = {
  cool: "text-blue-400",
  mild: "text-green-400",
  warm: "text-amber-400",
  hot: "text-red-400",
};

interface FuellingPrefillResponse {
  prefill: {
    weightKg: number | null;
    currentFtp: number | null;
  } | null;
}

export function FuellingClient() {
  const [duration, setDuration] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("endurance");
  const [watts, setWatts] = useState("");
  const [weight, setWeight] = useState("");
  const [gutTraining, setGutTraining] = useState<GutTraining>("some");
  const [result, setResult] = useState<FuellingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>("location");
  const [manualTemp, setManualTemp] = useState("");
  const [manualHumidity, setManualHumidity] = useState("");
  const [tempUnit, setTempUnit] = useState<TempUnit>("C");
  const [manualLocation, setManualLocation] = useState("");

  // Keep the live mode readable inside the async fetch closure so a late
  // location response can't overwrite manual or skipped weather.
  const weatherModeRef = useRef<WeatherMode>(weatherMode);

  // Profile data is private and optional, so fetch it after the public tool
  // has rendered. Functional updates preserve anything the rider typed while
  // the request was in flight.
  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/tools/fuelling/prefill", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load rider defaults");
        return response.json() as Promise<FuellingPrefillResponse>;
      })
      .then(({ prefill }) => {
        if (!prefill) return;
        if (prefill.weightKg && prefill.weightKg > 0) {
          setWeight((current) => current || String(prefill.weightKg));
        }
        if (prefill.currentFtp && prefill.currentFtp > 0) {
          setWatts(
            (current) =>
              current || String(Math.round(prefill.currentFtp! * 0.7)),
          );
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Prefill failure is deliberately silent: anonymous riders and
        // signed-in riders both retain the complete calculator.
      });

    return () => controller.abort();
  }, []);

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

      if (weatherModeRef.current === "location") {
        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          humidity: Math.round(weatherData.current.relative_humidity_2m),
          location,
        });
      }
    } catch {
      if (weatherModeRef.current === "location") {
        setWeatherError("Location unavailable — using standard estimates for sodium and fluid.");
      }
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const timeoutId = window.setTimeout(() => {
        void fetchWeather();
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [fetchWeather]);

  // Derive the weather used by the calculation from the manual fields.
  // Stored internally as °C, matching the auto-detected path.
  useEffect(() => {
    if (weatherMode !== "manual") return;
    const timeoutId = window.setTimeout(() => {
      const tErr = getTempError(manualTemp, tempUnit);
      const hErr = getHumidityError(manualHumidity);
      if (manualTemp === "" || manualHumidity === "" || tErr || hErr) {
        setWeather(null);
        return;
      }
      const raw = parseFloat(manualTemp);
      const tempC = tempUnit === "F" ? (raw - 32) * 5 / 9 : raw;
      setWeather({
        temperature: Math.round(tempC),
        humidity: Math.round(parseFloat(manualHumidity)),
        location: manualLocation.trim() || "Manual entry",
      });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [weatherMode, manualTemp, manualHumidity, tempUnit, manualLocation]);

  // Switching mode always invalidates the last result so the rider
  // re-calculates against the new conditions.
  const handleWeatherMode = (mode: WeatherMode) => {
    if (mode === weatherMode) return;
    weatherModeRef.current = mode;
    setResult(null);
    setWeatherError(null);
    setWeatherMode(mode);
    if (mode === "location") {
      setWeather(null);
      fetchWeather();
    } else if (mode === "skip") {
      setWeather(null);
      setWeatherLoading(false);
    } else {
      setWeatherLoading(false);
    }
  };

  // Toggle the input unit and convert the displayed value so the real
  // temperature stays put. Calculation still receives °C.
  const handleTempUnit = (unit: TempUnit) => {
    if (unit === tempUnit) return;
    if (manualTemp !== "" && !isNaN(parseFloat(manualTemp))) {
      const v = parseFloat(manualTemp);
      const converted = unit === "F" ? v * 9 / 5 + 32 : (v - 32) * 5 / 9;
      setManualTemp(String(Math.round(converted)));
    }
    setTempUnit(unit);
    setResult(null);
  };

  const durationError = getValidationError(duration, "duration");
  const weightError = getValidationError(weight, "weight");
  const wattsError = getValidationError(watts, "watts");
  const tempError = weatherMode === "manual" ? getTempError(manualTemp, tempUnit) : null;
  const humidityError = weatherMode === "manual" ? getHumidityError(manualHumidity) : null;
  const hasErrors = !!durationError || !!weightError || !!wattsError || !!tempError || !!humidityError;

  const handleCalculate = () => {
    if (hasErrors) return;
    const d = parseInt(duration);
    const w = parseInt(watts);
    const wt = parseFloat(weight);
    if (d > 0 && w > 0 && wt > 0) {
      const next = calculateFuelling(d, sessionType, w, wt, gutTraining, weather);
      setResult(next);
      trackTool({
        name: TOOL_EVENTS.COMPLETED,
        tool: "fuelling",
        meta: {
          sessionType,
          carbsPerHour: next.carbsPerHour,
          heatCategory: next.heatCategory,
        },
      });
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    const profile = SESSION_PROFILES[sessionType];
    const text = `Fuelling Plan: ${result.carbsPerHour}g carbs/hr (${result.dualSource ? `${result.glucosePerHour}g glucose + ${result.fructosePerHour}g fructose` : "single source"}), ${result.fluidPerHour}ml fluid/hr, ${result.sodiumPerHour}mg sodium/hr (${duration}min ${profile.label} at ${watts}W, ${weight}kg${weather ? `, ${weather.temperature}°C` : ""}) — roadmancycling.com/tools/fuelling`;
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
              CYCLING NUTRITION CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              A planning estimate for carbs, fluid and sodium per hour, based on ride duration, power, session type, body weight and weather. Use training rides to personalise it.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Weather conditions panel */}
            <div className="mb-4 space-y-3">
              <div>
                <label id="weather-mode-label" className="block font-heading text-sm text-off-white mb-1 tracking-wider">WEATHER CONDITIONS</label>
                <p className="text-foreground-subtle text-[11px] mb-3">
                  Heat and humidity adjust the fluid and sodium starting estimates. Auto-detect from your location, type it in for a planned ride, or skip for standard conditions.
                </p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="weather-mode-label">
                  {([
                    ["location", "Use My Location", "Auto-detect"],
                    ["manual", "Manual Input", "Type it in"],
                    ["skip", "Skip Weather", "Standard est."],
                  ] as const).map(([val, label, desc]) => (
                    <button key={val} type="button"
                      onClick={() => handleWeatherMode(val)}
                      aria-pressed={weatherMode === val}
                      className={`min-h-[44px] py-3 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                        weatherMode === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      <span className="font-heading text-[11px] tracking-wider block leading-tight">{label}</span>
                      <span className="text-[9px] opacity-60 block mt-0.5">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual entry fields */}
              {weatherMode === "manual" && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {/* Temperature with inline °C / °F toggle */}
                    <div>
                      <label htmlFor="weather-temp" className="block font-heading text-xs text-off-white mb-2 tracking-wider">TEMPERATURE</label>
                      <div className="flex gap-2 items-stretch">
                        <input id="weather-temp" type="number"
                          placeholder={tempUnit === "C" ? "e.g. 18" : "e.g. 64"}
                          aria-invalid={!!tempError}
                          value={manualTemp}
                          onChange={(e) => { setManualTemp(e.target.value); setResult(null); }}
                          className={`${tempError ? errorInputClasses : inputClasses} flex-1 min-w-0`}
                        />
                        <div className="flex shrink-0 rounded-lg bg-white/5 border border-white/10 p-0.5" role="group" aria-label="Temperature unit">
                          {(["C", "F"] as const).map((u) => (
                            <button key={u} type="button"
                              onClick={() => handleTempUnit(u)}
                              aria-pressed={tempUnit === u}
                              className={`min-h-[44px] px-3 rounded-md font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                                tempUnit === u ? "bg-coral text-off-white" : "text-foreground-muted hover:text-off-white"
                              }`}
                            >°{u}</button>
                          ))}
                        </div>
                      </div>
                      {tempError && <p className="text-red-400 text-xs mt-1" role="alert">{tempError}</p>}
                    </div>
                    {/* Humidity */}
                    <div>
                      <label htmlFor="weather-humidity" className="block font-heading text-xs text-off-white mb-2 tracking-wider">HUMIDITY (%)</label>
                      <input id="weather-humidity" type="number" inputMode="numeric" min="0" max="100"
                        placeholder="e.g. 55"
                        aria-invalid={!!humidityError}
                        value={manualHumidity}
                        onChange={(e) => { setManualHumidity(e.target.value); setResult(null); }}
                        className={humidityError ? errorInputClasses : inputClasses}
                      />
                      {humidityError && <p className="text-red-400 text-xs mt-1" role="alert">{humidityError}</p>}
                    </div>
                  </div>
                  {/* Label — display only, shown in the banner and results */}
                  <div>
                    <label htmlFor="weather-location" className="block font-heading text-xs text-off-white mb-2 tracking-wider">
                      LABEL <span className="text-foreground-subtle font-body normal-case tracking-normal">(optional)</span>
                    </label>
                    <input id="weather-location" type="text"
                      placeholder="e.g. Tomorrow's ride"
                      value={manualLocation}
                      onChange={(e) => { setManualLocation(e.target.value); setResult(null); }}
                      className={inputClasses}
                    />
                  </div>
                </motion.div>
              )}

              {/* Status banner */}
              {weather && (weatherMode === "location" || weatherMode === "manual") && (
                <motion.div
                  className="bg-background-elevated rounded-lg border border-white/5 px-4 py-3 flex items-center justify-between"
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
                  <span className="text-[10px] text-foreground-subtle">{weatherMode === "manual" ? "MANUAL" : "LIVE WEATHER"}</span>
                </motion.div>
              )}
              {weatherMode === "location" && weatherLoading && (
                <div className="bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                  Fetching local weather for sodium &amp; fluid estimates...
                </div>
              )}
              {weatherMode === "location" && weatherError && !weather && (
                <div className="bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                  {weatherError}
                </div>
              )}
              {weatherMode === "manual" && !weather && !tempError && !humidityError && (
                <div className="bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                  Enter a temperature and humidity to adjust fluid and sodium for the heat.
                </div>
              )}
              {weatherMode === "skip" && (
                <div className="bg-background-elevated rounded-lg border border-white/5 px-4 py-3 text-sm text-foreground-subtle">
                  Skipping weather — fluid and sodium use standard estimates.
                </div>
              )}
            </div>

            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">
              {/* Duration */}
              <div>
                <label htmlFor="fuel-duration" className="block font-heading text-sm text-off-white mb-2 tracking-wider">RIDE DURATION (MINUTES)</label>
                <input id="fuel-duration" type="number" inputMode="numeric" min="15" max="600" placeholder="e.g. 180"
                  aria-invalid={!!durationError}
                  value={duration} onChange={(e) => { setDuration(e.target.value); setResult(null); }}
                  className={`${durationError ? errorInputClasses : inputClasses} text-xl`}
                />
                {durationError && <p className="text-red-400 text-xs mt-1" role="alert">{durationError}</p>}
              </div>

              {/* Session Type */}
              <div>
                <label id="session-type-label" className="block font-heading text-sm text-off-white mb-1 tracking-wider">SESSION TYPE</label>
                <p className="text-foreground-subtle text-[11px] mb-3">
                  Session type and watts create a modelled estimate of carbohydrate demand. It is not a laboratory measurement of your oxidation rate.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="session-type-label">
                  {(Object.entries(SESSION_PROFILES) as [SessionType, typeof SESSION_PROFILES[SessionType]][]).map(([key, profile]) => (
                    <button key={key} type="button"
                      onClick={() => { setSessionType(key); setResult(null); }}
                      aria-pressed={sessionType === key}
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

              {/* Target Power */}
              <div>
                <label htmlFor="fuel-watts" className="block font-heading text-sm text-off-white mb-1 tracking-wider">TARGET POWER (WATTS)</label>
                <p className="text-foreground-subtle text-[11px] mb-2">
                  Your expected average power for this session. A Z2 ride at 100W needs very different fuel than Z2 at 300W.
                </p>
                <input id="fuel-watts" type="number" inputMode="numeric" min="30" max="600" placeholder="e.g. 200"
                  aria-invalid={!!wattsError}
                  value={watts} onChange={(e) => { setWatts(e.target.value); setResult(null); }}
                  className={wattsError ? errorInputClasses : inputClasses}
                />
                {wattsError && <p className="text-red-400 text-xs mt-1" role="alert">{wattsError}</p>}
              </div>

              {/* Body Weight */}
              <div>
                <label htmlFor="fuel-weight" className="block font-heading text-sm text-off-white mb-2 tracking-wider">BODY WEIGHT (KG)</label>
                <p className="text-foreground-subtle text-[11px] mb-2">
                  Used to estimate fluid needs. The carbohydrate model is driven by power, session type and duration.
                </p>
                <input id="fuel-weight" type="number" inputMode="decimal" min="40" max="150" step="0.1" placeholder="e.g. 75"
                  aria-invalid={!!weightError}
                  value={weight} onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                  className={weightError ? errorInputClasses : inputClasses}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

              {/* Gut Training */}
              <div>
                <label id="gut-training-label" className="block font-heading text-sm text-off-white mb-1 tracking-wider">GUT TRAINING LEVEL</label>
                <p className="text-foreground-subtle text-[11px] mb-3">
                  Choose the highest intake range you have repeatedly tolerated during exercise. This sets a planning cap, not a measured absorption limit.
                </p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="gut-training-label">
                  {([
                    ["none", "Beginner", "Plan up to 70g/hr"],
                    ["some", "Moderate", "Plan up to 90g/hr"],
                    ["trained", "Trained", "Plan up to 120g/hr"],
                  ] as const).map(([val, label, desc]) => (
                    <button key={val} type="button"
                      onClick={() => { setGutTraining(val); setResult(null); }}
                      aria-pressed={gutTraining === val}
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

              <Button onClick={handleCalculate} size="lg" className="w-full" disabled={hasErrors}>Calculate</Button>
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
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-heading text-xl sm:text-2xl text-off-white">YOUR FUELLING PLAN</h2>
                    <button
                      onClick={handleCopyResults}
                      aria-label={copied ? "Results copied to clipboard" : "Copy fuelling plan to clipboard"}
                      className="shrink-0 inline-flex items-center min-h-[44px] px-3 -mr-3 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  {/* Session badge */}
                  <div className="bg-white/[0.03] rounded-lg px-4 py-2 flex items-center justify-between">
                    <span className="text-foreground-subtle text-xs">SESSION</span>
                    <span className="font-heading text-off-white">{result.intensityLabel} @ {watts}W</span>
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
                      <p className="text-[10px] text-foreground-subtle mt-1">{weather ? `based on ${weather.temperature}°C` : "standard estimate"}</p>
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

                  <p className="text-foreground-subtle text-xs leading-relaxed">
                    These are planning estimates, not measured sweat or nutrition losses. Rehearse them in training, use pre- and post-ride body mass to estimate your own sweat rate, and do not drink enough to gain body mass during the ride.
                  </p>

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
                        <Link href="/blog/cycling-in-ride-nutrition-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling In-Ride Nutrition Guide →
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog/cycling-energy-gels-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Energy Gels Guide →
                        </Link>
                      </li>
                      <li>
                        <Link href="/topics/cycling-nutrition" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Cycling Nutrition topic hub →
                        </Link>
                      </li>
                      <li>
                        <Link href="/podcast/ep-2035-world-tour-nutritionist-we-got-fuelling-wrong" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Podcast: World Tour nutritionist — &quot;we got fuelling wrong&quot;
                        </Link>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.48 }}
                  >
                    <SaveToolResultForm
                      tool="fuelling"
                      resultsPathTool="fuelling"
                      inputs={{
                        durationMinutes: parseInt(duration),
                        sessionType,
                        watts: parseInt(watts),
                        weightKg: parseFloat(weight),
                        gutTraining,
                      }}
                      outputs={{
                        carbsPerHour: result.carbsPerHour,
                        totalCarbs: result.totalCarbs,
                        fluidPerHour: result.fluidPerHour,
                        totalFluid: result.totalFluid,
                        sodiumPerHour: result.sodiumPerHour,
                        glucosePerHour: result.glucosePerHour,
                        fructosePerHour: result.fructosePerHour,
                        feedingInterval: result.feedingInterval,
                        startFuellingAt: result.startFuellingAt,
                        dualSource: result.dualSource,
                        heatCategory: result.heatCategory,
                        weatherNote: result.weatherNote,
                        intensityLabel: result.intensityLabel,
                        strategy: result.strategy,
                      }}
                      heading="Your hour-by-hour fuelling plan"
                      subheading="Save your plan — you'll get a shareable permalink plus a copy emailed to you. Open the permalink on your phone before the ride."
                      bullets={[
                        `${result.carbsPerHour}g carbs/hr · ${result.fluidPerHour}ml fluid/hr`,
                        "Complete hour-by-hour schedule with feeding intervals",
                        "Glucose + fructose ratio explained",
                        "Heat-adjusted sodium targets",
                        "Ask Roadman explains every number in one click after you save",
                      ]}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Coaching CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                GOT YOUR FUELLING NUMBERS?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching periodises your nutrition around every session — not just race day.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_fuelling_apply"
              >
                Apply for Coaching →
              </a>
            </motion.div>
          </Container>
        </Section>

        <ToolLanding slug="fuelling" />
      </main>
      <Footer />
    </>
  );
}
