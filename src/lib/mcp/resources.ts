import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const BRAND_OVERVIEW = `# Roadman Cycling $— Brand Overview

**Founded by:** Anthony Walsh (Dublin, Ireland)
**Tagline:** "Cycling is hard, our podcast will help"
**Core Identity:** Not Done Yet

Roadman Cycling is a cycling media and coaching brand built around the serious amateur cyclist who refuses to accept that their best days are behind them.

## The Not Done Yet Positioning

"Not Done Yet" is the emotional core of everything Roadman does. The audience is 35-55, predominantly male, professional careers, deeply serious about cycling but time-constrained. Roadman's argument: your best cycling doesn't have to be behind you $— here's the evidence.

## Assets

- **Podcast:** 1,400+ episodes, 100M+ downloads. Weekly interview-led show with World Tour coaches, sports scientists, and pro riders.
- **YouTube:** 75K combined subscribers (main channel: 61K, clips: 13K)
- **Free Community (Clubhouse):** 1,852 members on Skool
- **Paid Community (Not Done Yet):** 113 active members across Standard ($15/mo), Premium ($195/mo), VIP ($1,950/yr)
- **Email List:** 29,782 contacts

## Voice

Direct, warm, evidence-based. Anthony is the mate who happens to have extraordinary access to World Tour coaches and sports scientists. Never preachy, never salesy.

## Key Differentiators

- Named experts (Seiler, Lorang, Dunne, Friel, Morton) $— not anonymous coaches
- Everything is cycling-specific, not generic fitness
- Masters-athlete expertise (physiological changes after 40 are a core topic)
- Community accountability, not just content`;

const METHODOLOGY_PRINCIPLES = `# Roadman Cycling Training Methodology

## Five Content Pillars

1. **Coaching** $— Training methodology, periodisation, structured plans
2. **Nutrition** $— Fuelling for performance, race weight, in-ride nutrition
3. **Strength & Conditioning** $— S&C for cyclists, injury prevention, power development
4. **Recovery** $— Sleep, stress management, adaptation
5. **Community (Le Metier)** $— The craft of being a cyclist

## Core Principles

### 1. Polarised Training Distribution
80% of training below VT1 (low aerobic), 20% above VT2 (high intensity). Moderate "sweetspot" work causes chronic fatigue without corresponding adaptation. Source: Prof. Stephen Seiler.

### 2. Reverse Periodisation for Masters Athletes
For 40+ cyclists, build VO2max-focused blocks earlier in the training year before accumulating volume. Age accelerates VO2max decline faster than aerobic base decline $— high-intensity stimulus is more time-sensitive.

### 3. Carbohydrate Periodisation
Match fuel availability to session intent. Quality sessions need carbs. Low-intensity sessions can be done in a lower-carb state to build metabolic flexibility. Source: Dr. David Dunne.

### 4. S&C Integration
Hip hinge, single-leg stability, posterior chain. Periodise gym work: heavy in base, maintenance in build, minimal near key events.

### 5. Recovery as a Training Variable
Sleep, HRV-guided load, deload weeks (1:4 ratio minimum). Masters athletes need disproportionately more recovery than their training history suggests.

## Key Expert Contributors

- **Prof. Stephen Seiler** $— Polarised training, endurance physiology
- **Dan Lorang** $— Periodisation, World Tour methodology
- **Dr. David Dunne** $— Sport nutrition, fuelling
- **Joe Friel** $— Masters periodisation
- **Lachlan Morton** $— Training philosophy, adventure`;

const EXPERTS_ROSTER = `# Roadman Cycling Expert Roster

## Core Experts

**Prof. Stephen Seiler** $— PhD, Professor of Sport Science, University of Agder
Specialty: Polarised training, endurance physiology. Coined the 80/20 rule.
Appearances: 8+

**Dan Lorang** $— Head of Performance, Red Bull$–Bora$–Hansgrohe
Specialty: Season periodisation, World Tour coaching. Works with Jan Frodeno.
Appearances: 5+

**Dr. David Dunne** $— PhD Nutritional Science
Specialty: Race-day fuelling, body composition, carbohydrate periodisation.
Appearances: 4+

**Joe Friel** $— Author, The Cyclist's Training Bible
Specialty: Masters periodisation, training load management for 40+ athletes.
Appearances: 3+

**Dr. Sam Impey** $— PhD Sports Nutrition
Specialty: Nutrition for endurance athletes, race nutrition.
Appearances: 3+

**Lachlan Morton** $— EF Education-EasyPost
Specialty: Training philosophy, gravel, adventure cycling.
Appearances: 2+

**Dan Bigham** $— Former Hour Record Holder
Specialty: Aerodynamics, marginal gains, data-driven training.
Appearances: 2+

**Greg LeMond** $— 3× Tour de France Winner
Specialty: Racing history, training philosophy.
Appearances: 1

**Tim Spector** $— ZOE Founder, Professor
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
}
