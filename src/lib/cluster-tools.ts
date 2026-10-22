import type { AnswerCluster } from "@/lib/answers";

export interface RelatedTool {
  title: string;
  href: string;
  description: string;
}

/**
 * Maps each answer cluster to the tools most relevant to that topic.
 * Used on answer pages to surface calculator links in context.
 */
const CLUSTER_TOOLS: Record<AnswerCluster, RelatedTool[]> = {
  ftp: [
    { title: "FTP Zone Calculator", href: "/tools/ftp-zones", description: "Complete 7-zone power table from your FTP." },
    { title: "FTP Test Calculator", href: "/tools/ftp-test", description: "Estimate FTP from 20-min, 8-min, or ramp test." },
    { title: "Sweet Spot Calculator", href: "/tools/sweet-spot", description: "Calculate your 88–94% FTP sweet spot band." },
    { title: "TSS Calculator", href: "/tools/tss", description: "Training Stress Score from duration, power, and FTP." },
    { title: "W/kg Calculator", href: "/tools/wkg", description: "Watts per kilogram from power and body weight." },
  ],
  zone2: [
    { title: "Heart Rate Zone Calculator", href: "/tools/hr-zones", description: "Five HR zones from max HR or LTHR." },
    { title: "FTP Zone Calculator", href: "/tools/ftp-zones", description: "Complete 7-zone power table from your FTP." },
    { title: "Training Load Calculator", href: "/tools/training-load", description: "CTL, ATL, and TSB from daily TSS." },
    { title: "Calories Burned Calculator", href: "/tools/calories", description: "Calories burned and fuel split by intensity." },
  ],
  nutrition: [
    { title: "Cycling Fuel Planner", href: "/tools/fuel-planner", description: "Daily calories, macros, and in-ride carbs." },
    { title: "In-Ride Fuelling Calculator", href: "/tools/fuelling", description: "Carbs and fluid per hour for your ride." },
    { title: "Energy Availability Calculator", href: "/tools/energy-availability", description: "Check energy availability and RED-S risk." },
    { title: "Fuelling Self-Assessment", href: "/tools/fuelling-screen", description: "10-question nutrition self-assessment." },
    { title: "Sweat Rate Calculator", href: "/tools/hydration", description: "Calculate sweat rate from body mass change." },
    { title: "Calories Burned Calculator", href: "/tools/calories", description: "Calories burned and fuel split by intensity." },
  ],
  strength: [
    { title: "Cycling Strength Session Planner", href: "/tools/strength-session-planner", description: "Place strength sessions around your rides." },
    { title: "Training Readiness Check", href: "/tools/training-readiness", description: "Eight readiness signals before training." },
    { title: "Body Composition Calculator", href: "/tools/body-composition", description: "Body fat, lean mass, and W/kg projections." },
  ],
  recovery: [
    { title: "Masters Recovery Score", href: "/tools/masters-recovery-score", description: "0–100 recovery score for cyclists over 40." },
    { title: "Recovery Readiness Screen", href: "/tools/recovery-screen", description: "Ten recovery signals across sleep, load, and stress." },
    { title: "Training Readiness Check", href: "/tools/training-readiness", description: "Eight readiness signals before training." },
    { title: "Training Load Calculator", href: "/tools/training-load", description: "CTL, ATL, and TSB from daily TSS." },
  ],
  masters: [
    { title: "Masters FTP Benchmark", href: "/tools/masters-ftp-benchmark", description: "Where your FTP sits among masters cyclists." },
    { title: "Masters Recovery Score", href: "/tools/masters-recovery-score", description: "0–100 recovery score for cyclists over 40." },
    { title: "Cycling Age Grade Calculator", href: "/tools/age-grade", description: "Age-grade your power against peak potential." },
    { title: "Your Cycling Age", href: "/tools/cycling-age", description: "Is your cycling body younger or older than you?" },
  ],
  racing: [
    { title: "Race Time Predictor", href: "/tools/race-predictor", description: "Physics-based finish time from weight and power." },
    { title: "Race Day Checklist", href: "/tools/race-day-checklist", description: "Interactive pre-race preparation checklist." },
    { title: "Race Weight Calculator", href: "/tools/race-weight", description: "Target weight range for peak performance." },
    { title: "Climbing Time Estimator", href: "/tools/climb-time", description: "How long any climb will take at your power." },
    { title: "Cycling Fuel Planner", href: "/tools/fuel-planner", description: "Daily calories, macros, and in-ride carbs." },
  ],
  periodisation: [
    { title: "Training Load Calculator", href: "/tools/training-load", description: "CTL, ATL, and TSB from daily TSS." },
    { title: "TSS Calculator", href: "/tools/tss", description: "Training Stress Score from duration, power, and FTP." },
    { title: "Interval Session Builder", href: "/tools/interval-builder", description: "Structured interval sessions from your FTP." },
    { title: "Training Readiness Check", href: "/tools/training-readiness", description: "Eight readiness signals before training." },
  ],
  power: [
    { title: "W/kg Calculator", href: "/tools/wkg", description: "Watts per kilogram from power and body weight." },
    { title: "Power-to-Speed Calculator", href: "/tools/power-speed", description: "Convert between power and speed on any road." },
    { title: "FTP Zone Calculator", href: "/tools/ftp-zones", description: "Complete 7-zone power table from your FTP." },
    { title: "VO2max Estimator", href: "/tools/vo2max", description: "Estimate VO2max from ramp test or FTP." },
    { title: "VAM Calculator", href: "/tools/vam", description: "Vertical ascent rate with pro benchmarks." },
  ],
  mental: [
    { title: "Training Readiness Check", href: "/tools/training-readiness", description: "Eight readiness signals before training." },
    { title: "Recovery Readiness Screen", href: "/tools/recovery-screen", description: "Ten recovery signals across sleep, load, and stress." },
  ],
  bikefit: [
    { title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure", description: "Front and rear PSI for your setup." },
    { title: "Gear Ratio Calculator", href: "/tools/gear-ratio", description: "Compare chainring and cassette combinations." },
    { title: "Cadence Calculator", href: "/tools/cadence", description: "Cadence from speed, gear ratio, and wheel size." },
    { title: "MTB Setup Calculator", href: "/tools/shock-pressure", description: "Suspension pressure, sag, and tyre pressure." },
  ],
  heat: [
    { title: "Sweat Rate Calculator", href: "/tools/hydration", description: "Calculate sweat rate from body mass change." },
    { title: "Wind Chill Calculator", href: "/tools/wind-chill", description: "Wind chill at cycling speed with clothing advice." },
    { title: "In-Ride Fuelling Calculator", href: "/tools/fuelling", description: "Carbs and fluid per hour for your ride." },
  ],
  "cross-training": [
    { title: "Run-to-Ride Converter", href: "/tools/run-ride-converter", description: "Convert running and cycling distance or time." },
    { title: "Cycling Strength Session Planner", href: "/tools/strength-session-planner", description: "Place strength sessions around your rides." },
    { title: "Calories Burned Calculator", href: "/tools/calories", description: "Calories burned and fuel split by intensity." },
  ],
  "cycling-tech": [
    { title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure", description: "Front and rear PSI for your setup." },
    { title: "Gear Ratio Calculator", href: "/tools/gear-ratio", description: "Compare chainring and cassette combinations." },
    { title: "MTB Setup Calculator", href: "/tools/shock-pressure", description: "Suspension pressure, sag, and tyre pressure." },
    { title: "Power-to-Speed Calculator", href: "/tools/power-speed", description: "Convert between power and speed on any road." },
  ],
};

/** Return the tools associated with a given answer cluster. */
export function getToolsForCluster(cluster: AnswerCluster): RelatedTool[] {
  return CLUSTER_TOOLS[cluster] ?? [];
}
