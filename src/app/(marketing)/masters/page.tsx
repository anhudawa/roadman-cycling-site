import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";

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

const REPORT_HREF = "/blog/masters-cycling-training-report-2026";

/* ------------------------------------------------------------------ */
/* The masters challenge — physiological + lifestyle constraints       */
/* ------------------------------------------------------------------ */

const CHALLENGES = [
  {
    title: "The top end goes first",
    body: "VO2 max and your fast-twitch fibres fade before your aerobic engine does. A fit 47-year-old can still hold four hours at threshold but can't find the six-second kick on a climb. That's not bad luck — it's the order ageing takes things.",
  },
  {
    title: "Recovery takes longer",
    body: "The session that needed 24 hours at 30 needs 48 to 72 now. Stack hard days the way you used to and you don't get fitter, you get flat. The training only counts once you've absorbed it.",
  },
  {
    title: "Time is the real constraint",
    body: "Six to twelve hours a week around a job, a family and a body that's been at this a while. You can't out-volume the problem. Every session has to earn its place.",
  },
  {
    title: "Strength quietly disappears",
    body: "Lean mass and peak force drift away from your late thirties on. Endurance riding does almost nothing to defend them — it trains the half of the system that was ageing well anyway.",
  },
  {
    title: "The hormones move",
    body: "Testosterone slides for men; perimenopause and menopause reshape recovery and adaptation for women. Iron status matters more. Pretending none of it changes is how good riders stall without knowing why.",
  },
];

/* ------------------------------------------------------------------ */
/* The Roadman methodology for masters (editorial)                     */
/* ------------------------------------------------------------------ */

