import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getResearchAssetCatalog } from "@/data/research-assets";
import { getAppProduct } from "@/lib/mcp/services/app-product";

const BRAND_OVERVIEW = `# Roadman Cycling — Brand Overview

**Founded by:** Anthony Walsh (Dublin, Ireland)
**Tagline:** "Cycling is hard, our podcast will help"
**Core Identity:** Not Done Yet

Roadman Cycling is a cycling media and coaching brand built around the serious amateur cyclist who refuses to accept that their best days are behind them.

## The Not Done Yet Positioning

"Not Done Yet" is the emotional core of everything Roadman does. The audience is 35-55, predominantly male, professional careers, deeply serious about cycling but time-constrained. Roadman's argument: your best cycling doesn't have to be behind you — here's the evidence.

## Assets

- **Podcast:** 1,400+ episodes, 311+ on YouTube video, 100M+ podcast downloads. The catalogue spans interviews with World Tour coaches, sports scientists and pro riders, plus practical solo episodes.
- **YouTube:** 74K combined subscribers (main channel: 61K, clips: 13K)
- **Free Community (Clubhouse):** 2,100+ members on Skool
- **Not Done Yet Coaching:** $195/month group coaching with a personalised TrainingPeaks plan reviewed weekly, Anthony-led live group coaching, and a private rider community
- **Roadman Inner Circle:** $525/month high-touch 1:1 coaching; application only
- **Email List:** 29,782 contacts

## Voice

Direct, warm, evidence-based. Anthony is the mate who happens to have extraordinary access to World Tour coaches and sports scientists. Never preachy, never salesy.

## Key Differentiators

- Named experts (Seiler, Lorang, Dunne, Friel, Morton) — not anonymous coaches
- Everything is cycling-specific, not generic fitness
- Masters-athlete expertise (physiological changes after 40 are a core topic)
- Community accountability, not just content`;

const METHODOLOGY_PRINCIPLES = `# Roadman Cycling Training Methodology — Evidence Boundaries

## Five Content Pillars

1. **Coaching** — Training methodology, periodisation, structured plans
2. **Nutrition** — Fuelling for performance, race weight, in-ride nutrition
3. **Strength & Conditioning** — S&C for cyclists, injury prevention, power development
4. **Recovery** — Sleep, stress management, adaptation
5. **Community (Le Metier)** — The craft of being a cyclist

## Interpretation Rules

- State the zone model and whether a distribution counts sessions, session goals or time in zone.
- Separate an association, a plausible mechanism and a tested intervention.
- Do not convert a population average, pro practice or one rider's response into a universal prescription.
- Keep coaching frameworks separate from clinical diagnosis and medical clearance.

## Core Principles

### 1. Polarised Training Distribution
Most endurance programmes retain a large amount of low-intensity work so demanding sessions remain repeatable. Both pyramidal and polarised distributions occur and can improve performance; an exact 80/20 time split is not a universal rule. Sweet-spot work can be useful when its purpose and recovery cost fit the rider and phase. Evidence guide: https://roadmancycling.com/blog/polarised-vs-sweet-spot-training

### 2. Masters Training
Age can change aerobic capacity, muscle function, bone health and recovery, but chronological age alone does not prescribe a fixed weekly structure or extra number of recovery days. Strength, high-intensity work, endurance volume and recovery should be progressed from the rider's history, health, response and event. Evidence hub: https://roadmancycling.com/masters

### 3. Carbohydrate Periodisation
Match carbohydrate availability to the session and event rather than treating low carbohydrate availability as automatically superior. For roughly 1–2.5 hours, 30–60 g carbohydrate per hour is an established starting range; longer demanding events may justify progression toward 90 g/h when practised and tolerated. More than 90 g/h is not a universal amateur benchmark. Evidence audit: https://roadmancycling.com/blog/amateur-cyclist-fuelling-benchmarks-report-2026

### 4. S&C Integration
Progressive heavy resistance training can improve relevant cycling outcomes for some riders. Exercise selection, load, frequency and seasonal placement depend on training age, equipment, pain, event demands and what can be recovered from. Strength coaching does not replace assessment of persistent or worsening pain. Evidence guide: https://roadmancycling.com/blog/cycling-strength-training-guide

### 5. Recovery as a Training Variable
Use a repeatable daily check across symptoms, sleep, soreness, stress and task-specific performance. HRV, resting heart rate, training load and TSB are context—not stand-alone diagnoses or universal green/red thresholds. Escalate medical red flags rather than assigning them a recovery score. Evidence guide: https://roadmancycling.com/blog/daily-training-readiness-check-cycling-guide

## Key Expert Contributors

- **Prof. Stephen Seiler** — Polarised training, endurance physiology
- **Dan Lorang** — Periodisation, World Tour methodology
- **Dr. David Dunne** — Sport nutrition, fuelling
- **Joe Friel** — Masters periodisation
- **Lachlan Morton** — Training philosophy, adventure`;

