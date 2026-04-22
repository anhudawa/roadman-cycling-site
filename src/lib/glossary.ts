import { type ContentPillar } from "@/types";

export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  extendedDefinition: string;
  pillar: ContentPillar;
  relatedTerms: string[];
  relatedArticle?: string;
  relatedTool?: string;
  relatedTopicHub?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "ftp",
    term: "FTP (Functional Threshold Power)",
    definition: "The highest average power a cyclist can sustain for approximately one hour, measured in watts. All seven training zones are calculated as percentages of FTP.",
    extendedDefinition: "FTP is the single most important metric in cycling training. Introduced by Dr Andrew Coggan, it represents the boundary between sustainable aerobic work and unsustainable anaerobic effort. Most riders test FTP via a 20-minute all-out effort (multiplied by 0.95) or a ramp test. Typical amateur FTP ranges from 150W to 350W depending on fitness, body weight, and training history. FTP expressed as watts per kilogram (W/kg) is a better predictor of climbing and overall performance.",
    pillar: "coaching",
    relatedTerms: ["w-kg", "sweet-spot", "threshold", "vo2max"],
    relatedArticle: "/blog/ftp-training-zones-cycling-complete-guide",
    relatedTool: "/tools/ftp-zones",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "vo2max",
    term: "VO2max",
    definition: "The maximum rate at which the body can consume oxygen during intense exercise. A key determinant of endurance cycling performance, typically measured in ml/kg/min.",
    extendedDefinition: "VO2max sets the ceiling for aerobic power production. Trained male cyclists typically range from 50-70 ml/kg/min; elite World Tour riders reach 80-90+. While partly genetic, VO2max is trainable through high-intensity interval work — particularly 3-8 minute efforts at 106-120% of FTP. Prof. Seiler's research shows that the polarised model (80% easy, 20% hard) is the most effective distribution for improving VO2max over time.",
    pillar: "coaching",
    relatedTerms: ["ftp", "lactate-threshold", "polarised-training"],
    relatedArticle: "/blog/cycling-vo2max-intervals",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "polarised-training",
    term: "Polarised Training",
    definition: "A training intensity distribution where approximately 80% of training time is spent at low intensity (Zone 1-2) and 20% at high intensity (Zone 4+), with minimal time in the moderate 'grey zone' (Zone 3).",
    extendedDefinition: "Coined by Prof. Stephen Seiler around 2004, polarised training is not a prescription but an observation — elite endurance athletes across cycling, running, rowing, and cross-country skiing independently converge on this distribution. The key insight is that easy days must be genuinely easy to allow hard days to be genuinely hard. Most amateur cyclists do the opposite: riding moderately hard most days, which produces minimal adaptation.",
    pillar: "coaching",
    relatedTerms: ["ftp", "vo2max", "sweet-spot", "zone-2"],
    relatedArticle: "/blog/polarised-training-cycling-guide",
    relatedTopicHub: "/topics/cycling-training-plans",
  },
  {
    slug: "sweet-spot",
    term: "Sweet Spot Training",
    definition: "Training at 88-94% of FTP. Delivers a high training stimulus with manageable fatigue — the 'sweet spot' between threshold work and tempo riding.",
    extendedDefinition: "Sweet spot sits just below threshold and provides significant aerobic development without the recovery cost of full FTP work. It is particularly useful for time-crunched cyclists who cannot afford long recovery periods between sessions. A typical sweet spot session: 3x15 minutes at 88-93% FTP with 5 minutes recovery. Sweet spot and polarised training are not mutually exclusive — sweet spot can form part of the 20% hard work in a polarised distribution.",
    pillar: "coaching",
    relatedTerms: ["ftp", "threshold", "polarised-training"],
    relatedArticle: "/blog/sweet-spot-training-cycling",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "zone-2",
    term: "Zone 2 (Endurance Zone)",
    definition: "Training at 56-75% of FTP — a conversational pace where the body maximises fat oxidation and builds mitochondrial density without accumulating significant fatigue.",
    extendedDefinition: "Zone 2 is the foundation of the polarised training model. At this intensity, the body primarily burns fat for fuel, builds new mitochondria in muscle cells, and expands the capillary network. Most amateur cyclists ride their easy rides too hard — in the grey zone between Zone 2 and threshold — which limits adaptation. The conversation test is the simplest check: if you can speak in full sentences without gasping, you are probably in Zone 2.",
    pillar: "coaching",
    relatedTerms: ["polarised-training", "ftp", "lactate-threshold"],
    relatedArticle: "/blog/zone-2-training-complete-guide",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "w-kg",
    term: "W/kg (Watts per Kilogram)",
    definition: "Power-to-weight ratio — FTP divided by body weight in kilograms. The primary predictor of climbing speed and overall cycling performance on hilly terrain.",
    extendedDefinition: "A 75kg rider with a 260W FTP has 3.47 W/kg. Recreational cyclists: 1.5-2.5 W/kg. Competitive amateurs: 3.0-3.5 W/kg. Elite: 4.0-4.5 W/kg. Professional: 5.0+ W/kg. W/kg can be improved by increasing power (harder, takes months) or decreasing weight (faster via nutrition, but must not sacrifice power). On flat terrain, absolute watts matter more; on climbs, W/kg dominates.",
    pillar: "coaching",
    relatedTerms: ["ftp", "zone-2"],
    relatedArticle: "/blog/cycling-power-to-weight-ratio-guide",
    relatedTool: "/tools/race-weight",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "lactate-threshold",
    term: "Lactate Threshold",
    definition: "The exercise intensity at which lactate begins to accumulate in the blood faster than it can be cleared. Closely related to FTP and a key determinant of sustainable race pace.",
    extendedDefinition: "There are two thresholds: LT1 (the first rise above baseline, roughly the top of Zone 2) and LT2 (the onset of rapid accumulation, approximately FTP). Training at or near LT2 improves the body's ability to clear lactate and sustain higher power outputs. Threshold intervals (8-20 minutes at 95-105% FTP) are the primary way to raise this ceiling.",
    pillar: "coaching",
    relatedTerms: ["ftp", "vo2max", "zone-2"],
    relatedArticle: "/blog/how-to-improve-ftp-cycling",
    relatedTopicHub: "/topics/ftp-training",
  },
  {
    slug: "periodisation",
    term: "Periodisation",
    definition: "The systematic planning of training into phases (base, build, peak, taper) to achieve peak performance at a target date. Each phase emphasises different physiological adaptations.",
    extendedDefinition: "Traditional periodisation moves from high volume / low intensity (base) through decreasing volume / increasing intensity (build) to race-specific sharpening (peak) and fatigue clearance (taper). Modern approaches like block periodisation concentrate one quality per 2-4 week block. The key principle: you cannot train everything at once. Periodisation sequences adaptations so they compound rather than compete.",
    pillar: "coaching",
    relatedTerms: ["ftp", "polarised-training", "sweet-spot"],
    relatedArticle: "/blog/how-to-periodise-cycling-season",
    relatedTopicHub: "/topics/cycling-training-plans",
  },
  {
    slug: "glycogen",
    term: "Glycogen",
    definition: "The stored form of carbohydrate in muscles and liver. The primary fuel for high-intensity cycling. Typical stores last 60-90 minutes of hard riding before depletion ('bonking').",
    extendedDefinition: "A trained cyclist stores approximately 400-500g of glycogen (1600-2000 kcal). At threshold intensity, glycogen is the dominant fuel. Below Zone 2, fat oxidation contributes more. In-ride fuelling (60-90g/hr carbohydrate) extends glycogen availability. The 'fuel for the work required' framework periodises carbohydrate intake: high carbs on hard days (glycogen-demanding), lower carbs on easy days (fat-oxidation focus).",
    pillar: "nutrition",
    relatedTerms: ["zone-2", "ftp"],
    relatedArticle: "/blog/cycling-in-ride-nutrition-guide",
    relatedTool: "/tools/fuelling",
    relatedTopicHub: "/topics/cycling-nutrition",
  },
  {
    slug: "taper",
    term: "Taper",
    definition: "A planned reduction in training volume (typically 40-60%) in the 1-2 weeks before a target event, while maintaining some intensity. Allows accumulated fatigue to clear without losing fitness.",
    extendedDefinition: "The taper is where training becomes performance. Research consistently shows that a 2-week taper with 40-60% volume reduction and maintained intensity produces the best race-day performance. Most amateurs undertaper (they keep training hard) or overtaper (they stop entirely and lose sharpness). The goal is to arrive at the start line fresh but sharp — not rested but flat.",
    pillar: "coaching",
    relatedTerms: ["periodisation", "ftp"],
    relatedArticle: "/blog/cycling-tapering-guide",
    relatedTopicHub: "/topics/cycling-training-plans",
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | null {
  return GLOSSARY_TERMS.find((t) => t.slug === slug) ?? null;
}

export function getAllTermSlugs(): string[] {
  return GLOSSARY_TERMS.map((t) => t.slug);
}
