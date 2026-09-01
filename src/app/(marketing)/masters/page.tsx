import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { PODCAST_HISTORY, SITE_ORIGIN } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";
import { buildSearchOwnerTrustProperties } from "@/lib/seo/search-owner-schema";

/**
 * /masters — The Masters Cycling Authority.
 *
 * The definitive hub for masters cycling training: the front door for the
 * 40+ serious amateur, built authority-first rather than as a sales page.
 * It pulls the whole Roadman masters evidence base into one place — the
 * named-guest episodes (Seiler, Galpin, Friel, Lipman, Teel, Dunne, Lorang),
 * the written archive, the topic hubs, the masters-specific tools, the 2026
 * Masters Report — and routes the reader to the right next step.
 *
 * Every blog slug, episode slug, tool href and hub href below has been
 * verified against the codebase. Expert positions are grounded in the
 * corresponding episodes and articles — no fabricated quotes or references.
 *
 * Organization schema is emitted site-wide via <OrganizationJsonLd /> in the
 * root layout; this page references it by @id (publisher) rather than
 * duplicating it. WebPage + FAQPage + BreadcrumbList are emitted here.
 */

const HUB_PATH = "/masters";
const HUB_URL = `${SITE_ORIGIN}${HUB_PATH}`;
const STRUCTURED_IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Masters Cycling Training After 40")}&pillar=coaching`;

const REPORT_HREF = "/blog/masters-cycling-training-report-2026";

/* ------------------------------------------------------------------ */
/* The masters challenge — physiological + lifestyle constraints       */
/* ------------------------------------------------------------------ */

const CHALLENGES = [
  {
    title: "Aerobic capacity and power can change",
    body: "VO2max and high-power performance tend to decline across populations as age advances, but the slope varies markedly with training, health and the outcome measured. Age is context for testing and planning, not a forecast of one rider's watts.",
  },
  {
    title: "Recovery needs measuring",
    body: "Older athletes may recover more slowly from some muscle-damaging sessions, but athlete-specific evidence is limited and does not establish one 48-to-72-hour rule. The useful question is how this rider responds to this dose.",
  },
  {
    title: "Life changes the dose",
    body: "Work, family, sleep, health and training history determine what can be repeated. A six-hour rider and a twelve-hour rider do not need percentage-scaled copies of the same week; both need a plan that starts from recent completed training.",
  },
  {
    title: "Strength deserves its own plan",
    body: "Ageing and inactivity can reduce muscle mass, strength and power. Heavy strength training improves some cycling outcomes in adult cyclists, but the evidence does not prove one programme for every rider over 40. Readiness and progression still govern the dose.",
  },
  {
    title: "Health context matters",
    body: "Menopause, iron status, medication, cardiovascular risk, injury and illness can all change training decisions. They cannot be diagnosed from age, FTP or a recovery score. Symptoms and unexplained performance loss need appropriate clinical assessment.",
  },
];

type EvidenceClaim = {
  question: string;
  finding: string;
  boundary: string;
  source: string;
  href: string;
  relatedSource?: string;
  relatedHref?: string;
  grade: string;
};

const EVIDENCE_CLAIMS: readonly EvidenceClaim[] = [
  {
    question:
      "Does VO2max decline 5% per decade in every trained masters rider?",
    finding:
      "A historical eight-year study observed 5.5% per decade in 15 male masters athletes versus 12% in 14 sedentary men.",
    boundary:
      "It is a small cohort result, not an individual forecast. A 2022 review found longitudinal declines from 5% to 46% per decade, closely related to training changes.",
    source: "Rogers et al. (1990)",
    href: "https://pubmed.ncbi.nlm.nih.gov/2361923/",
    relatedSource: "Burtscher et al. (2022) review",
    relatedHref: "https://pubmed.ncbi.nlm.nih.gov/36078762/",
    grade: "Moderate for the trend; low for one fixed rate",
  },
  {
    question: "Do all masters cyclists need 48–72 hours between hard rides?",
    finding:
      "Ageing can plausibly affect muscle-damage and repair responses, especially after damaging exercise.",
    boundary:
      "Athlete-specific research is limited, activity level is often confounded and normal training stimuli are under-studied. No universal clock is established.",
    source: "Fell and Williams (2008)",
    href: "https://pubmed.ncbi.nlm.nih.gov/18268815/",
    grade: "Limited and context-dependent",
  },
  {
    question: "Is 80/20 proven best for riders over 40?",
    finding:
      "A large share of easy work can help make hard sessions repeatable, and several intensity distributions improve endurance outcomes.",
    boundary:
      "No masters-cyclist trial establishes one universal 80/20 prescription. A 2025 individual-participant meta-analysis found no overall polarised-versus-pyramidal difference for its stated outcomes.",
    source: "Rosenblat et al. (2025)",
    href: "https://pubmed.ncbi.nlm.nih.gov/39888556/",
    grade: "Mixed; not masters-specific",
  },
  {
    question:
      "Does heavy strength training improve cycling performance after 40?",
    finding:
      "A 2025 meta-analysis of 17 studies and 262 adult cyclists found improvements in cycling efficiency, anaerobic power and combined cycling performance outcomes.",
    boundary:
      "The review did not establish an over-40 subgroup effect, found no VO2max change and rated the evidence low, so it cannot prescribe one optimal programme.",
    source: "Llanos-Lagos et al. (2025)",
    href: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
    grade: "Low-certainty supportive evidence",
  },
  {
    question: "Do masters athletes require 1.6–2.2 g/kg protein every day?",
    finding:
      "Exercising adults generally need more protein than the sedentary RDA, and adequate energy plus protein supports repair.",
    boundary:
      "A 2025 masters-athlete scoping review found only 12 heterogeneous studies and called population-specific recommendations uncertain. Needs vary with training, energy intake, health and clinical context.",
    source: "Franzke, Maierhofer and Putz (2025)",
    href: "https://pubmed.ncbi.nlm.nih.gov/39940356/",
    grade: "Emerging and heterogeneous",
  },
  {
    question: "Does every masters cyclist need exactly eight hours of sleep?",
    finding:
      "The AASM and Sleep Research Society consensus recommends that adults sleep at least seven hours regularly to support health.",
    boundary:
      "This is a general health threshold, not an age-specific performance prescription. Individual need, sleep quality, timing and possible sleep disorders still matter.",
    source: "Watson et al. (2015) consensus",
    href: "https://pubmed.ncbi.nlm.nih.gov/26039963/",
    grade: "Expert consensus for a minimum; not a performance dose",
  },
];