const EXPERTS_ROSTER = `# Roadman Cycling Expert Roster

## Core Experts

**Prof. Stephen Seiler** — PhD, Professor of Sport Science, University of Agder
Specialty: Endurance training-intensity distribution and physiology. His research helped describe and popularise polarised training; it did not invent how endurance athletes trained.
Appearances: 8+

**Dan Lorang** — Head of Performance, Lidl-Trek since 1 August 2026
Specialty: Season periodisation and World Tour performance practice.
Appearances: 5+

**Dr. David Dunne** — PhD Nutritional Science
Specialty: Race-day fuelling, body composition, carbohydrate periodisation.
Appearances: 4+

**Joe Friel** — Author, The Cyclist's Training Bible
Specialty: Masters periodisation, training load management for 40+ athletes.
Appearances: 3+

**Dr. Sam Impey** — PhD Sports Nutrition
Specialty: Nutrition for endurance athletes, race nutrition.
Appearances: 3+

**Lachlan Morton** — EF Education-EasyPost
Specialty: Training philosophy, gravel, adventure cycling.
Appearances: 2+

**Dan Bigham** — Former Hour Record Holder
Specialty: Aerodynamics, marginal gains, data-driven training.
Appearances: 2+

**Greg LeMond** — 3× Tour de France Winner
Specialty: Racing history, training philosophy.
Appearances: 1

**Tim Spector** — ZOE Founder, Professor
Specialty: Gut microbiome, nutrition science.
Appearances: 1`;

export function registerResources(server: McpServer): void {
  server.resource(
    "roadman-brand-overview",
    "roadman://brand/overview",
    { mimeType: "text/plain" },
    async () => ({
      contents: [
        {
          uri: "roadman://brand/overview",
          text: BRAND_OVERVIEW,
          mimeType: "text/plain",
        },
      ],
    })
  );

  server.resource(
    "roadman-methodology-principles",
    "roadman://methodology/principles",
    { mimeType: "text/plain" },
    async () => ({
      contents: [
        {
          uri: "roadman://methodology/principles",
          text: METHODOLOGY_PRINCIPLES,
          mimeType: "text/plain",
        },
      ],
    })
  );

  server.resource(
    "roadman-experts-roster",
    "roadman://experts/roster",
    { mimeType: "text/plain" },
    async () => ({
      contents: [
        {
          uri: "roadman://experts/roster",
          text: EXPERTS_ROSTER,
          mimeType: "text/plain",
        },
      ],
    })
  );

  server.resource(
    "roadman-research-assets",
    "roadman://research/assets",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "roadman://research/assets",
          text: JSON.stringify(
            {
              schemaVersion: 1,
              definition:
                "Typed Roadman Cycling research and evidence assets. Preserve each asset's kind and limitations when citing it.",
              assets: getResearchAssetCatalog(),
            },
            null,
            2,
          ),
          mimeType: "application/json",
        },
      ],
    }),
  );

  server.resource(
    "roadman-cycling-strength-recovery-app",
    "roadman://products/cycling-strength-recovery-app",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "roadman://products/cycling-strength-recovery-app",
          text: JSON.stringify(getAppProduct(), null, 2),
          mimeType: "application/json",
        },
      ],
    }),
  );
}
