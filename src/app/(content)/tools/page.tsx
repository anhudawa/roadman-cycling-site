import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Free Cycling Calculators & Tools — FTP, Fuelling, Weight",
  description:
    "35+ free cycling tools built on the science discussed on the podcast. FTP zones, race weight, in-ride fuelling, tyre pressure, energy availability, and more. Stop guessing.",
  alternates: {
    canonical: "https://roadmancycling.com/tools",
  },
  openGraph: {
    title: "Free Cycling Calculators & Tools — FTP, Fuelling, Weight",
    description:
      "35+ free cycling tools built on the science discussed on the podcast. FTP zones, race weight, in-ride fuelling, tyre pressure, energy availability, and more.",
    type: "website",
    url: "https://roadmancycling.com/tools",
  },
};

const tools = [
  {
    title: "Race Predictor",
    description:
      "Enter your FTP, weight, and course — we simulate the ride on real elevation data and show a finish-time range. Free for the prediction. The $29 Race Report adds your full pacing plan, fuelling strategy, and equipment what-ifs.",
    href: "/predict",
    status: "live" as const,
  },
  {
    title: "Race Time Predictor",
    description:
      "No GPX file? Enter your weight, power, distance, and total climbing for a physics-based finish time, average speed, and average power. Free — pacing, fuelling, and per-segment detail open in the community.",
    href: "/tools/race-predictor",
    status: "live" as const,
  },
  {
    title: "Plateau Diagnostic",
    description:
      "Stuck on the same FTP for a year? Twelve questions. Four minutes. One specific answer keyed to your limiter.",
    href: "/plateau",
    status: "live" as const,
  },
  {
    title: "Cycling Strength Session Planner",
    description:
      "Map your real riding week and place one or two 30, 45 or 60-minute strength sessions without putting them directly before a key or long ride.",
    href: "/tools/strength-session-planner",
    status: "live" as const,
  },
  {
    title: "Ask Roadman",
    description:
      "Anthony's coaching brain on tap. Ask any cycling question and get an answer grounded in 1,400+ episodes with World Tour coaches and sports scientists.",
    href: "/ask",
    status: "live" as const,
  },
  {
    title: "Coaching Assessment",
    description:
      "Ten questions to surface the right coaching pathway for where you are now — Clubhouse, Not Done Yet group coaching, or Roadman Inner Circle 1:1.",
    href: "/assessment",
    status: "live" as const,
  },
  {
    title: "FTP Zone Calculator",
    description:
      "Enter your FTP and get your complete 7-zone power table with training recommendations for each zone.",
    href: "/tools/ftp-zones",
    status: "live" as const,
  },
  {
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear PSI based on weight, tyre width, rim width, tube type, and road surface.",
    href: "/tools/tyre-pressure",
    status: "live" as const,
  },
  {
    title: "Race Weight Calculator",
    description:
      "Your target weight range for peak cycling performance based on height, body composition, and event type.",
    href: "/tools/race-weight",
    status: "live" as const,
  },
  {
    title: "In-Ride Fuelling Calculator",
    description:
      "Exactly how many carbs and how much fluid you need per hour based on ride duration, intensity, and weight.",
    href: "/tools/fuelling",
    status: "live" as const,
  },
  {
    title: "Cycling Fuel Planner",
    description:
      "Daily calorie target, macro split, in-ride carbs, and hydration for the session you're riding. Fuel-for-the-work-required, the way the pros eat.",
    href: "/tools/fuel-planner",
    status: "live" as const,
  },
  {
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identify RED-S risk before it becomes a problem.",
    href: "/tools/energy-availability",
    status: "live" as const,
  },
  {
    title: "MTB Setup Calculator",
    description:
      "Suspension pressure, sag targets, and tyre pressure for your mountain bike. One form, complete setup.",
    href: "/tools/shock-pressure",
    status: "live" as const,
  },
  {
    title: "Masters Recovery Score",
    description:
      "Four inputs — age, training hours, sleep, and stress — into a 0–100 recovery score with a recommendation calibrated for cyclists over 40.",
    href: "/tools/masters-recovery-score",
    status: "live" as const,
  },
  {
    title: "Masters FTP Benchmark",
    description:
      "Where your FTP sits among trained amateur masters cyclists in your age group — 40-44, 45-49, 50-54, 55-59, 60+. Percentile and watts to next band.",
    href: "/tools/masters-ftp-benchmark",
    status: "live" as const,
  },
  {
    title: "FTP Test Calculator",
    description:
      "Enter your 20-minute, 8-minute, or ramp test result and get your estimated FTP. Includes W/kg, zone preview, and protocol comparison.",
    href: "/tools/ftp-test",
    status: "live" as const,
  },
  {
    title: "W/kg Calculator",
    description:
      "Calculate cycling FTP watts per kilogram from power and body weight. Reference ranges, evidence, and interpretation limits included.",
    href: "/tools/wkg",
    status: "live" as const,
  },
  {
    title: "TSS Calculator",
    description:
      "Calculate Training Stress Score from your ride duration, power, and FTP. Recovery benchmarks and training load interpretation included.",
    href: "/tools/tss",
    status: "live" as const,
  },
  {
    title: "Heart Rate Zone Calculator",
    description:
      "Calculate five continuous cycling heart-rate zones from measured max HR or a cycling LTHR estimate. Transparent method, worked examples, and evidence limits.",
    href: "/tools/hr-zones",
    status: "live" as const,
  },
  {
    title: "VO2max Estimator",
    description:
      "Estimate your VO2max from ramp test peak power or FTP. Age-adjusted percentiles, masters benchmarks, and classification from recreational to world-class.",
    href: "/tools/vo2max",
    status: "live" as const,
  },
  {
    title: "Sweet Spot Calculator",
    description:
      "Calculate the common 88–94% FTP sweet spot band, compare neighbouring ranges, and review response-led sample sessions.",
    href: "/tools/sweet-spot",
    status: "live" as const,
  },
  {
    title: "Interval Session Builder",
    description:
      "Enter your FTP, pick a training goal, and get a complete structured interval session with power targets, cadence, TSS estimate, and recovery guidance.",
    href: "/tools/interval-builder",
    status: "live" as const,
  },
  {
    title: "Training Load Calculator",
    description:
      "Calculate CTL, ATL, and TSB from starting load and daily TSS. See the formulas, a worked rest-day example, and how to interpret the result.",
    href: "/tools/training-load",
    status: "live" as const,
  },
  {
    title: "Training Readiness Check",
    description:
      "Organise eight daily cycling-readiness signals before training. A free 0–24 context check with clear evidence limits.",
    href: "/tools/training-readiness",
    status: "live" as const,
  },
  {
    title: "Power-to-Speed Calculator",
    description:
      "Convert between cycling power and speed using real physics. Gradient, wind, riding position, rolling resistance, altitude — see what your watts buy you on any road.",
    href: "/tools/power-speed",
    status: "live" as const,
  },
  {
    title: "Calories Burned Calculator",
    description:
      "How many calories you actually burn on the bike. Calculate from effort level or average power, see fat vs carb fuel split, and get post-ride refuelling targets.",
    href: "/tools/calories",
    status: "live" as const,
  },
  {
    title: "Sweat Rate Calculator",
    description:
      "Calculate cycling sweat rate from pre/post body mass, fluid, urine, and ride time. See the formula, assumptions, and safe planning boundaries.",
    href: "/tools/hydration",
    status: "live" as const,
  },
  {
    title: "Fuelling Self-Assessment",
    description:
      "A 10-question self-assessment that evaluates your cycling nutrition across pre-ride fuelling, in-ride carbs, recovery nutrition, hydration, and race-day planning. Scored 0–30.",
    href: "/tools/fuelling-screen",
    status: "live" as const,
  },
  {
    title: "Climbing Time Estimator",
    description:
      "Estimate how long it will take to climb any hill or col based on your power, weight, gradient, and distance. Physics-based model with famous climb comparisons.",
    href: "/tools/climb-time",
    status: "live" as const,
  },
  {
    title: "VAM Calculator",
    description:
      "Calculate your VAM (vertical ascent rate) from elevation and time. Amateur-to-pro benchmarks, climbing W/kg estimate, and famous col comparisons.",
    href: "/tools/vam",
    status: "live" as const,
  },
  {
    title: "Gear Ratio Calculator",
    description:
      "Compare exact chainring and cassette combinations. Speed at cadence, gear inches, development, range, overlap, and custom wheel rollout.",
    href: "/tools/gear-ratio",
    status: "live" as const,
  },
  {
    title: "Cadence Calculator",
    description:
      "Calculate cycling cadence from speed, gear ratio, and wheel size — or find your speed at any RPM. Cadence zone benchmarks and research-backed guidance included.",
    href: "/tools/cadence",
    status: "live" as const,
  },
  {
    title: "Body Composition Calculator",
    description:
      "Estimate body fat, lean mass, and fat mass using the US Navy method. Cycling-specific W/kg projections, minimum safe racing weight, and RED-S risk flags.",
    href: "/tools/body-composition",
    status: "live" as const,
  },
  {
    title: "Cycling Age Grade Calculator",
    description:
      "Age-grade your cycling power to see how your FTP compares to your peak potential. Percentile rankings for trained masters cyclists by age and gender.",
    href: "/tools/age-grade",
    status: "live" as const,
  },
  {
    title: "Your Cycling Age",
    description:
      "How old is your cycling body? Your birth certificate says one thing — your power numbers say something else. Find out whether you're riding younger or older than your real age.",
    href: "/tools/cycling-age",
    status: "live" as const,
  },
  {
    title: "Recovery Readiness Screen",
    description:
      "Organise ten cycling-recovery signals across sleep, recent load, fuelling, stress, and wellbeing. Free 0–30 context screen with clear evidence limits.",
    href: "/tools/recovery-screen",
    status: "live" as const,
  },
  {
    title: "Wind Chill Calculator",
    description:
      "Calculate the wind chill effect at cycling speed. Enter air temperature, riding speed, and wind conditions — with clothing recommendations and descent scenarios.",
    href: "/tools/wind-chill",
    status: "live" as const,
  },
  {
    title: "Run-to-Ride Converter",
    description:
      "Convert running and cycling distance or time with published MET values. See an energy-cost match plus clear limits on fitness, impact, and training.",
    href: "/tools/run-ride-converter",
    status: "live" as const,
  },
  {
    title: "Race Day Checklist",
    description:
      "An interactive pre-race checklist that guides you through 48 hours before, night before, and race morning preparation. Check items off, add your own, track progress.",
    href: "/tools/race-day-checklist",
    status: "live" as const,
  },
];

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Tools & Calculators",
          description:
            "Free interactive tools for serious cyclists. Tyre pressure, FTP zones, race weight, fuelling, energy availability, and shock pressure calculators.",
          url: "https://roadmancycling.com/tools",
          numberOfItems: tools.length,
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                YOUR TOOLKIT
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                Free tools built on the same science discussed on the podcast.
                Stop guessing. Start knowing.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, i) => (
                <ScrollReveal key={tool.href} direction="up" delay={i * 0.06}>
                <Card
                  href={tool.href}
                  className="p-6 group h-full"
                >
                  <h3
                    className="font-heading text-xl mb-2 text-off-white group-hover:text-coral transition-colors"
                  >
                    {tool.title.toUpperCase()}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4 text-foreground-muted"
                  >
                    {tool.description}
                  </p>
                  <span className="text-coral text-sm font-body font-medium">
                    Try it free &rarr;
                  </span>
                </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