/* ------------------------------------------------------------------ */
/* The Roadman methodology for masters (editorial)                     */
/* ------------------------------------------------------------------ */

const METHODOLOGY = [
  {
    number: "01",
    title: "Start from the rider, not the birth year",
    body: "Map the goal, recent completed training, available days, health context and response to current load before choosing a model. Masters is an age category, not a diagnosis and not a complete rider brief.",
    href: "/topics/cycling-training-plans",
    hrefLabel: "Training plans hub",
  },
  {
    number: "02",
    title: "Protect quality without worshipping a ratio",
    body: "Keep easy work easy enough that the planned quality remains repeatable. One or two hard sessions may be a useful starting range for many trained riders, but 80/20 is not a masters law and intensity frequency must respond to the athlete.",
    href: "/topics/ftp-training",
    hrefLabel: "FTP & intensity hub",
  },
  {
    number: "03",
    title: "Progress strength as training load",
    body: "Resistance training can improve cycling performance, efficiency and anaerobic power, but it carries fatigue and requires progression. Select exercises, load and frequency from competence, injury history, season and recovery—not from a blanket twice-weekly command.",
    href: "/topics/cycling-strength-conditioning",
    hrefLabel: "Strength hub",
  },
  {
    number: "04",
    title: "Use response rules, not an age clock",
    body: "Review sleep, symptoms, session execution, soreness, mood and ordinary life stress before progressing load. Adults should generally obtain at least seven hours of sleep; protein and recovery targets still need individual context rather than one masters-only number.",
    href: "/topics/cycling-recovery",
    hrefLabel: "Recovery hub",
  },
];

/* ------------------------------------------------------------------ */
/* Expert evidence — verified named-guest episodes                      */
/* ------------------------------------------------------------------ */

