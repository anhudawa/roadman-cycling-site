"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ── Preset scenarios ── */
const PRESETS = [
  { label: "Spring morning ride", temp: 8, speed: 25, headwind: 0, tailwind: 0, humidity: 60, descent: false, id: "spring" },
  { label: "Summer alpine descent", temp: 15, speed: 60, headwind: 0, tailwind: 0, humidity: 40, descent: true, id: "alpine" },
  { label: "Winter commute", temp: 2, speed: 20, headwind: 10, tailwind: 0, humidity: 70, descent: false, id: "winter" },
  { label: "Autumn crosswind", temp: 12, speed: 30, headwind: 15, tailwind: 0, humidity: 55, descent: false, id: "autumn" },
];

/* ── Frostbite risk levels ── */
const FROSTBITE_LEVELS = [
  { min: 0, max: 999, label: "No frostbite risk", desc: "Exposed skin is safe", color: "#22C55E" },
  { min: -10, max: 0, label: "Low risk", desc: "Frostbite possible after 30+ minutes on exposed skin", color: "#3B82F6" },
  { min: -25, max: -10, label: "Moderate risk", desc: "Frostbite possible in 10–30 minutes on exposed skin", color: "#EAB308" },
  { min: -35, max: -25, label: "High risk", desc: "Frostbite possible in 5–10 minutes on exposed skin", color: "#F97316" },
  { min: -999, max: -35, label: "Extreme risk", desc: "Frostbite possible in under 5 minutes — limit all exposure", color: "#EF4444" },
];

function getFrostbiteLevel(windChill: number) {
  return FROSTBITE_LEVELS.find((z) => windChill > z.min && windChill <= z.max) || FROSTBITE_LEVELS[FROSTBITE_LEVELS.length - 1];
}

/* ── Clothing recommendation zones ── */
function getClothingRec(feelsLike: number): { kit: string; detail: string; color: string } {
  if (feelsLike > 15) return { kit: "Short sleeves, shorts", detail: "Standard summer kit. Sun cream and arm coolers if it’s bright.", color: "#22C55E" };
  if (feelsLike > 10) return { kit: "Arm warmers or light long sleeve, knee warmers", detail: "Packable layers work well — strip them once you’re warm.", color: "#3B82F6" };
  if (feelsLike > 5) return { kit: "Long sleeve thermal, leg warmers or tights, light gloves", detail: "Windproof front panel on the gilet makes a real difference here.", color: "#60A5FA" };
  if (feelsLike > 0) return { kit: "Winter jacket, tights, winter gloves, overshoes, neck gaiter", detail: "Cover all exposed skin. Merino base layer underneath.", color: "#EAB308" };
  if (feelsLike > -10) return { kit: "Full winter kit, windproof face cover, chemical toe warmers", detail: "Neoprene overshoes, lobster gloves, and a thermal skull cap under the helmet.", color: "#F97316" };
  return { kit: "Extreme caution — limit exposure time", detail: "At this wind chill, exposed skin is at serious risk. Keep the ride short or train indoors.", color: "#EF4444" };
}

/* ── Wind chill calculation ── */
function calculateWindChill(tempC: number, windKmh: number): number {
  // Environment Canada / NWS formula (Osczevski & Bluestein, 2005)
  // Valid for T <= 10C and V >= 4.8 km/h
  if (windKmh < 4.8) return tempC;

  if (tempC <= 10) {
    const vPow = Math.pow(windKmh, 0.16);
    return 13.12 + 0.6215 * tempC - 11.37 * vPow + 0.3965 * tempC * vPow;
  }

  // For temps above 10C: linear wind-cooling approximation
  // Each 10 km/h of wind reduces feels-like temp by ~1C
  // Capped so result doesn't drop below what the standard formula would give at 10C
  const cooling = (windKmh / 10) * 1;
  const feelsLike = tempC - cooling;
  // Floor: don't go below the standard formula boundary at 10C
  const floorAt10 = 13.12 + 0.6215 * 10 - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * 10 * Math.pow(windKmh, 0.16);
  return Math.max(feelsLike, floorAt10);
}