const METHODOLOGY = [
  {
    number: "01",
    title: "Reverse the periodisation",
    body: "Most plans build a long aerobic base over winter and bolt intensity on late. After 40 that's backwards. The top end is the first thing you lose, so we keep a thread of intensity running all year and build the volume around it — instead of letting the engine's ceiling rust every winter and trying to rebuild it from scratch each spring.",
    href: "/topics/cycling-training-plans",
    hrefLabel: "Training plans hub",
  },
  {
    number: "02",
    title: "Polarise the week, not just the season",
    body: "Seiler's 80/20, applied to how an over-40 rider actually lives. Two properly hard sessions. Everything else easy enough that you'd be a little embarrassed by the speed. The grey zone — that flattering not-quite-hard pace — is where masters riders bury themselves: too taxing to recover from, too soft to drive adaptation.",
    href: "/topics/ftp-training",
    hrefLabel: "FTP & intensity hub",
  },
  {
    number: "03",
    title: "Strength is the new base",
    body: "Twice a week, heavy and fast, single-leg and eccentric-led. A 2025 meta-analysis of 17 studies and 262 trained cyclists found structured strength work improves cycling performance with no cost to VO2 max. After 40 it stops being optional — it's the only training that directly defends the type II fibres endurance riding ignores.",
    href: "/topics/cycling-strength-conditioning",
    hrefLabel: "Strength hub",
  },
  {
    number: "04",
    title: "Recover like it's the part that counts",
    body: "Because it is. Hard days spaced 48 to 72 hours apart. Protein at 1.6 to 2.2 g/kg across the day, with one dose above roughly 35g. Sleep treated as the actual adaptation window, not the thing you trim when life gets busy. Recovery isn't the reward for the work — it's where the work becomes fitness.",
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
      "Galpin's hierarchy of ageing is blunt: power drops faster than strength, and strength faster than muscle mass. Type II — the fast-twitch fibres behind your kick on a climb — shrink first, by 10 to 40%. Endurance riding barely touches them. The defence is targeted: fast, controlled load and protein at 1.6 to 2.2 g/kg.",
    pillar: "Strength",
  },
  {
    slug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    guest: "Prof. Stephen Seiler",
    credential: "Exercise physiologist, polarised-training researcher",
    episode: "80/20 Training to Ride Faster",
    position:
      "The 80/20 split isn't a beginner's compromise — it's the model the best endurance athletes in the world actually train on. For masters riders the point lands harder: the grey zone costs you more after 40 because your recovery budget is smaller. Keep 80% properly easy and you free the headroom to go truly hard on the other 20%.",
    pillar: "Training",
  },
  {
    slug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    guest: "Joe Friel",
    credential: "Author, The Cyclist's Training Bible",
    episode: "The Training Secret to Going Faster After 40",
    position:
      "Friel is in his eighties and still rides 12 to 13 hours a week. His method protects intensity instead of retreating into junk miles, treats strength work in the garage gym as non-negotiable, and builds more recovery between hard days. Not less training — better-spaced training.",
    pillar: "Training",
  },
  {
    slug: "ep-2154-how-to-beat-99-by-getting-faster-with-age-dr-david-lipman",
    guest: "Dr David Lipman",
    credential: "Endurance physician, masters performance researcher",
    episode: "How to Beat 99% by Getting Faster With Age",
    position:
      "The masters riders who keep improving aren't the ones doing the most. They're the most consistent, and they recover with intent. Lipman's case is that structure and patience beat heroics — the riders who stay healthy and keep showing up are the ones still moving the numbers a decade in.",
    pillar: "Training",
  },
  {
    slug: "ep-2183-strength-training-for-cycling-simplified-derek-teel",
    guest: "Derek Teel",
    credential: "Coach, strength training for cyclists",
    episode: "Strength Training for Cycling, Simplified",
    position:
      "Teel makes the strength piece doable for a rider with a job. Cycling-specific patterns, in-season maintenance, and sessions scheduled around your hard rides rather than competing with them — so the lifting makes you faster on the bike instead of leaving you too cooked to ride.",
    pillar: "Strength",
  },
  {
    slug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
    guest: "Dr David Dunne",
    credential: "World Tour nutritionist",
    episode: "We Got Weight Loss Wrong",
    position:
      "Under-fuelling is the hidden lid on masters performance. Dunne's message is the opposite of diet culture: fuel for the work, protect protein, and let body composition follow. The riders chasing the scale with low intake are the ones losing the muscle they can least afford.",
    pillar: "Nutrition",
  },
  {
    slug: "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
    guest: "Dan Lorang",
    credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
    episode: "13 Years of Coaching Pros: What Amateurs Don't Know",
    position:
      "Structure and periodisation matter more when time and recovery are limited, not less. Lorang — Head of Performance at a WorldTour team and long-time coach to Frodeno and Haug — on what amateurs get wrong when they train without a plan, and why the principles scale down to a time-crunched masters week.",
    pillar: "Training",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Common mistakes (fixable framing)                                   */
/* ------------------------------------------------------------------ */

const MISTAKES = [
  {
    mistake: "Training the way you did at 30",
    fix: "Keep the intensity, add the recovery. Two hard days a week, not three, with 48 to 72 hours between them. The plan that built you can't be run on a 45-year-old's recovery budget.",
  },
  {
    mistake: "Skipping strength because you're scared of bulking or losing your climbing legs",
    fix: "Lift heavy and fast twice a week. The research is one-directional: structured strength work makes cyclists faster with no cost to VO2 max. You will not turn into a bodybuilder on two sessions.",
  },
  {
    mistake: "Riding the grey zone and calling it endurance",
    fix: "Pin your easy days to a pace that feels almost too slow. Save the suffering for the two sessions that earn it. Easy-but-not-easy is the most expensive habit in masters cycling.",
  },
  {
    mistake: "Under-fuelling — still chasing the scale with low protein",
    fix: "Fuel the work, hit 1.6 to 2.2 g/kg of protein across the day, and let body composition follow. Crash diets strip the muscle ageing is already taking.",
  },
  {
    mistake: "Treating recovery as the thing you cut when you're busy",
    fix: "Protect sleep first. Deload every three to four weeks. Run the seven-point recovery audit and fix what it surfaces. After 40, recovery is the input that decides whether any of the training sticks.",
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
    blurb: "The spine of the methodology — what changes, what doesn't, and the weekly structure that holds up.",
    links: [
      { href: "/blog/masters-cyclist-guide-getting-faster-after-40", label: "The Masters Decision Framework: 3 mistakes that stall riders over 40" },
      { href: "/blog/cycling-over-40-getting-faster", label: "Getting Faster After 40: the age-defying guide" },
      { href: "/blog/cycling-after-40-faster-science", label: "Cycling After 40: the science of getting faster" },
      { href: "/blog/cycling-over-50-training", label: "Cycling Over 50: training smarter when recovery takes longer" },
      { href: "/blog/cycling-training-plan-masters-over-40", label: "The best cycling training plan for masters riders over 40" },
      { href: "/blog/vo2-max-workouts-cyclists-over-40", label: "VO2 max workouts for cyclists over 40" },
      { href: "/blog/sprint-interval-training-cyclists-masters", label: "Sprint interval training for masters cyclists" },
      { href: "/blog/cycling-cadence-by-age-masters", label: "Cycling cadence by age: why masters should spin higher" },
      { href: "/blog/efficiency-factor-cycling-masters", label: "Efficiency factor for masters cyclists" },
      { href: "/blog/resting-heart-rate-masters-cyclists", label: "Resting heart rate for masters cyclists" },
      { href: "/blog/ftp-benchmarks-by-age-and-experience", label: "FTP benchmarks by age and experience" },
      { href: "/blog/age-group-ftp-benchmarks-2026", label: "Age-group FTP benchmarks 2026" },
      { href: "/blog/what-experts-say-about-masters-cycling", label: "What coaches say about getting faster after 40" },
      { href: "/blog/best-cycling-coach-masters-riders", label: "What to look for in a coach for masters riders" },
      { href: "/blog/joe-friel-fast-after-50-cycling-method", label: "Joe Friel: the Fast After 50 method" },
    ],
  },
  {
    heading: "Strength after 40",
    blurb: "The training that defends the fibres endurance riding leaves behind.",
    links: [
      { href: "/blog/strength-training-cyclists-over-50", label: "Strength training for cyclists over 50" },
      { href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40", label: "Heavy strength training beats more miles after 40" },
      { href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40", label: "Andy Galpin: why the snap goes first" },
      { href: "/blog/derek-teel-best-exercises-cyclists", label: "Derek Teel's best exercises for cyclists" },
    ],
  },
  {
    heading: "Recovery",
    blurb: "After 40 this is the input that decides whether the training sticks.",
    links: [
      { href: "/blog/masters-recovery-audit-seven-things-to-check", label: "The over-40 recovery audit: seven things to check" },
      { href: "/blog/post-ride-recovery-window-cyclists-over-40", label: "The post-ride recovery window for cyclists over 40" },
      { href: "/blog/cycling-after-40-recovery-report-2026", label: "Cycling After 40 Recovery Report (Q3 2026)" },
    ],
  },
  {
    heading: "Hormones, fuelling & body composition",
    blurb: "The factors that move with age and quietly stall good riders.",
    links: [
      { href: "/blog/free-testosterone-cyclists-50th-percentile-dr-gordon", label: "Free testosterone in cyclists: what the research says" },
      { href: "/blog/menopause-cycling-performance", label: "Menopause and cycling performance" },
      { href: "/blog/iron-deficiency-cyclists-masters", label: "Iron deficiency in masters cyclists" },
    ],
  },
  {
    heading: "The culture & the playlists",
    blurb: "The reckoning the sport is having — and where to start in the archive.",
    links: [
      { href: "/blog/masters-racing-doping-cycling-amateur-cheating", label: "The masters doping problem" },
      { href: "/blog/best-roadman-episodes-masters", label: "Best Roadman episodes for masters cyclists" },
      { href: "/blog/masters-cycling-podcast-playlist", label: "The masters cycling podcast playlist" },
      { href: "/blog/every-roadman-episode-with-stephen-seiler", label: "Every Roadman episode with Stephen Seiler" },
      { href: "/blog/podcasts-for-cyclists-over-40", label: "The best podcasts for cyclists over 40" },
      { href: "/blog/best-cycling-training-podcasts-age-groupers", label: "Best cycling training podcasts for age-groupers" },
    ],
  },
];

const TOPIC_HUBS = [
  { href: "/topics/ftp-training", label: "FTP Training", note: "Threshold, zones, intensity" },
  { href: "/topics/cycling-strength-conditioning", label: "Strength & Conditioning", note: "The off-the-bike work" },
  { href: "/topics/cycling-recovery", label: "Recovery", note: "Sleep, deloads, adaptation" },
  { href: "/topics/cycling-nutrition", label: "Nutrition", note: "Fuelling, protein, body comp" },
  { href: "/topics/cycling-training-plans", label: "Training Plans", note: "Structuring the year" },
  { href: "/topics/cycling-coaching", label: "Coaching", note: "What good coaching looks like" },
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
    description: "Where your watts actually place you for your age band — and the realistic next 12-month target.",
    masters: true,
  },
  {
    href: "/tools/masters-recovery-score",
    label: "Masters Recovery Score",
    description: "Score the recovery factors that matter most after 40 — sleep, training load, age, stress.",
    masters: true,
  },
  {
    href: "/tools/ftp-zones",
    label: "FTP Zones Calculator",
    description: "Build your training zones from a current FTP, ready for the polarised distribution.",
  },
  {
    href: "/tools/hr-zones",
    label: "Heart Rate Zones",
    description: "Zones from threshold or max HR — useful when you're tracking aerobic durability.",
  },
  {
    href: "/tools/race-weight",
    label: "Race Weight Calculator",
    description: "A goal race weight without the calorie-counting trap. Built around fuelling, not restriction.",
  },
  {
    href: "/tools/energy-availability",
    label: "Energy Availability",
    description: "Check whether you're under-fuelling for the work — the hidden lid on masters performance.",
  },
  {
    href: "/tools/fuelling",
    label: "In-Ride Fuelling",
    description: "Carbs per hour for the ride in front of you, so you finish the session you started.",
  },
  {
    href: "/tools/wkg",
    label: "W/kg Calculator",
    description: "Power-to-weight from your numbers — the ratio that decides what happens on a climb.",
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
    a: "You can get faster. The decline that gets quoted — roughly 5% of VO2 max per decade in trained masters, against closer to double that in sedentary adults — is the trained athlete's number, and the riders who keep improving live at the good end of it. The work that gets them there isn't more volume or harder intervals. It's polarised intensity distribution, targeted strength twice a week, longer recovery between hard sessions, and protein timed across the day. The training that worked at 30 doesn't work the same after 40, but the right training still produces real gains.",
  },
  {
    q: "What's different about masters cycling training versus general training?",
    a: "Three things change. One: recovery windows are longer, so two properly hard sessions a week beats three almost-hard ones. Two: strength work moves from optional to non-negotiable — a 2025 meta-analysis of 17 studies showed structured strength training improves cycling performance after 40 with no cost to VO2 max. Three: fuelling and protein become load-bearing, at 1.6 to 2.2 g/kg a day, spread across meals, not skipped at breakfast. Most masters riders fall behind because they keep doing what worked at 30 with less recovery and worse fuel. The fix is rarely 'train harder'.",
  },
  {
    q: "Is strength training really necessary for cyclists over 40?",
    a: "Yes, and it's the most under-done work in masters cycling. After 40 the fast-twitch fibres behind your kick shrink first and shrink hardest — Andy Galpin puts it at 10 to 40% — and endurance riding does almost nothing to protect them. Two strength sessions a week, heavy and fast, single-leg and eccentric-led, directly defends that part of the engine. The 2025 meta-analysis is unambiguous: it makes cyclists faster, with no negative effect on VO2 max.",
  },
  {
    q: "How much should a masters cyclist train each week?",
    a: "Most serious masters riders are in the 6 to 12 hour range, and that's plenty if it's structured. The shape matters more than the total: two properly hard sessions, the rest easy enough to recover from, two strength sessions, and a deload every three to four weeks. Piling on volume you can't recover from is how riders over 40 stall. Run the Masters Recovery Score if you want to see whether your current load is one you can actually absorb.",
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
  { value: "12-week", label: "Block you can run on Monday" },
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
  title: "Masters Cycling Training — Getting Faster Over 40, 45, 50+",
  description:
    "The definitive resource for masters cycling training. Evidence-based training, strength, recovery and nutrition for cyclists over 40 — Galpin, Seiler, Friel, the 2026 Masters Report, and the tools to run it next Monday.",
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
    title: "Masters Cycling Training — The Authority on Getting Faster After 40",
    description:
      "Training, strength, recovery and nutrition for serious cyclists over 40. The Roadman archive, the 2026 Masters Report, and the tools to run it next Monday.",
    type: "website",
    url: HUB_URL,
    images: [
      {
        url: `${HUB_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "The Masters Cycling Authority — Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Cycling Training — Getting Faster Over 40, 45, 50+",
    description:
      "The definitive, evidence-based resource for cyclists over 40. Training, strength, recovery, nutrition.",
    images: [`${HUB_URL}/opengraph-image`],
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
    name: "Masters Cycling Training — The Roadman Cycling Authority on Getting Faster After 40",
    description:
      "The definitive masters cycling resource. Evidence-based training, strength, recovery and nutrition for serious cyclists over 40, grounded in the Roadman podcast archive.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    about: {
      "@type": "Thing",
      name: "Masters Cycling Training",
      description:
        "Training, strength, recovery and nutrition for cyclists aged 40+ who continue to improve through structured, evidence-based work.",
    },
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 38,
      suggestedMaxAge: 75,
      audienceType: "Masters cyclists",
    },
    inLanguage: "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${HUB_URL}/opengraph-image`,
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
                  For four years Roadman has put the people who actually study
                  and coach masters performance on the mic — Stephen Seiler,
                  Andy Galpin, Joe Friel, David Lipman, Derek Teel. This is
                  everything they taught us about getting faster after 40,
                  pulled into one place.
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
                not that you slow down, it&apos;s that the things you have to
                manage change. Five of them, specifically. Name them and every
                one is trainable.
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
                FOUR THINGS WE&apos;D STAKE IT ON
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                This is the editorial position — what the access has convinced
                us is true for riders over 40. It isn&apos;t the only way to
                train. It&apos;s the way that keeps showing up in the riders who
                are still getting faster.
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
                  The definitive guide to training as a masters cyclist. What
                  changes after 40, what doesn&apos;t, and a 12-week block you
                  can run on Monday. 18 sections, 40+ citations, 5 named case
                  studies.
                </p>
              </Link>
            </ScrollReveal>

            {/* Grouped reading */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {LIBRARY.map((group, gi) => (
                <ScrollReveal key={group.heading} direction="up" delay={gi * 0.04}>
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
                <Card className="p-6 h-full border-l-2 border-l-coral" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white tracking-wide mb-4">
                    THIS IS FOR YOU IF
                  </h3>
                  <ul className="space-y-3">
                    {FOR_YOU.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-foreground-muted leading-relaxed">
                        <span className="text-coral shrink-0 font-heading">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.06}>
                <Card className="p-6 h-full border-l-2 border-l-white/20" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white tracking-wide mb-4">
                    PROBABLY NOT IF
                  </h3>
                  <ul className="space-y-3">
                    {NOT_FOR_YOU.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-foreground-muted leading-relaxed">
                        <span className="text-foreground-subtle shrink-0 font-heading">–</span>
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
                    <Card className="p-6 h-full border-l-2 border-l-coral" hoverable={false}>
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
                <Card className="p-6 h-full border-2 border-coral relative" hoverable={false}>
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
              lastReviewed="24 August 2026"
              reviewedBy="Roadman Cycling coaching team"
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
              The training that keeps masters cyclists getting faster is
              fixable, structured, and well-mapped. Start with the report, or
              let the diagnostic point you at the right next step.
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
