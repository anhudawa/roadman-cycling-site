import type { ContentPillar } from "@/types";

export interface ToolEntry {
  slug: string;
  title: string;
  description: string;
  pillar: ContentPillar;
  apiEndpoint?: string;
  inputs?: string[];
}

/**
 * Master list of every public tool. The on-page calculator lives at
 * /tools/{slug}; tools with a JSON API list `apiEndpoint` so AI agents
 * can call them directly. Consumed by /feeds/tools.json and /api/v1/search.
 */
export const TOOLS: ToolEntry[] = [
  {
    slug: "ftp-zones",
    title: "FTP Zone Calculator",
    description:
      "Enter your FTP and get a complete 7-zone power table with wattage ranges and (optionally) heart-rate ranges per zone.",
    pillar: "coaching",
    apiEndpoint: "/api/v1/tools/ftp-zones",
    inputs: ["ftp", "lthr"],
  },
  {
    slug: "race-weight",
    title: "Race Weight Calculator",
    description:
      "Target weight range for peak cycling performance based on height, body composition, gender, and event type.",
    pillar: "community",
    apiEndpoint: "/api/v1/tools/race-weight",
    inputs: ["height", "weight", "bodyFat", "gender", "eventType"],
  },
  {
    slug: "tyre-pressure",
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear PSI based on weight, tyre width, rim width, tube type, and road surface.",
    pillar: "coaching",
  },
  {
    slug: "fuelling",
    title: "In-Ride Fuelling Calculator",
    description:
      "Carbs per hour and fluid per hour based on ride duration, intensity, and weight.",
    pillar: "nutrition",
  },
  {
    slug: "energy-availability",
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identifies RED-S risk before it becomes a problem.",
    pillar: "recovery",
  },
  {
    slug: "fuel-planner",
    title: "Cycling Fuel Planner",
    description:
      "Daily calorie target, macro split, in-ride carbs, and hydration for the session you're riding — fuel-for-the-work-required.",
    pillar: "nutrition",
  },
  {
    slug: "wkg",
    title: "W/kg Calculator",
    description:
      "Convert between FTP and watts-per-kilogram, with category benchmarks (Cat 5 → World Tour).",
    pillar: "strength",
  },
  {
    slug: "hr-zones",
    title: "Heart Rate Zone Calculator",
    description:
      "5-zone heart-rate breakdown from %HRmax or %LTHR with training-purpose descriptions per zone.",
    pillar: "coaching",
  },
  {
    slug: "shock-pressure",
    title: "MTB Setup Calculator",
    description:
      "Suspension pressure, sag targets, and tyre pressure for your mountain bike.",
    pillar: "coaching",
  },
  {
    slug: "race-predictor",
    title: "Race Time Predictor",
    description:
      "Physics-based finish-time estimate from your weight, power, and the course distance and climbing — gravity, rolling resistance, aero drag, and drivetrain loss.",
    pillar: "coaching",
    inputs: ["riderWeight", "bikeWeight", "power", "distance", "elevation", "crr", "cda"],
  },
  {
    slug: "run-ride-converter",
    title: "Run↔Ride Equivalence Converter",
    description:
      "Convert between running pace and cycling power. Estimates equivalent efforts across both sports using VO2max as the bridge.",
    pillar: "coaching",
  },
  {
    slug: "tss",
    title: "TSS Calculator",
    description:
      "Training Stress Score from ride duration, power, and FTP — with recovery benchmarks and training load interpretation.",
    pillar: "coaching",
    inputs: ["duration", "power", "ftp"],
  },
  {
    slug: "vo2max",
    title: "VO2max Estimator",
    description:
      "Estimate your VO2max from ramp test peak power or FTP — with age-adjusted percentiles and masters benchmarks.",
    pillar: "coaching",
    inputs: ["power", "weight", "age", "gender"],
  },
  {
    slug: "power-speed",
    title: "Power↔Speed Calculator",
    description:
      "Convert between cycling power and speed. Physics-based model with gradient, wind, position, and rolling resistance — see exactly what your watts buy you.",
    pillar: "coaching",
    inputs: ["power", "weight", "gradient", "cda", "crr"],
  },
  {
    slug: "calories",
    title: "Calories Burned Calculator",
    description:
      "Calories burned cycling from duration and intensity or average power — with fat/carb fuel split and post-ride refuelling guidance.",
    pillar: "nutrition",
    inputs: ["weight", "duration", "intensity", "power"],
  },
  {
    slug: "gear-ratio",
    title: "Gear Ratio Calculator",
    description:
      "Chainring and cassette combinations mapped to gear ratios, gear inches, development, and speed at cadence — with visual overlap chart.",
    pillar: "coaching",
    inputs: ["chainring", "cassette", "wheelSize"],
  },
  {
    slug: "vam",
    title: "Climbing Calculator (VAM)",
    description:
      "Vertical ascent rate from elevation and time — with amateur-to-pro benchmarks, climbing W/kg estimate, and famous col comparisons.",
    pillar: "coaching",
    inputs: ["elevation", "time", "gradient", "weight"],
  },
  {
    slug: "ftp-test",
    title: "FTP Test Calculator",
    description:
      "Estimate your FTP from any test protocol — 20-minute, 8-minute, ramp, or 60-minute. Includes W/kg benchmark and zone preview.",
    pillar: "coaching",
    inputs: ["protocol", "testPower", "weight"],
  },
  {
    slug: "training-load",
    title: "Training Load Calculator (CTL/ATL/TSB)",
    description:
      "Calculate Chronic Training Load, Acute Training Load and Training Stress Balance from daily TSS values — the Performance Management Chart math with form interpretation and TSB zone guidance.",
    pillar: "coaching",
    inputs: ["dailyTss"],
  },
  {
    slug: "cadence",
    title: "Cadence Calculator",
    description:
      "Find your pedalling RPM at any speed and gear combination — or see what speed a target cadence produces. Includes cadence zone benchmarks and research on optimal pedalling rate.",
    pillar: "coaching",
    inputs: ["speed", "wheelSize", "chainring", "cog"],
  },
  {
    slug: "hydration",
    title: "Hydration Calculator",
    description:
      "Estimate sweat losses and build a per-ride hydration plan from duration, intensity, temperature, and body weight. Includes sodium guidance and bottle count.",
    pillar: "nutrition",
    inputs: ["duration", "intensity", "temperature", "weight"],
  },
  {
    slug: "climb-time",
    title: "Climbing Time Estimator",
    description:
      "Estimate how long it will take to climb any hill or col based on power, weight, gradient, and distance. Physics-based model with VAM output and famous climb comparisons.",
    pillar: "coaching",
    inputs: ["power", "weight", "distance", "gradient", "elevation", "wind"],
  },
  {
    slug: "wind-chill",
    title: "Wind Chill Calculator for Cyclists",
    description:
      "Calculate the feels-like temperature at cycling speed. Accounts for riding speed, headwind, tailwind, and humidity — with descent scenarios, frostbite risk, and clothing recommendations.",
    pillar: "community",
    inputs: ["temperature", "cyclingSpeed", "headwind", "tailwind", "humidity"],
  },
  {
    slug: "masters-ftp-benchmark",
    title: "Masters FTP Benchmark",
    description:
      "Enter age, FTP, and weight. See your percentile against trained amateur masters cyclists in your decade — 40-44, 45-49, 50-54, 55-59, 60+.",
    pillar: "coaching",
    inputs: ["age", "ftp", "weight"],
  },
  {
    slug: "masters-recovery-score",
    title: "Masters Recovery Score",
    description:
      "A recovery audit calibrated for cyclists 40+. Combines age, weekly hours, sleep, and life stress into a 0-100 score plus your single biggest lever to change this week.",
    pillar: "recovery",
    inputs: ["age", "weeklyHours", "sleepHours", "stressLevel"],
  },
  {
    slug: "sweet-spot",
    title: "Sweet Spot Calculator",
    description:
      "Enter your FTP and get your sweet spot power range with session structures, weekly volume guidance, and when to choose sweet spot over tempo or threshold.",
    pillar: "coaching",
    inputs: ["ftp"],
  },
  {
    slug: "age-grade",
    title: "Cycling Age Grade Calculator",
    description:
      "Age-grade your cycling power. See how your FTP compares to your peak potential, where you rank among trained masters cyclists, and how much performance structured training preserves.",
    pillar: "coaching",
    inputs: ["age", "ftp", "weight", "gender"],
  },
  {
    slug: "body-composition",
    title: "Cycling Body Composition Calculator",
    description:
      "Estimate body fat percentage, lean mass, and fat mass using the US Navy method — with cycling-specific context: W/kg impact of body composition changes, minimum safe racing weight, and RED-S risk flags.",
    pillar: "nutrition",
    inputs: ["weight", "height", "gender", "age", "waist", "neck", "hip", "ftp"],
  },
  {
    slug: "interval-builder",
    title: "Interval Session Builder",
    description:
      "Pick your training goal, enter your FTP, and get a complete structured interval session — warm-up through cool-down, with power targets, cadence, TSS estimate, and recovery guidance.",
    pillar: "coaching",
    inputs: ["ftp", "availableTime", "trainingGoal", "experienceLevel"],
  },
  {
    slug: "recovery-screen",
    title: "Recovery Readiness Screen",
    description:
      "A 10-question self-assessment screening your sleep, training load, nutrition, and stress. Scored 0–30 with personalised recommendations based on your weakest areas.",
    pillar: "recovery",
  },
  {
    slug: "fuelling-screen",
    title: "Fuelling Self-Assessment",
    description:
      "A 10-question self-assessment that evaluates your cycling nutrition across pre-ride fuelling, in-ride carbs, recovery nutrition, hydration, and race-day planning. Scored 0–30 with personalised recommendations.",
    pillar: "nutrition",
  },
  {
    slug: "training-readiness",
    title: "Training Readiness Check",
    description:
      "A quick 8-question daily readiness check that tells you whether today should be a hard session, easy spin, or rest day. Scored 0–24 with an instant verdict.",
    pillar: "recovery",
  },
  {
    slug: "race-day-checklist",
    title: "Race Day Checklist",
    description:
      "Interactive pre-race checklist covering 48 hours before, night before, and race morning. Check off items, add your own, track completion across every phase.",
    pillar: "coaching",
  },
];

export function getAllTools(): ToolEntry[] {
  return TOOLS;
}

export function getToolBySlug(slug: string): ToolEntry | null {
  return TOOLS.find((t) => t.slug === slug) ?? null;
}