/* ── Temperature gauge color ── */
function getTempColor(temp: number): string {
  if (temp <= -20) return "#1E3A5F";
  if (temp <= -10) return "#2563EB";
  if (temp <= 0) return "#3B82F6";
  if (temp <= 5) return "#60A5FA";
  if (temp <= 10) return "#67E8F9";
  if (temp <= 15) return "#A3E635";
  if (temp <= 20) return "#FACC15";
  if (temp <= 25) return "#FB923C";
  return "#EF4444";
}

/* ── Gauge position helper ── */
function tempToPercent(temp: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, temp));
  return ((clamped - min) / (max - min)) * 100;
}

/* ── Validation ── */
function getTempError(value: string): string | null {
  if (!value && value !== "0") return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < -50) return "Temperature must be above -50°C";
  if (num > 50) return "Temperature must be below 50°C";
  return null;
}

function getSpeedError(value: string, label: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 0) return `${label} cannot be negative`;
  if (num > 200) return `${label} must be under 200 km/h`;
  return null;
}

function getHumidityError(value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a valid number";
  if (num < 0 || num > 100) return "Humidity must be 0–100%";
  return null;
}

export default function WindChillPage() {
  const [airTemp, setAirTemp] = useState("10");
  const [cyclingSpeed, setCyclingSpeed] = useState("30");
  const [headwind, setHeadwind] = useState("0");
  const [tailwind, setTailwind] = useState("0");
  const [humidity, setHumidity] = useState("50");
  const [calculated, setCalculated] = useState(false);

  // Descent mode
  const [descentMode, setDescentMode] = useState(false);
  const [summitTemp, setSummitTemp] = useState("");
  const [descentSpeed, setDescentSpeed] = useState("50");
  const [descentDuration, setDescentDuration] = useState("");

  // Parse values
  const tempVal = parseFloat(airTemp);
  const speedVal = parseFloat(cyclingSpeed) || 0;
  const headwindVal = parseFloat(headwind) || 0;
  const tailwindVal = parseFloat(tailwind) || 0;
  const humidityVal = parseFloat(humidity) || 50;

  const summitTempVal = parseFloat(summitTemp);
  const descentSpeedVal = parseFloat(descentSpeed) || 50;
  const descentDurationVal = parseFloat(descentDuration) || 0;

  // Validation
  const tempError = getTempError(airTemp);
  const speedError = getSpeedError(cyclingSpeed, "Cycling speed");
  const headwindError = getSpeedError(headwind, "Headwind");
  const tailwindError = getSpeedError(tailwind, "Tailwind");
  const humidityError = getHumidityError(humidity);
  const summitTempError = descentMode ? getTempError(summitTemp) : null;
  const descentSpeedError = descentMode ? getSpeedError(descentSpeed, "Descent speed") : null;

  const hasTemp = airTemp !== "" && !isNaN(tempVal);
  const canCalculate = hasTemp && !tempError && !speedError && !headwindError && !tailwindError && !humidityError
    && (!descentMode || (!summitTempError && !descentSpeedError));

  const resetCalc = () => setCalculated(false);

  // ── Main calculation ──
  const effectiveWind = Math.max(0, speedVal + headwindVal - tailwindVal);
  const feelsLike = calculateWindChill(tempVal, effectiveWind);

  // Humidity note: at sub-zero temps, humidity has minimal effect on perceived cold.
  // At 0-10C with high humidity, damp air conducts heat faster.
  const humidityAdjustment = tempVal <= 10 && tempVal > -5 && humidityVal > 70
    ? -((humidityVal - 70) / 30) * 1.5  // up to -1.5C extra chill in very humid cold
    : 0;
  const adjustedFeelsLike = feelsLike + humidityAdjustment;

  // Frostbite risk
  const frostbite = getFrostbiteLevel(adjustedFeelsLike);

  // Clothing rec
  const clothing = getClothingRec(adjustedFeelsLike);

  // Descent calculation
  const descentEffectiveWind = descentMode ? Math.max(0, descentSpeedVal) : 0;
  const descentFeelsLike = descentMode && !isNaN(summitTempVal)
    ? calculateWindChill(summitTempVal, descentEffectiveWind)
    : null;
  const descentFrostbite = descentFeelsLike !== null ? getFrostbiteLevel(descentFeelsLike) : null;
  const descentClothing = descentFeelsLike !== null ? getClothingRec(descentFeelsLike) : null;

  // Temperature difference
  const tempDrop = hasTemp ? Math.round((tempVal - adjustedFeelsLike) * 10) / 10 : 0;

  // Gauge range
  const gaugeMin = -30;
  const gaugeMax = 40;

  // Apply preset
  function applyPreset(preset: typeof PRESETS[0]) {
    setAirTemp(String(preset.temp));
    setCyclingSpeed(String(preset.speed));
    setHeadwind(String(preset.headwind));
    setTailwind(String(preset.tailwind));
    setHumidity(String(preset.humidity));
    if (preset.descent) {
      setDescentMode(true);
      setSummitTemp(String(preset.temp));
      setDescentSpeed(String(preset.speed));
    } else {
      setDescentMode(false);
    }
    setCalculated(false);
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              WIND CHILL CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Air temperature and riding speed in. Feels-like temperature, frostbite risk, and clothing recommendations out.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Preset scenarios */}
            <div className="mb-6">
              <label className="block font-heading text-sm text-off-white mb-2">QUICK SCENARIOS</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-lg px-3 py-3 text-sm font-body transition-all text-left bg-white/5 border border-white/10 text-foreground-muted hover:border-coral/40 hover:text-off-white"
                  >
                    {preset.label}
                    <span className="block text-xs text-foreground-subtle mt-0.5">
                      {preset.temp}&deg;C &middot; {preset.speed} km/h
                      {preset.headwind > 0 ? ` · ${preset.headwind} km/h headwind` : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Air Temperature */}
              <div className="mb-6">
                <label htmlFor="temp-input" className="block font-heading text-sm text-off-white mb-2">AIR TEMPERATURE (&deg;C)</label>
                <input
                  id="temp-input"
                  type="number"
                  inputMode="decimal"
                  min="-50"
                  max="50"
                  step="0.5"
                  placeholder="e.g. 10"
                  aria-label="Air temperature in degrees Celsius"
                  aria-invalid={!!tempError}
                  value={airTemp}
                  onChange={(e) => { setAirTemp(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${tempError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {tempError && <p className="text-red-400 text-xs mt-1" role="alert">{tempError}</p>}
              </div>

              {/* Cycling Speed */}
              <div className="mb-6">
                <label htmlFor="speed-input" className="block font-heading text-sm text-off-white mb-2">
                  CYCLING SPEED (KM/H)
                  <span className="text-foreground-subtle font-body text-xs ml-2">your speed = the wind on your face</span>
                </label>
                <input
                  id="speed-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="200"
                  placeholder="e.g. 30"
                  aria-label="Cycling speed in kilometres per hour"
                  aria-invalid={!!speedError}
                  value={cyclingSpeed}
                  onChange={(e) => { setCyclingSpeed(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${speedError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {speedError && <p className="text-red-400 text-xs mt-1" role="alert">{speedError}</p>}
              </div>

              {/* Headwind & Tailwind */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label htmlFor="headwind-input" className="block font-heading text-sm text-off-white mb-2">HEADWIND (KM/H)</label>
                  <input
                    id="headwind-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    placeholder="0"
                    aria-label="Headwind speed in kilometres per hour"
                    aria-invalid={!!headwindError}
                    value={headwind}
                    onChange={(e) => { setHeadwind(e.target.value); resetCalc(); }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${headwindError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  {headwindError && <p className="text-red-400 text-xs mt-1" role="alert">{headwindError}</p>}
                  <span className="text-foreground-subtle text-xs mt-1 block">adds to effective wind</span>
                </div>
                <div>
                  <label htmlFor="tailwind-input" className="block font-heading text-sm text-off-white mb-2">TAILWIND (KM/H)</label>
                  <input
                    id="tailwind-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    placeholder="0"
                    aria-label="Tailwind speed in kilometres per hour"
                    aria-invalid={!!tailwindError}
                    value={tailwind}
                    onChange={(e) => { setTailwind(e.target.value); resetCalc(); }}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${tailwindError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  {tailwindError && <p className="text-red-400 text-xs mt-1" role="alert">{tailwindError}</p>}
                  <span className="text-foreground-subtle text-xs mt-1 block">subtracts from effective wind</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="mb-6">
                <label htmlFor="humidity-input" className="block font-heading text-sm text-off-white mb-2">
                  HUMIDITY (%)
                  <span className="text-foreground-subtle font-body text-xs ml-2">affects perceived cold below 10&deg;C</span>
                </label>
                <input
                  id="humidity-input"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  placeholder="50"
                  aria-label="Relative humidity percentage"
                  aria-invalid={!!humidityError}
                  value={humidity}
                  onChange={(e) => { setHumidity(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${humidityError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {humidityError && <p className="text-red-400 text-xs mt-1" role="alert">{humidityError}</p>}
              </div>

              {/* Descent Mode Toggle */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => { setDescentMode(!descentMode); resetCalc(); }}
                  className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                >
                  {descentMode ? "Hide descent mode" : "Planning a descent? Descent mode"}
                </button>
                {descentMode && (
                  <div className="mt-4 rounded-lg border border-coral/20 bg-coral/5 p-4 space-y-4">
                    <p className="font-heading text-sm text-coral">DESCENT MODE</p>
                    <p className="text-foreground-subtle text-xs">
                      See what the wind chill will feel like at descent speed. This is where cold catches riders out — you stop pedalling,
                      you stop generating heat, and the wind speed doubles.
                    </p>
                    <div>
                      <label htmlFor="summit-temp-input" className="block font-heading text-sm text-off-white mb-2">SUMMIT TEMPERATURE (&deg;C)</label>
                      <input
                        id="summit-temp-input"
                        type="number"
                        inputMode="decimal"
                        min="-50"
                        max="50"
                        step="0.5"
                        placeholder="e.g. 5"
                        aria-label="Summit temperature in degrees Celsius"
                        aria-invalid={!!summitTempError}
                        value={summitTemp}
                        onChange={(e) => { setSummitTemp(e.target.value); resetCalc(); }}
                        className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${summitTempError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                      />
                      {summitTempError && <p className="text-red-400 text-xs mt-1" role="alert">{summitTempError}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="descent-speed-input" className="block font-heading text-sm text-off-white mb-2">DESCENT SPEED (KM/H)</label>
                        <input
                          id="descent-speed-input"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="200"
                          placeholder="50"
                          aria-label="Descent speed in kilometres per hour"
                          aria-invalid={!!descentSpeedError}
                          value={descentSpeed}
                          onChange={(e) => { setDescentSpeed(e.target.value); resetCalc(); }}
                          className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${descentSpeedError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                        />
                        {descentSpeedError && <p className="text-red-400 text-xs mt-1" role="alert">{descentSpeedError}</p>}
                      </div>
                      <div>
                        <label htmlFor="descent-duration-input" className="block font-heading text-sm text-off-white mb-2">
                          DESCENT DURATION
                          <span className="text-foreground-subtle font-body text-xs ml-1">(min, optional)</span>
                        </label>
                        <input
                          id="descent-duration-input"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="120"
                          placeholder="e.g. 20"
                          aria-label="Descent duration in minutes"
                          value={descentDuration}
                          onChange={(e) => { setDescentDuration(e.target.value); resetCalc(); }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Calculate Wind Chill
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && hasTemp && (
                  <motion.div
                    key={`${airTemp}-${cyclingSpeed}-${headwind}-${tailwind}-${humidity}-${summitTemp}-${descentSpeed}-${descentMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big feels-like temperature */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">
                        {adjustedFeelsLike.toFixed(1)}&deg;C
                      </p>
                      <p className="font-heading text-xl text-off-white">FEELS LIKE</p>
                      <p className="text-foreground-muted mt-2">
                        {tempDrop > 0
                          ? `${tempDrop.toFixed(1)}°C colder than the air temperature`
                          : tempDrop < 0
                          ? `${Math.abs(tempDrop).toFixed(1)}°C warmer than the air temperature`
                          : "No significant wind chill effect"}
                      </p>
                    </div>

                    {/* Key stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{tempVal.toFixed(1)}&deg;</p>
                        <p className="text-foreground-subtle text-sm">Air temp</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{effectiveWind.toFixed(0)}</p>
                        <p className="text-foreground-subtle text-sm">Effective wind (km/h)</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-off-white" style={{ color: frostbite.color }}>
                          {frostbite.label.split(" ")[0]}
                        </p>
                        <p className="text-foreground-subtle text-sm">Frostbite risk</p>
                      </div>
                    </div>

                    {/* Temperature gauge */}
                    <div className="mb-8">
                      <label className="block font-heading text-sm text-off-white mb-3">TEMPERATURE GAUGE</label>
                      <div className="relative h-8 rounded-full overflow-hidden border border-white/10"
                        style={{
                          background: "linear-gradient(to right, #1E3A5F, #2563EB, #3B82F6, #60A5FA, #67E8F9, #A3E635, #FACC15, #FB923C, #EF4444)",
                        }}
                      >
                        {/* Air temperature marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-off-white z-10"
                          style={{ left: `${tempToPercent(tempVal, gaugeMin, gaugeMax)}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-off-white text-xs font-heading bg-charcoal/80 rounded px-1.5 py-0.5">
                              {tempVal.toFixed(0)}&deg; air
                            </span>
                          </div>
                        </div>

                        {/* Feels-like marker */}
                        <div
                          className="absolute top-0 h-full w-1 z-20"
                          style={{
                            left: `${tempToPercent(adjustedFeelsLike, gaugeMin, gaugeMax)}%`,
                            backgroundColor: getTempColor(adjustedFeelsLike),
                            boxShadow: `0 0 8px ${getTempColor(adjustedFeelsLike)}`,
                          }}
                        >
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-coral text-xs font-heading bg-charcoal/80 rounded px-1.5 py-0.5">
                              {adjustedFeelsLike.toFixed(0)}&deg; feels
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-foreground-subtle text-xs mt-7">
                        <span>-30&deg;C</span>
                        <span>-10&deg;C</span>
                        <span>0&deg;C</span>
                        <span>10&deg;C</span>
                        <span>20&deg;C</span>
                        <span>30&deg;C</span>
                        <span>40&deg;C</span>
                      </div>
                    </div>

                    {/* Frostbite risk detail */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">FROSTBITE RISK</h3>
                      <div className="space-y-2">
                        {FROSTBITE_LEVELS.map((level) => {
                          const isActive = frostbite.label === level.label;
                          return (
                            <div
                              key={level.label}
                              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                            >
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: level.color }} />
                              <span className="text-off-white text-sm flex-1">{level.label}</span>
                              <span className="text-foreground-subtle text-xs">{level.desc.split(" —")[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clothing recommendation */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">KIT RECOMMENDATION</h3>
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: clothing.color }} />
                        <div>
                          <p className="text-off-white text-sm font-heading">{clothing.kit.toUpperCase()}</p>
                          <p className="text-foreground-muted text-sm mt-1">{clothing.detail}</p>
                        </div>
                      </div>
                      {humidityAdjustment < -0.5 && (
                        <p className="text-yellow-400 text-sm mt-3">
                          High humidity ({humidityVal}%) in cold air makes it feel {Math.abs(humidityAdjustment).toFixed(1)}&deg;C colder.
                          Damp conditions conduct heat away from exposed skin faster than dry cold.
                        </p>
                      )}
                    </div>

                    {/* Descent results */}
                    {descentMode && descentFeelsLike !== null && descentClothing && descentFrostbite && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="rounded-xl border border-coral/30 bg-coral/5 p-6 mb-8"
                      >
                        <h3 className="font-heading text-lg text-coral mb-4">DESCENT SCENARIO</h3>
                        <div className="text-center mb-4">
                          <p className="font-heading text-5xl md:text-6xl text-coral mb-2">
                            {descentFeelsLike.toFixed(1)}&deg;C
                          </p>
                          <p className="font-heading text-sm text-off-white">FEELS LIKE AT {descentSpeedVal} KM/H</p>
                          {descentDurationVal > 0 && (
                            <p className="text-foreground-subtle text-sm mt-1">
                              {descentDurationVal} minutes at this temperature
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center mb-4">
                          <div>
                            <p className="font-heading text-2xl text-off-white">{summitTempVal.toFixed(0)}&deg;C</p>
                            <p className="text-foreground-subtle text-xs">Summit temp</p>
                          </div>
                          <div>
                            <p className="font-heading text-2xl text-off-white" style={{ color: descentFrostbite.color }}>
                              {descentFrostbite.label}
                            </p>
                            <p className="text-foreground-subtle text-xs">Frostbite risk</p>
                          </div>
                        </div>
                        <div className="border-t border-coral/20 pt-3">
                          <p className="font-heading text-sm text-off-white">{descentClothing.kit.toUpperCase()}</p>
                          <p className="text-foreground-muted text-sm mt-1">{descentClothing.detail}</p>
                        </div>
                        {!isNaN(summitTempVal) && (summitTempVal - descentFeelsLike) > 10 && (
                          <p className="text-yellow-400 text-sm mt-3">
                            That is a {(summitTempVal - descentFeelsLike).toFixed(0)}&deg;C swing from summit air temp to descent feels-like.
                            Pack a gilet or jacket at the summit. Once you stop pedalling and the speed ramps up, the cold hits fast.
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/hydration" className="text-coral hover:text-coral/80 text-sm transition-colors">Hydration Calculator — fluid and electrolyte targets for the ride</Link></li>
                        <li><Link href="/tools/calories" className="text-coral hover:text-coral/80 text-sm transition-colors">Calories Burned Calculator — total energy cost (cold burns more)</Link></li>
                        <li><Link href="/tools/fuelling" className="text-coral hover:text-coral/80 text-sm transition-colors">In-Ride Fuelling Calculator — carbs and calories per hour</Link></li>
                        <li><Link href="/tools/climb-time" className="text-coral hover:text-coral/80 text-sm transition-colors">Climb Time Calculator — estimate ascent time before the descent</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">COLD WEATHER TRAINING IS A SKILL</p>
                      <p className="text-off-white font-heading text-lg mb-2">Kit selection, warm-up protocol, and pacing all change when the temperature drops.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        A structured programme accounts for seasonal conditions — not just power numbers.
                        If your winter rides leave you frozen or force you indoors too early, there is a better way.
                      </p>
                      <a href="https://www.skool.com/roadmancycling" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_wind_chill_community">
                        Join the Community
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Wind chill formula:</strong> This calculator uses the
                Environment Canada / US National Weather Service wind chill index, developed by Osczevski
                and Bluestein (2005). The model is based on heat transfer from the human face in controlled
                wind tunnel conditions. It replaced the older Siple-Passel model in 2001 and remains the
                standard across North America and most of Europe.
              </p>
              <p>
                <strong className="text-off-white">Why cycling speed matters:</strong> On a bike, your body
                is the windshield. At 30 km/h on a calm day, the air moving across your skin has the same
                cooling effect as a 30 km/h wind. Add a headwind and the effective wind speed climbs further.
                A tailwind partially cancels it — but even with a strong tailwind, some airflow reaches
                exposed skin.
              </p>
              <p>
                <strong className="text-off-white">Formula:</strong> Wind Chill (&deg;C) = 13.12 + 0.6215&times;T
                &minus; 11.37&times;V<sup>0.16</sup> + 0.3965&times;T&times;V<sup>0.16</sup>, where T is air
                temperature in &deg;C and V is effective wind speed in km/h. The formula is valid for
                T &le; 10&deg;C and V &ge; 4.8 km/h. For warmer conditions, this tool applies a conservative
                linear wind-cooling estimate.
              </p>
              <p>
                <strong className="text-off-white">Descent wind chill:</strong> Descents are the most
                dangerous scenario for cold exposure on a bike. You stop producing metabolic heat
                (no pedalling), but wind speed often doubles or triples compared to the climb. A
                15&deg;C summit that felt pleasant on the way up can produce a feels-like temperature
                below 5&deg;C at 60 km/h descent speed. This is why experienced riders always pack a
                gilet or wind jacket before a long descent.
              </p>
              <p>
                <strong className="text-off-white">Humidity effect:</strong> Below 10&deg;C, high humidity
                (&gt;70%) increases heat loss from the skin because moist air conducts heat roughly 25 times
                faster than dry air. The effect is modest — typically 1–2&deg;C at most — but
                noticeable when combined with wind.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> Wind chill is a measure of heat
                loss from exposed skin on the face and does not account for insulation from clothing,
                metabolic heat from pedalling, or solar radiation. On a sunny day with good kit, you will
                feel warmer than the number suggests. On a grey, wet day with poor layers, it can feel worse.
                Treat the output as a baseline for kit selection, not an absolute measure of thermal comfort.
              </p>
              <p className="text-xs text-foreground-subtle">
                Reference: Osczevski, R. &amp; Bluestein, M. (2005). The new wind chill equivalent
                temperature chart. <em>Bulletin of the American Meteorological Society</em>, 86(10),
                1453&ndash;1458. &middot; Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="wind-chill" />
      </main>
      <Footer />
    </>
  );
}