const EXPERTS = [
  {
    slug: "the-science-of-getting-faster-after-40-dr-andy-galpin",
    guest: "Dr Andy Galpin",
    credential: "Muscle physiologist, Cal State Fullerton",
    episode: "The Science of Getting Faster After 40",
    position:
      "Galpin's interview emphasises measuring the quality that is actually declining, then training that quality deliberately. It is an expert framework for assessment and exercise selection, not proof of one fibre-loss percentage or protein target for every masters cyclist.",
    pillar: "Strength",
  },
  {
    slug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    guest: "Prof. Stephen Seiler",
    credential: "Exercise physiologist, polarised-training researcher",
    episode: "80/20 Training to Ride Faster",
    position:
      "Seiler explains why a high proportion of low-intensity work can support repeatable quality. The conversation informs Roadman's intensity-distribution approach; it does not establish that every rider over 40 must hit an exact 80/20 time split.",
    pillar: "Training",
  },
  {
    slug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    guest: "Joe Friel",
    credential: "Author, The Cyclist's Training Bible",
    episode: "The Training Secret to Going Faster After 40",
    position:
      "Friel describes protecting relevant intensity, maintaining strength and allowing recovery to shape the schedule as riders age. His own training is an example of an individual system, not a volume or frequency prescription for another rider.",
    pillar: "Training",
  },
  {
    slug: "ep-2154-how-to-beat-99-by-getting-faster-with-age-dr-david-lipman",
    guest: "Dr David Lipman",
    credential: "Endurance physician, masters performance researcher",
    episode: "How to Beat 99% by Getting Faster With Age",
    position:
      "Lipman's interview prioritises consistency, health and patient progression over hero sessions. That coaching position supports a review process; it does not guarantee continued improvement or quantify one recovery interval.",
    pillar: "Training",
  },
  {
    slug: "ep-2183-strength-training-for-cycling-simplified-derek-teel",
    guest: "Derek Teel",
    credential: "Coach, strength training for cyclists",
    episode: "Strength Training for Cycling, Simplified",
    position:
      "Teel focuses on making strength work executable around cycling: choose useful patterns, progress them and manage in-season fatigue. The episode is coaching guidance, while the independent review below defines the evidence limits.",
    pillar: "Strength",
  },
  {
    slug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
    guest: "Dr David Dunne",
    credential: "World Tour nutritionist",
    episode: "We Got Weight Loss Wrong",
    position:
      "Dunne argues for fuelling the work rather than forcing weight loss through chronic restriction. That principle does not diagnose low energy availability or establish one protein intake for every age, sex and health profile.",
    pillar: "Nutrition",
  },
  {
    slug: "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
    guest: "Dan Lorang",
    credential: "Head of Performance, Lidl-Trek",
    episode: "13 Years of Coaching Pros: What Amateurs Don't Know",
    position:
      "Lorang starts amateur planning with sustainable total load and whole-life context. The transferable lesson is the decision process—not a percentage-scaled version of an elite calendar or one schedule for all masters riders.",
    pillar: "Training",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Common mistakes (fixable framing)                                   */
/* ------------------------------------------------------------------ */

const MISTAKES = [
  {
    mistake: "Using age as the whole rider brief",
    fix: "Record the goal, recent load, health context, available time and response to key sessions. Age matters, but it cannot tell you whether this rider needs one hard day, two hard days or a longer reset.",
  },
  {
    mistake: "Either skipping strength or copying an advanced programme",
    fix: "Treat resistance work as progressive training load. Start from technical competence and current capacity, then adjust exercise, load and frequency around the riding and any relevant clinical advice.",
  },
  {
    mistake: "Treating 80/20 as a pass-fail test",
    fix: "Keep the purpose of each ride clear and monitor whether quality remains repeatable. Polarised and pyramidal distributions can both work; the exact split depends on phase, sport, measurement method and rider.",
  },
  {
    mistake: "Chasing weight while under-fuelling the work",
    fix: "Match carbohydrate and total energy to training demand, include adequate protein, and review persistent fatigue or unexplained weight change. Do not turn a general sports-nutrition range into a personal prescription without health context.",
  },
  {
    mistake: "Scheduling recovery by folklore",
    fix: "Use a planned review point and explicit modification rules. Session quality, symptoms, sleep, soreness and life stress are more informative than assuming every rider needs 48 hours, 72 hours or a deload on the same week.",
    href: "/blog/masters-recovery-audit-seven-things-to-check",
    hrefLabel: "Run the recovery audit",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Content link tree — the masters library                             */
/* ------------------------------------------------------------------ */

type LibraryGroup = {
  heading: string;
  blurb: string;
  links: { href: string; label: string }[];
};

const LIBRARY: LibraryGroup[] = [
  {
    heading: "Training & getting faster after 40",
    blurb:
      "The spine of the methodology — what changes, what doesn't, and the weekly structure that holds up.",
    links: [
      {
        href: "/blog/masters-cyclist-guide-getting-faster-after-40",
        label:
          "The Masters Decision Framework: 3 mistakes that stall riders over 40",
      },
      {
        href: "/blog/cycling-over-40-getting-faster",
        label: "Getting Faster After 40: practical training decisions",
      },
      {
        href: "/blog/cycling-after-40-faster-science",
        label: "Cycling After 40: what the research can tell us",
      },
      {
        href: "/blog/cycling-over-50-training",
        label: "Cycling Over 50: adapting training to your response",
      },
      {
        href: "/blog/cycling-training-plan-masters-over-40",
        label: "A cycling training-plan framework for riders over 40",
      },
      {
        href: "/blog/vo2-max-workouts-cyclists-over-40",
        label: "VO2 max workouts for cyclists over 40",
      },
      {
        href: "/blog/sprint-interval-training-cyclists-masters",
        label: "Sprint interval training for masters cyclists",
      },
      {
        href: "/blog/cycling-cadence-by-age-masters",
        label: "Cycling cadence by age: evidence and practical starting points",
      },
      {
        href: "/blog/efficiency-factor-cycling-masters",
        label: "Efficiency factor for masters cyclists",
      },
      {
        href: "/blog/resting-heart-rate-masters-cyclists",
        label: "Resting heart rate for masters cyclists",
      },
      {
        href: "/blog/ftp-benchmarks-by-age-and-experience",
        label: "FTP benchmarks by age and experience",
      },
      {
        href: "/blog/age-group-ftp-benchmarks-2026",
        label: "Age-group FTP benchmarks 2026",
      },
      {
        href: "/blog/what-experts-say-about-masters-cycling",
        label: "What coaches say about getting faster after 40",
      },
      {
        href: "/blog/best-cycling-coach-masters-riders",
        label: "What to look for in a coach for masters riders",
      },
      {
        href: "/blog/joe-friel-fast-after-50-cycling-method",
        label: "Joe Friel: the Fast After 50 method",
      },
    ],
  },
  {
    heading: "Strength after 40",
    blurb:
      "The training that defends the fibres endurance riding leaves behind.",
    links: [
      {
        href: "/blog/strength-training-cyclists-over-50",
        label: "Strength training for cyclists over 50",
      },
      {
        href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
        label:
          "Heavy strength training for cyclists: what the study can and cannot show",
      },
      {
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
        label: "Andy Galpin: why the snap goes first",
      },
      {
        href: "/blog/derek-teel-best-exercises-cyclists",
        label: "Derek Teel's best exercises for cyclists",
      },
    ],
  },
  {
    heading: "Recovery",
    blurb:
      "After 40 this is the input that decides whether the training sticks.",
    links: [
      {
        href: "/blog/masters-recovery-audit-seven-things-to-check",
        label: "The over-40 recovery audit: seven things to check",
      },
      {
        href: "/blog/post-ride-recovery-window-cyclists-over-40",
        label: "The post-ride recovery window for cyclists over 40",
      },
      {
        href: "/blog/cycling-after-40-recovery-report-2026",
        label: "Cycling After 40 Recovery Report (Q3 2026)",
      },
    ],
  },
  {
    heading: "Hormones, fuelling & body composition",
    blurb: "The factors that move with age and quietly stall good riders.",
    links: [
      {
        href: "/blog/cycling-testosterone-and-training-over-40-guide",
        label: "Free testosterone in cyclists: what the research says",
      },
      {
        href: "/blog/menopause-cycling-performance",
        label: "Menopause and cycling performance",
      },
      {
        href: "/blog/iron-deficiency-cyclists-masters",
        label: "Iron deficiency in masters cyclists",
      },
    ],
  },
  {
    heading: "The culture & the playlists",
    blurb:
      "The reckoning the sport is having — and where to start in the archive.",
    links: [
      {
        href: "/blog/masters-racing-doping-cycling-amateur-cheating",
        label: "The masters doping problem",
      },
      {
        href: "/blog/best-roadman-episodes-masters",
        label: "Best Roadman episodes for masters cyclists",
      },
      {
        href: "/blog/masters-cycling-podcast-playlist",
        label: "The masters cycling podcast playlist",
      },
      {
        href: "/blog/every-roadman-episode-with-stephen-seiler",
        label: "Every Roadman episode with Stephen Seiler",
      },
      {
        href: "/blog/podcasts-for-cyclists-over-40",
        label: "The best podcasts for cyclists over 40",
      },
      {
        href: "/blog/best-cycling-training-podcasts-age-groupers",
        label: "Best cycling training podcasts for age-groupers",
      },
    ],
  },
];

const TOPIC_HUBS = [
  {
    href: "/topics/ftp-training",
    label: "FTP Training",
    note: "Threshold, zones, intensity",
  },
  {
    href: "/topics/cycling-strength-conditioning",
    label: "Strength & Conditioning",
    note: "The off-the-bike work",
  },
  {
    href: "/topics/cycling-recovery",
    label: "Recovery",
    note: "Sleep, deloads, adaptation",
  },
  {
    href: "/topics/cycling-nutrition",
    label: "Nutrition",
    note: "Fuelling, protein, body comp",
  },
  {
    href: "/topics/cycling-training-plans",
    label: "Training Plans",
    note: "Structuring the year",
  },
  {
    href: "/topics/cycling-coaching",
    label: "Coaching",
    note: "What good coaching looks like",
  },
];

type ToolEntry = {
  href: string;
  label: string;
  description: string;
  masters?: boolean;
};

const TOOLS: readonly ToolEntry[] = [
  {
    href: "/tools/masters-ftp-benchmark",
    label: "Masters FTP Benchmark",
    description:
      "Where your watts actually place you for your age band — and the realistic next 12-month target.",
    masters: true,
  },
  {
    href: "/tools/masters-recovery-score",
    label: "Masters Recovery Score",
    description:
      "Score the recovery factors that matter most after 40 — sleep, training load, age, stress.",
    masters: true,
  },
  {
    href: "/tools/ftp-zones",
    label: "FTP Zones Calculator",
    description:
      "Build your training zones from a current FTP, ready for the polarised distribution.",
  },
  {
    href: "/tools/hr-zones",
    label: "Heart Rate Zones",
    description:
      "Zones from threshold or max HR — useful when you're tracking aerobic durability.",
  },
  {
    href: "/tools/race-weight",
    label: "Race Weight Calculator",
    description:
      "A goal race weight without the calorie-counting trap. Built around fuelling, not restriction.",
  },
  {
    href: "/tools/energy-availability",
    label: "Energy Availability",
    description:
      "Check whether you're under-fuelling for the work — the hidden lid on masters performance.",
  },
  {
    href: "/tools/fuelling",
    label: "In-Ride Fuelling",
    description:
      "Carbs per hour for the ride in front of you, so you finish the session you started.",
  },
  {
    href: "/tools/wkg",
    label: "W/kg Calculator",
    description:
      "Power-to-weight from your numbers — the ratio that decides what happens on a climb.",
  },
];

/* ------------------------------------------------------------------ */
/* Who this is for                                                     */
/* ------------------------------------------------------------------ */

const FOR_YOU = [
  "You're 38 to 65+ and training 6 to 12 hours a week around a job and a family.",
  "Your FTP has stalled, or it's quietly slipped, and the old fixes aren't working.",
  "You've been told to train smarter, not harder — but nobody actually showed you how.",
  "You want evidence and named sources, not forum bro-science.",
  "You refuse to accept that your best days are behind you.",
];

const NOT_FOR_YOU = [
  "You're brand new to structured training — start with the fundamentals first.",
  "You want a shortcut that skips the work. There isn't one, and we won't pretend otherwise.",
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: "Can you actually get faster after 40, or is it all just maintenance?",
    a: "Yes, many riders can improve from their current baseline after 40. Population-level age trends do not tell you whether one individual has reached a ceiling. The useful comparison is the rider's current result against their own recent training, health, execution and goal—not a promise based on age or a historical percentage.",
  },
  {
    q: "What's different about masters cycling training versus general training?",
    a: "Masters planning should make age-related and clinical context visible, but age alone does not select the plan. Start with recent tolerated load, event demand, training history, available recovery and relevant health factors. Then use response rules to change frequency, intensity, strength work or recovery instead of applying one masters template.",
  },
  {
    q: "Is strength training really necessary for cyclists over 40?",
    a: "Progressive resistance training is a strong option for preserving function and can improve some cycling outcomes. The 2025 cyclist meta-analysis found low-certainty benefits for efficiency, anaerobic power and combined performance, but it did not prove an over-40 subgroup effect or one optimal programme. Readiness, technique, injury history and total load determine implementation.",
  },
  {
    q: "How much should a masters cyclist train each week?",
    a: "There is no evidence-based weekly-hour number for every masters cyclist. Start from the last several weeks the rider completed without persistent symptoms or repeated session failure, then change load gradually for the goal and available recovery. Six to twelve hours describes many Roadman clients; it is a service audience, not a physiological rule.",
  },
  {
    q: "Do I need a coach, or can I figure this out from the podcast and the blog?",
    a: "It depends on where you're stuck. If you're early in the work, the podcast, the Saturday Spin newsletter and the written guides will take you a long way — they're free for a reason. If you've been at it for years and your FTP has stalled, the Plateau Diagnostic pinpoints which of four common patterns you're caught in. If you want the full system — personalised TrainingPeaks plans, weekly coaching calls, the strength roadmap — Not Done Yet Coaching is the structured paid programme. Not sure which fits? The Find Your Fit quiz is five questions and one specific recommendation.",
  },
  {
    q: "Is Not Done Yet Coaching built for masters cyclists?",
    a: "It's built around the serious amateur and masters cyclist who refuses to accept their best days are behind them — that's the brand identity. The personalised plans, weekly calls with Anthony, the cycling-specific strength roadmap and the recovery and fuelling guidance all assume an athlete training 6 to 12 hours a week with a job, a family, and the recovery profile of an adult, not a 22-year-old. If you want the bespoke version with direct 1:1 access, that's the Inner Circle, by application.",
  },
];

const STATS = [
  { value: "1,400+", label: "Episodes in the archive" },
  { value: "40+", label: "Citations in the 2026 Masters Report" },
  { value: "6", label: "Visible evidence boundaries" },
];

const mastersTestimonials = getTestimonialsByName([
  "Brian Morrissey",
  "Kevin L",
  "Mary K",
]);

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: { absolute: "Masters Cycling Training: Get Faster After 40" },
  description:
    "Evidence-based cycling training for riders over 40: weekly structure, strength, recovery, nutrition, expert interviews and the 2026 Masters Report.",
  keywords: [
    "masters cycling training",
    "cycling over 40",
    "cycling training over 40",
    "masters cyclist",
    "cycling over 50",
    "fast after 50",
    "strength training cyclists over 40",
    "VO2 max masters cyclists",
    "Andy Galpin cycling",
    "Joe Friel masters training",
    "Stephen Seiler polarised training",
    "masters FTP benchmarks",
  ],
  alternates: { canonical: HUB_URL },
  openGraph: {
    title: "Masters Cycling Training — Evidence and Plans After 40",
    description:
      "Training, strength, recovery and nutrition for cyclists over 40, with primary-source evidence, limitations, expert interviews and practical tools.",
    type: "website",
    url: HUB_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Cycling Training — Evidence After 40",
    description:
      "A reviewed masters-cycling resource separating research, expert interviews and practical starting points.",
  },
  robots: { index: true, follow: true },
};

export default function MastersHubPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      { "@type": "ListItem", position: 2, name: "Masters", item: HUB_URL },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${HUB_URL}#webpage`,
    url: HUB_URL,
    name: "Masters Cycling Training — Evidence, Plans and Tools After 40",
    description:
      "A reviewed masters cycling resource separating primary research, expert interviews and practical training, strength, recovery and nutrition guidance.",
    ...buildSearchOwnerTrustProperties("masters-cycling"),
    dateModified: "2026-08-26",
    citation: EVIDENCE_CLAIMS.flatMap((claim) => [
      claim.href,
      ...(claim.relatedHref ? [claim.relatedHref] : []),
    ]),
    about: {
      "@type": "Thing",
      name: "Masters Cycling Training",
      description:
        "Training, strength, recovery and nutrition for cyclists aged 40+, with explicit evidence limits and individualisation rules.",
    },
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 38,
      suggestedMaxAge: 75,
      audienceType: "Masters cyclists",
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: STRUCTURED_IMAGE_URL,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Header />

      <main id="main-content">
        {/* ---------------------------------------------------------- */}
        {/* 1. Hero — authority-first                                   */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <ScrollReveal direction="up" eager>
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-coral font-heading text-sm tracking-[0.3em] uppercase mb-6">
                  The Masters Cycling Authority
                </p>
                <h1
                  className="font-heading text-off-white uppercase leading-[0.95] mb-6"
                  style={{ fontSize: "var(--text-hero)" }}
                >
                  Masters cycling over 40,
                  <br />
                  <span className="text-coral">done properly</span>.
                </h1>
                <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-4">
                  Since {PODCAST_HISTORY.feedStartedYear}, Anthony has put the
                  people who actually study and coach masters performance on the
                  podcast — Stephen Seiler, Andy Galpin, Joe Friel, David
                  Lipman, Derek Teel. This is the reviewed route through those
                  interviews, independent research, practical plans and evidence
                  limits.
                </p>
                <p className="text-off-white text-lg md:text-xl leading-relaxed font-medium mb-10">
                  The evidence, the methodology, the full archive, and the route
                  through. Not motivation — the actual work.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <Button
                    href={REPORT_HREF}
                    size="lg"
                    dataTrack="masters_hub_hero_report"
                  >
                    Read the 2026 Masters Report
                  </Button>
                  <Button
                    href="/plateau"
                    size="lg"
                    variant="ghost"
                    dataTrack="masters_hub_hero_plateau"
                  >
                    Take the Plateau Diagnostic
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm">
                  The report is free. The diagnostic takes two minutes and
                  routes you to the right next step.
                </p>
              </div>
            </ScrollReveal>

            {/* Trust strip */}
            <ScrollReveal direction="up" delay={0.15} className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="text-center border border-white/10 rounded-lg p-5 bg-white/[0.02]"
                  >
                    <div className="font-heading text-coral text-3xl md:text-4xl tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-foreground-subtle text-xs tracking-widest uppercase mt-2">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 2. The masters cycling challenge                            */}
        {/* ---------------------------------------------------------- */}
        <Section background="charcoal" id="challenge">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHAT ACTUALLY CHANGES
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">THE MASTERS CHALLENGE</GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Here&apos;s what nobody tells you when you turn 40: it&apos;s
                not that one birthday selects a new training plan. It&apos;s
                that age, training history, health and life context can change
                the constraints. Name them, measure them, and decide from the
                rider in front of you.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {CHALLENGES.map((c, i) => (
                <ScrollReveal key={c.title} direction="up" delay={i * 0.05}>
                  <Card className="p-6 h-full" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3 tracking-wide">
                      {c.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {c.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 3. Primary-source evidence boundaries                       */}
        {/* ---------------------------------------------------------- */}
        <Section background="off-white" id="evidence-boundaries">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                PRIMARY-SOURCE CHECK
              </p>
              <h2
                className="font-heading text-charcoal mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT THE EVIDENCE SUPPORTS — AND WHERE IT STOPS
              </h2>
              <p className="text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
                Research, an expert interview and a coaching starting point do
                different jobs. This table keeps them separate so a memorable
                number does not quietly become a universal masters rule.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="bg-charcoal text-off-white">
                    <tr>
                      <th className="p-4 font-heading text-xs tracking-wider w-[22%]">
                        CLAIM CHECK
                      </th>
                      <th className="p-4 font-heading text-xs tracking-wider w-[24%]">
                        WHAT IS SUPPORTED
                      </th>
                      <th className="p-4 font-heading text-xs tracking-wider w-[30%]">
                        LIMIT
                      </th>
                      <th className="p-4 font-heading text-xs tracking-wider w-[24%]">
                        SOURCE &amp; GRADE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVIDENCE_CLAIMS.map((claim) => (
                      <tr
                        key={claim.question}
                        className="border-t border-charcoal/10 align-top"
                      >
                        <th className="p-4 text-sm text-charcoal font-semibold leading-relaxed">
                          {claim.question}
                        </th>
                        <td className="p-4 text-sm text-charcoal/75 leading-relaxed">
                          {claim.finding}
                        </td>
                        <td className="p-4 text-sm text-charcoal/75 leading-relaxed">
                          {claim.boundary}
                        </td>
                        <td className="p-4 text-sm leading-relaxed">
                          <a
                            href={claim.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-coral hover:text-coral-hover underline underline-offset-2"
                          >
                            {claim.source}
                          </a>
                          {claim.relatedHref && claim.relatedSource && (
                            <a
                              href={claim.relatedHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-2 text-coral hover:text-coral-hover underline underline-offset-2"
                            >
                              {claim.relatedSource}
                            </a>
                          )}
                          <span className="block mt-2 text-xs text-charcoal/60">
                            {claim.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" className="mt-6">
              <p className="text-sm text-charcoal/65 max-w-4xl mx-auto leading-relaxed">
                These sources define the boundaries of this hub. Roadman podcast
                interviews explain named experts&apos; positions; they do not
                upgrade a coaching opinion into comparative evidence. The full
                report contains the wider citation ledger and correction notes.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 4. The Roadman methodology for masters                      */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain id="methodology">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE ROADMAN METHODOLOGY
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUR PLANNING PRINCIPLES
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                These are practical starting principles, not age-based laws.
                Each one must survive contact with the rider&apos;s completed
                training, symptoms, schedule and response.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {METHODOLOGY.map((m, i) => (
                <ScrollReveal key={m.number} direction="up" delay={i * 0.05}>
                  <Card className="p-6 md:p-8" glass hoverable={false}>
                    <div className="grid md:grid-cols-12 gap-4 md:gap-6 items-start">
                      <div className="md:col-span-1">
                        <span className="font-heading text-4xl text-coral/40">
                          {m.number}
                        </span>
                      </div>
                      <div className="md:col-span-11">
                        <h3 className="font-heading text-xl md:text-2xl text-off-white mb-3 tracking-wide">
                          {m.title.toUpperCase()}
                        </h3>
                        <p className="text-foreground-muted leading-relaxed mb-4">
                          {m.body}
                        </p>
                        <Link
                          href={m.href}
                          className="inline-flex items-center gap-2 text-sm text-coral hover:text-coral-hover transition-colors font-heading tracking-wider"
                          data-track={`masters_hub_method_${m.number}`}
                        >
                          {m.hrefLabel.toUpperCase()} →
                        </Link>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 5. Expert evidence                                          */}
        {/* ---------------------------------------------------------- */}
        <Section background="charcoal" id="experts">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                NOT THEORY — THE ACCESS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT THE EXPERTS ACTUALLY SAID
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Every one of these is a real conversation in the archive. We
                asked the people who study and coach masters athletes for a
                living. Here&apos;s the short version of what they told us —
                each links to the full episode.
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {EXPERTS.map((e, i) => (
                <ScrollReveal key={e.slug} direction="up" delay={i * 0.04}>
                  <Link
                    href={`/podcast/${e.slug}`}
                    className="block p-6 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-coral/40 transition-all group"
                    data-track={`masters_hub_expert_${e.slug}`}
                  >
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-3">
                        <p className="font-heading text-coral text-sm tracking-widest mb-1">
                          {e.guest.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs leading-relaxed">
                          {e.credential}
                        </p>
                        <span className="inline-block mt-3 text-[10px] font-heading tracking-widest text-coral/70 border border-coral/30 rounded px-2 py-0.5">
                          {e.pillar.toUpperCase()}
                        </span>
                      </div>
                      <div className="md:col-span-9">
                        <h3 className="font-heading text-base md:text-lg text-off-white group-hover:text-coral transition-colors tracking-wide mb-2">
                          {e.episode.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {e.position}
                        </p>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <Link
                href="/blog/masters-cycling-podcast-playlist"
                className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
              >
                THE FULL MASTERS PLAYLIST →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 6. Common mistakes                                          */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain id="mistakes">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                FIXABLE, EVERY ONE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT MASTERS RIDERS GET WRONG
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                These are the patterns we see again and again in the riders who
                feel stuck. None of them is a character flaw. Each one is a
                fixable habit, and the fix is specific.
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {MISTAKES.map((m, i) => (
                <ScrollReveal key={m.mistake} direction="up" delay={i * 0.04}>
                  <div className="p-6 rounded-lg bg-white/[0.03] border border-white/10">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-heading text-coral text-sm shrink-0 mt-0.5">
                        ✕
                      </span>
                      <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide">
                        {m.mistake.toUpperCase()}
                      </h3>
                    </div>
                    <div className="flex items-start gap-3 pl-1">
                      <span className="text-coral text-sm shrink-0 mt-0.5 font-heading">
                        →
                      </span>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {m.fix}
                        {"href" in m && m.href ? (
                          <>
                            {" "}
                            <Link
                              href={m.href}
                              className="text-coral hover:text-coral-hover transition-colors"
                              data-track={`masters_hub_mistake_link_${i}`}
                            >
                              {m.hrefLabel}
                            </Link>
                            .
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 3. Content link tree — the masters library                  */}
        {/* ---------------------------------------------------------- */}
        <Section background="charcoal" id="library">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                EVERYTHING, IN ONE PLACE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE MASTERS LIBRARY
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Every masters-relevant piece on the site, organised. Start with
                the flagship report, then dig into whatever you&apos;re working
                on this block.
              </p>
            </ScrollReveal>

            {/* Flagship report callout */}
            <ScrollReveal direction="up" className="mb-10">
              <Link
                href={REPORT_HREF}
                className="block p-6 md:p-8 rounded-lg border bg-coral/10 border-coral/40 hover:bg-coral/15 hover:border-coral transition-all group"
                data-track="masters_hub_library_report"
              >
                <span className="text-[10px] font-heading tracking-widest text-coral uppercase">
                  Flagship · Coaching
                </span>
                <h3 className="font-heading text-xl md:text-2xl text-off-white group-hover:text-coral transition-colors tracking-wide mt-2 mb-2">
                  THE MASTERS CYCLING TRAINING REPORT 2026
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  An evidence-led guide to training as a masters cyclist. What
                  may change after 40, what does not change automatically, and a
                  12-week block you can adapt. 18 sections, 40+ citations, 5
                  named case studies.
                </p>
              </Link>
            </ScrollReveal>

            {/* Grouped reading */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {LIBRARY.map((group, gi) => (
                <ScrollReveal
                  key={group.heading}
                  direction="up"
                  delay={gi * 0.04}
                >
                  <div className="h-full p-6 rounded-lg bg-white/[0.02] border border-white/10">
                    <h3 className="font-heading text-lg text-off-white tracking-wide mb-1">
                      {group.heading.toUpperCase()}
                    </h3>
                    <p className="text-xs text-foreground-subtle leading-relaxed mb-4">
                      {group.blurb}
                    </p>
                    <ul className="space-y-2.5">
                      {group.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            className="text-sm text-foreground-muted hover:text-coral transition-colors leading-snug flex gap-2"
                            data-track={`masters_hub_library_${l.href.split("/").pop()}`}
                          >
                            <span className="text-coral/50 shrink-0">→</span>
                            <span>{l.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Topic hubs */}
            <ScrollReveal direction="up" className="mb-6">
              <h3 className="font-heading text-base text-off-white tracking-widest text-center mb-1">
                GO DEEPER — THE TOPIC HUBS
              </h3>
              <p className="text-xs text-foreground-subtle text-center mb-6">
                The complete evidence-based guide on each pillar.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TOPIC_HUBS.map((h) => (
                  <Link
                    key={h.href}
                    href={h.href}
                    className="block p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-coral/10 hover:border-coral/30 transition-all group"
                    data-track={`masters_hub_topic_${h.href.split("/").pop()}`}
                  >
                    <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide">
                      {h.label.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-subtle mt-1">
                      {h.note}
                    </p>
                  </Link>
                ))}
              </div>
            </ScrollReveal>

            {/* Tools */}
            <ScrollReveal direction="up" className="mt-12">
              <h3 className="font-heading text-base text-off-white tracking-widest text-center mb-1">
                THE MASTERS TOOLKIT
              </h3>
              <p className="text-xs text-foreground-subtle text-center mb-6">
                Free browser tools. Start with the two built specifically for
                riders over 40.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {TOOLS.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`block p-5 rounded-lg border transition-all group h-full ${
                      t.masters
                        ? "bg-coral/10 border-coral/40 hover:bg-coral/15 hover:border-coral"
                        : "bg-white/5 border-white/10 hover:bg-coral/10 hover:border-coral/30"
                    }`}
                    data-track={`masters_hub_tool_${t.href.split("/").pop()}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors tracking-wide">
                        {t.label.toUpperCase()}
                      </p>
                      {t.masters && (
                        <span className="shrink-0 text-[10px] font-heading tracking-widest text-coral border border-coral/40 rounded px-2 py-0.5">
                          MASTERS
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {t.description}
                    </p>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 7. Who this is for                                          */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain id="who">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE QUALIFIER
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHO THIS IS FOR
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              <ScrollReveal direction="up">
                <Card
                  className="p-6 h-full border-l-2 border-l-coral"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-off-white tracking-wide mb-4">
                    THIS IS FOR YOU IF
                  </h3>
                  <ul className="space-y-3">
                    {FOR_YOU.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm text-foreground-muted leading-relaxed"
                      >
                        <span className="text-coral shrink-0 font-heading">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.06}>
                <Card
                  className="p-6 h-full border-l-2 border-l-white/20"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-off-white tracking-wide mb-4">
                    PROBABLY NOT IF
                  </h3>
                  <ul className="space-y-3">
                    {NOT_FOR_YOU.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm text-foreground-muted leading-relaxed"
                      >
                        <span className="text-foreground-subtle shrink-0 font-heading">
                          –
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/start-here"
                    className="inline-flex items-center gap-2 text-sm text-coral hover:text-coral-hover transition-colors font-heading tracking-wider mt-6"
                    data-track="masters_hub_who_start_here"
                  >
                    NEW TO STRUCTURED TRAINING? START HERE →
                  </Link>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* Testimonials                                                */}
        {/* ---------------------------------------------------------- */}
        {mastersTestimonials.length > 0 && (
          <Section background="charcoal" id="proof">
            <Container width="narrow">
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  IN THEIR WORDS
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RIDERS WHO DIDN&apos;T ACCEPT THE PLATEAU
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-4">
                {mastersTestimonials.map((t, i) => (
                  <ScrollReveal key={t.name} direction="up" delay={i * 0.06}>
                    <Card
                      className="p-6 h-full border-l-2 border-l-coral"
                      hoverable={false}
                    >
                      {t.stat && (
                        <div className="mb-4">
                          <div className="font-heading text-coral text-2xl tracking-tight">
                            {t.stat}
                          </div>
                          <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                            {t.statLabel}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-off-white italic leading-relaxed mb-4">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </p>
                      <p className="font-heading text-xs text-off-white tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-foreground-subtle text-xs leading-relaxed mt-1">
                        {t.detail}
                      </p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal direction="up" className="text-center mt-10">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
                >
                  MORE COACHING RESULTS →
                </Link>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* ---------------------------------------------------------- */}
        {/* 9. Newsletter sub-segment signup                            */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain id="newsletter">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <EmailCapture
                variant="inline"
                source="masters-hub"
                heading="MASTERS TRAINING, EVERY SATURDAY"
                subheading="The Saturday Spin newsletter — the over-40 training, strength, recovery and fuelling research from the podcast, translated into what to actually do on the bike this week. One email, every Saturday."
                buttonText="GET IT FREE"
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 8. Coaching ladder + Plateau CTA                            */}
        {/* ---------------------------------------------------------- */}
        <Section background="charcoal" id="coaching">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE ROUTE THROUGH
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIND THE RIGHT NEXT STEP
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Three routes, depending on where you are. If you&apos;re not
                sure, the Find Your Fit quiz takes five questions and gives you
                one specific recommendation.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-4">
              <ScrollReveal direction="up" delay={0}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="text-coral font-heading text-xs tracking-widest mb-3">
                    ENTRY · FREE
                  </p>
                  <h3 className="font-heading text-xl text-off-white mb-3 tracking-wide">
                    PLATEAU DIAGNOSTIC
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6">
                    A five-minute diagnostic that pinpoints which of four common
                    patterns has stalled your training — and the one thing to do
                    about it next. Built for masters cyclists.
                  </p>
                  <Button
                    href="/plateau"
                    variant="outline"
                    size="md"
                    dataTrack="masters_hub_ladder_plateau"
                  >
                    Take the Diagnostic
                  </Button>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.06}>
                <Card
                  className="p-6 h-full border-2 border-coral relative"
                  hoverable={false}
                >
                  <span className="absolute -top-3 left-6 bg-coral text-off-white font-heading text-[10px] tracking-widest px-3 py-1 rounded">
                    MOST POPULAR
                  </span>
                  <p className="text-coral font-heading text-xs tracking-widest mb-3">
                    COACHING · $195/MO
                  </p>
                  <h3 className="font-heading text-xl text-off-white mb-3 tracking-wide">
                    NOT DONE YET COACHING
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6">
                    Personalised TrainingPeaks plans, weekly coaching calls with
                    Anthony, the cycling-specific strength roadmap, and
                    race-weight and fuelling guidance — built for masters
                    cyclists training 6 to 12 hours a week.
                  </p>
                  <Button
                    href="/community"
                    size="md"
                    dataTrack="masters_hub_ladder_ndy"
                  >
                    Join Not Done Yet
                  </Button>
                  <p className="text-foreground-subtle text-xs mt-3">
                    7-day free trial. Cancel anytime.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.12}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="text-coral font-heading text-xs tracking-widest mb-3">
                    PREMIUM · BY APPLICATION
                  </p>
                  <h3 className="font-heading text-xl text-off-white mb-3 tracking-wide">
                    INNER CIRCLE
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6">
                    Bespoke 1:1 programming with direct access to Anthony.
                    Quarterly strategy calls, priority event support, and a
                    single line of accountability. Limited spots, application
                    only.
                  </p>
                  <Button
                    href="/inner-circle"
                    variant="outline"
                    size="md"
                    dataTrack="masters_hub_ladder_inner_circle"
                  >
                    Learn More
                  </Button>
                </Card>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="up" className="text-center mt-8">
              <p className="text-sm text-foreground-subtle">
                Want the age-specific coaching pages?{" "}
                <Link
                  href="/coaching/masters"
                  className="text-coral hover:text-coral-hover transition-colors"
                  data-track="masters_hub_coaching_masters"
                >
                  Masters coaching
                </Link>{" "}
                ·{" "}
                <Link
                  href="/coaching/over-50"
                  className="text-coral hover:text-coral-hover transition-colors"
                  data-track="masters_hub_coaching_over50"
                >
                  Over-50 coaching
                </Link>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" className="text-center mt-8">
              <p className="text-foreground-muted mb-4">Not sure which fits?</p>
              <Button
                href="/find-your-fit"
                size="lg"
                dataTrack="masters_hub_ladder_find_your_fit"
              >
                Find Your Fit — 5 Questions
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* 10. FAQ                                                     */}
        {/* ---------------------------------------------------------- */}
        <Section background="deep-purple" grain id="faq">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                MASTERS QUESTIONS, ANSWERED
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <ScrollReveal key={item.q} direction="up" delay={i * 0.05}>
                  <details className="group p-6 rounded-lg bg-white/[0.03] border border-white/10 hover:border-coral/30 transition-all">
                    <summary className="cursor-pointer flex items-start justify-between gap-4 list-none">
                      <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide">
                        {item.q.toUpperCase()}
                      </h3>
                      <span className="shrink-0 text-coral text-2xl leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <EvidenceBlock
              lastReviewed="26 August 2026"
              reviewedBy="Anthony Walsh against the linked primary research and complete Roadman source interviews"
              experts={[
                {
                  name: "Dr Andy Galpin",
                  role: "Muscle physiologist and human-performance researcher",
                  href: "/guests/andy-galpin",
                },
                {
                  name: "Joe Friel",
                  role: "Author, Fast After 50 and The Cyclist's Training Bible",
                  href: "/guests/joe-friel",
                },
                {
                  name: "Dr David Lipman",
                  role: "Endurance physician and masters-performance researcher",
                  href: "/guests/dr-david-lipman",
                },
              ]}
            />
          </Container>
        </Section>

        {/* ---------------------------------------------------------- */}
        {/* Final CTA                                                   */}
        {/* ---------------------------------------------------------- */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOU&apos;RE NOT DONE YET.
            </h2>
            <p className="text-off-white/85 max-w-lg mx-auto mb-8 text-lg">
              Better masters training starts with the right problem and an
              honest baseline. Start with the report, or let the diagnostic
              point you at the next question to investigate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={REPORT_HREF}
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="masters_hub_footer_report"
              >
                Read the 2026 Masters Report
              </Link>
              <Link
                href="/plateau"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-transparent border-2 border-off-white/40 text-off-white hover:bg-off-white/10 hover:border-off-white"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="masters_hub_footer_plateau"
              >
                Plateau Diagnostic
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
