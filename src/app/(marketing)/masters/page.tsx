import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";

/**
 * /masters — Masters Performance Hub.
 *
 * The dedicated front door for the masters cyclist audience segment
 * (35-55+, serious amateurs who refuse to accept their best days are
 * behind them). Pulls together the Roadman evidence base on training
 * after 40: Friel, Seiler, Lipman, Teel, the strength meta-analysis,
 * the FTP benchmark tool, and the offer ladder routes.
 *
 * Surface: commercial. Primary CTA is Find Your Fit (router) for
 * undecided visitors; secondary CTAs route to the Plateau Diagnostic
 * (cold), Not Done Yet Coaching (warm), or 1:1 (premium).
 */

const HUB_PATH = "/masters";
const HUB_URL = `${SITE_ORIGIN}${HUB_PATH}`;

type FeaturedBlogPost = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  isFlagship?: boolean;
};

const FEATURED_BLOG_POSTS: readonly FeaturedBlogPost[] = [
  {
    slug: "masters-cycling-training-report-2026",
    title: "The Masters Cycling Training Report 2026",
    description:
      "The flagship 2026 guide to training as a masters cyclist. What changes after 40, what doesn't, and a 12-week block you can run on Monday. 18 sections, 40+ citations, 5 named case studies.",
    pillar: "Coaching",
    isFlagship: true,
  },
  {
    slug: "masters-cyclist-guide-getting-faster-after-40",
    title: "The Masters Cycling Decision Framework",
    description:
      "The three mistakes that stall riders over 40 — and what to do instead. The training that worked at 30 will break you now. Here's what changes.",
    pillar: "Coaching",
  },
  {
    slug: "joe-friel-fast-after-50-cycling-method",
    title: "Joe Friel: The Fast After 50 Method",
    description:
      "Joe Friel is approaching 80 and still rides 12–13 hours a week. The exact training method he has built over four decades of coaching masters endurance athletes — and why it isn't what most riders over 40 are doing.",
    pillar: "Coaching",
  },
  {
    slug: "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    title: "Heavy Strength Training Beats More Miles After 40",
    description:
      "A 2025 meta-analysis reviewed 17 studies covering 262 trained cyclists and found heavy strength training significantly improves cycling performance with zero negative effect on VO2 max. If you're over 40 and only training on the bike, here's what you're missing.",
    pillar: "Strength",
  },
  {
    slug: "vo2-max-workouts-cyclists-over-40",
    title: "VO2 Max Workouts for Cyclists Over 40",
    description:
      "VO2 max work is the highest-leverage training for cyclists over 40 — and the most often misprescribed. Three sessions that work, and the spacing that lets your body actually adapt.",
    pillar: "Coaching",
  },
  {
    slug: "strength-training-cyclists-over-50",
    title: "Strength Training for Cyclists Over 50",
    description:
      "After 50, the riders who keep getting faster are the ones lifting heavy. Not bands. Not circuits. Real load, six reps, twice a week. The protocol that actually preserves power.",
    pillar: "Strength",
  },
  {
    slug: "cycling-training-plan-masters-over-40",
    title: "Best Cycling Training Plan for Masters Riders Over 40",
    description:
      "The weekly structure serious masters riders use — built around longer recovery windows, two hard sessions, and non-negotiable strength work.",
    pillar: "Coaching",
  },
  {
    slug: "cycling-over-50-training",
    title: "Cycling Over 50: Training Smarter When Recovery Takes Longer",
    description:
      "At 50, your recovery takes longer but your potential hasn't disappeared. How to adapt your training without accepting decline.",
    pillar: "Coaching",
  },
  {
    slug: "what-experts-say-about-masters-cycling",
    title: "What Coaches Say About Getting Faster After 40",
    description:
      "The consensus from the experts who have studied and coached masters riders. The over-40 question comes up in every coaching conversation — here's what they actually agree on.",
    pillar: "Coaching",
  },
  {
    slug: "age-group-ftp-benchmarks-2026",
    title: "Age-Group FTP Benchmarks 2026",
    description:
      "What your watts really mean. The W/kg bands, category ranges, and realistic year-on-year progression for masters cyclists in 2026.",
    pillar: "Coaching",
  },
  {
    slug: "masters-racing-doping-cycling-amateur-cheating",
    title: "The Masters Doping Problem",
    description:
      "Over 180 riders started a recent local race. Drug testers showed up at the finish. Only 52 crossed the line. The uncomfortable cultural reckoning amateur cycling is having right now.",
    pillar: "Community",
  },
  {
    slug: "cycling-after-40-recovery-report-2026",
    title: "Cycling After 40 Recovery Report (Q3 2026)",
    description:
      "The companion to the Masters Training Report — sleep architecture, HRV interpretation, deload cadence, and the recovery patterns that hold up across the coaching roster.",
    pillar: "Recovery",
  },
];

const FEATURED_EPISODES = [
  {
    slug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    title: "Joe Friel: The Training Secret to Going Faster After 40",
    guest: "Joe Friel",
    credential: "Author, The Cyclist's Training Bible",
    relevance:
      "The foundational hour. Friel's framework on protecting intensity while increasing recovery, strength as non-negotiable, and protein timing for older athletes.",
  },
  {
    slug: "ep-2154-how-to-beat-99-by-getting-faster-with-age-dr-david-lipman",
    title: "How to Beat 99% by Getting Faster With Age",
    guest: "Dr David Lipman",
    credential: "Endurance physician, masters performance researcher",
    relevance:
      "What separates masters cyclists who keep improving from those who plateau — structure, consistency, and recovery architecture.",
  },
  {
    slug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    title: "80/20 Training to Ride Faster",
    guest: "Prof. Stephen Seiler",
    credential: "Exercise physiologist, polarised training researcher",
    relevance:
      "Why the 80/20 split matters more after 40, not less. The corrective on the grey-zone trap most masters cyclists fall into.",
  },
  {
    slug: "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    title: "The Secret to Cycling Fast at a Low Heart Rate",
    guest: "Prof. Stephen Seiler",
    credential: "Exercise physiologist",
    relevance:
      "Fat oxidation, mitochondrial density, and capillary adaptation — the aerobic foundation masters athletes depend on. Power-at-lower-heart-rate through patient Z2.",
  },
  {
    slug: "ep-2183-strength-training-for-cycling-simplified-derek-teel",
    title: "Strength Training for Cycling, Simplified",
    guest: "Derek Teel",
    credential: "Coach, strength training for cyclists",
    relevance:
      "Compound lifts, in-season maintenance, scheduling around hard rides. Where strength shifts from optional to non-negotiable after 40.",
  },
  {
    slug: "ep-2037-the-new-science-of-getting-faster-after-40",
    title: "The New Science of Getting Faster After 40",
    guest: "Anthony Walsh",
    credential: "Solo episode",
    relevance:
      "The data on VO2 max decline (5–46% per decade depending on training), lean mass loss, and durability — and what's actually trainable.",
  },
] as const;

type ToolEntry = {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
};

const TOOLS: readonly ToolEntry[] = [
  {
    href: "/tools/masters-ftp-benchmark",
    label: "Masters FTP Benchmark",
    description:
      "Where your watts actually place you for your age and weight — and the realistic next 12-month target.",
    primary: true,
  },
  {
    href: "/tools/masters-recovery-score",
    label: "Masters Recovery Score",
    description:
      "Score the recovery factors that matter most after 40 — sleep, deload cadence, intensity distribution, fuelling.",
    primary: true,
  },
  {
    href: "/tools/ftp-zones",
    label: "FTP Zones Calculator",
    description:
      "Build your training zones from a current FTP. Pairs with the polarised distribution masters riders need.",
  },
  {
    href: "/tools/hr-zones",
    label: "Heart Rate Zones",
    description:
      "Zones from threshold or max HR. Useful when you're tracking HR drift and aerobic durability.",
  },
  {
    href: "/tools/race-weight",
    label: "Race Weight Calculator",
    description:
      "Goal race weight without the calorie-counting trap. Built around fuelling, not restriction.",
  },
  {
    href: "/tools/energy-availability",
    label: "Energy Availability Calculator",
    description:
      "Check whether you're under-fuelling for the work you're doing — the hidden lid on masters performance.",
  },
];

const FAQ = [
  {
    q: "Can you actually get faster after 40, or is everyone just chasing maintenance?",
    a: "You can get faster. The data on VO2 max decline ranges from 5% to 46% per decade depending on training consistency — the trained masters cyclists who keep getting faster are the ones at the top end of that range. The work that gets them there isn't more volume or harder intervals; it's polarised intensity distribution, heavy strength work twice a week, longer recovery between hard sessions, and protein timed across the day. The Roadman archive — Friel, Seiler, Lipman — backs this up with research and with named case studies. The training that worked at 30 doesn't work the same after 40, but the right training still produces gains.",
  },
  {
    q: "What's different about masters training versus general cycling training?",
    a: "Three things change. One: recovery windows are longer, so two genuinely hard sessions a week beats three almost-hard ones. Two: strength work shifts from optional to non-negotiable — a 2025 meta-analysis of 17 studies showed heavy strength training improves cycling performance after 40 with no cost to VO2 max. Three: fuelling and protein become load-bearing — 1.6 to 2.0 g/kg/day, spread across meals, not skipped at breakfast. Most masters cyclists fall behind because they keep doing what worked at 30 with less recovery and worse fuel. The fix is rarely 'train harder.'",
  },
  {
    q: "Do I need a coach, or can I figure this out from the podcast and the blog?",
    a: "It depends on where you're stuck. If you're early in the work, the podcast, the Saturday Spin newsletter, and the written guides will take you a long way — they're free for a reason. If you've been at it for years and your FTP has stalled, the Plateau Diagnostic is the right next step: it's a five-minute tool that pinpoints which of four common patterns you're caught in. If you want the full system — personalised TrainingPeaks plans, weekly coaching calls, the strength roadmap — Not Done Yet Coaching is the structured paid programme. If you're not sure which fits, take the Find Your Fit quiz: five questions, one specific recommendation.",
  },
  {
    q: "Is Not Done Yet Coaching built for masters cyclists, or is it general?",
    a: "It's built around the serious amateur and masters cyclist who refuses to accept their best days are behind them — that's literally the brand identity. The personalised TrainingPeaks plans, the weekly coaching calls with Anthony, the cycling-specific strength roadmap, and the recovery and fuelling guidance all assume an athlete training 6 to 12 hours a week with a job, a family, and the recovery profile of an adult, not a 22-year-old U23. It's $195 a month with a 7-day free trial. If you want the bespoke version with direct 1:1 access to Anthony, that's the Inner Circle — application only.",
  },
];

const STATS = [
  { value: "1,400+", label: "Podcast episodes in the archive" },
  { value: "40+", label: "Sources cited in the 2026 Masters Report" },
  { value: "$195", label: "/month for Not Done Yet Coaching" },
];

const masterTestimonials = getTestimonialsByName([
  "Brian Morrissey",
  "Kevin L",
  "Mary K",
]);

export const metadata: Metadata = {
  title:
    "Masters Cycling Performance Hub — Still Improving at 40, 45, 50+ | Roadman Cycling",
  description:
    "The Roadman Cycling masters performance hub. Evidence-based training, strength, recovery, and nutrition for serious cyclists 35-55+. Friel, Seiler, Lipman, the 2026 Masters Report, and the tools to put it to work.",
  keywords: [
    "masters cycling",
    "cycling after 40",
    "cycling over 50",
    "masters cyclist training",
    "fast after 50",
    "masters FTP benchmarks",
    "strength training cyclists over 40",
    "VO2 max masters cyclists",
    "Joe Friel masters training",
    "Stephen Seiler aging",
  ],
  alternates: {
    canonical: HUB_URL,
  },
  openGraph: {
    title: "Masters Cycling Performance Hub — Still Improving at 40, 45, 50+",
    description:
      "Evidence-based training, strength, recovery, and nutrition for serious cyclists 35-55+. The Roadman archive, the 2026 Masters Report, and the tools to put it to work.",
    type: "website",
    url: HUB_URL,
    images: [
      {
        url: `${HUB_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Masters Cycling Performance Hub — Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Cycling Performance Hub — Still Improving at 40, 45, 50+",
    description:
      "Evidence-based training, strength, recovery, and nutrition for serious cyclists 35-55+.",
    images: [`${HUB_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true },
};

export default function MastersHubPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_ORIGIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Masters",
        item: HUB_URL,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${HUB_URL}#webpage`,
    url: HUB_URL,
    name: "Masters Cycling Performance Hub — Roadman Cycling",
    description:
      "The Roadman Cycling masters performance hub. Evidence-based training, strength, recovery, and nutrition for serious cyclists 35-55+.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    about: {
      "@type": "Thing",
      name: "Masters Cycling",
      description:
        "Training, recovery, and performance for cyclists aged 35–55+ who continue to improve through structured, evidence-based work.",
    },
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 35,
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
        {/* Hero — problem-first */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <ScrollReveal direction="up" eager>
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-coral font-heading text-sm tracking-[0.3em] uppercase mb-6">
                  Masters Performance Hub
                </p>
                <h1
                  className="font-heading text-off-white uppercase leading-[0.95] mb-6"
                  style={{ fontSize: "var(--text-hero)" }}
                >
                  Still improving at{" "}
                  <span className="text-coral">40, 45, 50+</span>.
                  <br />
                  Here&apos;s how.
                </h1>
                <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-4">
                  The data on VO2 max decline ranges from 5% to 46% per decade
                  — the difference is the training. The work that got you here
                  at 30 will quietly stall you at 45. The work that keeps
                  masters cyclists getting faster is structured differently,
                  fuelled differently, and recovered differently.
                </p>
                <p className="text-off-white text-lg md:text-xl leading-relaxed font-medium mb-10">
                  Roadman is built around it. Here&apos;s the evidence, the
                  tools, and the route through.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <Button
                    href="/find-your-fit"
                    size="lg"
                    dataTrack="masters_hub_hero_find_your_fit"
                  >
                    Find Your Fit — 5 Questions
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
                  Free, two minutes. Routes you to the right next step.
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

        {/* Why Roadman is built around the masters question */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHAT MAKES THIS DIFFERENT
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  THIS IS NOT MOTIVATIONAL CONTENT.
                </GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                It&apos;s grounded in the access. Anthony has spent four years
                interviewing the people who actually study and coach masters
                endurance athletes — Joe Friel, Stephen Seiler, David Lipman,
                Derek Teel, David Dunne, and dozens more. The hub below pulls
                that work into one place, organised around the questions
                masters cyclists actually ask.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  number: "01",
                  title: "Access",
                  body: "1,400+ podcast episodes with the coaches and scientists behind World Tour and masters performance — Friel, Seiler, Lipman, Teel, Dunne, Lorang.",
                },
                {
                  number: "02",
                  title: "Evidence",
                  body: "The Masters Cycling Training Report 2026 — 18 sections, 40+ citations, 5 named case studies. Updated as the research updates.",
                },
                {
                  number: "03",
                  title: "Application",
                  body: "Free browser tools, structured 12-week blocks, the strength roadmap, and Not Done Yet Coaching for cyclists who want it built around them.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" glass hoverable={false}>
                    <span className="font-heading text-3xl text-coral/40 block mb-3">
                      {item.number}
                    </span>
                    <h3 className="font-heading text-lg text-off-white mb-3 tracking-wide">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Tools */}
        <Section background="deep-purple" grain id="tools">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                FREE BROWSER TOOLS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE MASTERS TOOLKIT
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Start with the two built specifically for masters riders. The
                rest pair with them — zones, race weight, energy availability —
                so you&apos;re not guessing about the inputs.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-3">
              {TOOLS.map((t, i) => (
                <ScrollReveal key={t.href} direction="up" delay={i * 0.04}>
                  <Link
                    href={t.href}
                    className={`block p-5 rounded-lg border transition-all group h-full ${
                      t.primary
                        ? "bg-coral/10 border-coral/40 hover:bg-coral/15 hover:border-coral"
                        : "bg-white/5 border-white/10 hover:bg-coral/10 hover:border-coral/30"
                    }`}
                    data-track={`masters_hub_tool_${t.href.split("/").pop()}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors tracking-wide">
                        {t.label.toUpperCase()}
                      </p>
                      {t.primary && (
                        <span className="shrink-0 text-[10px] font-heading tracking-widest text-coral border border-coral/40 rounded px-2 py-0.5">
                          MASTERS
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {t.description}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Curated reading */}
        <Section background="charcoal" id="reading">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE WRITTEN ARCHIVE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                READ THIS FIRST
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Twelve essays that cover the spine of masters performance —
                training, strength, recovery, fuelling, the FTP question, and
                the cultural context the sport is reckoning with.
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {FEATURED_BLOG_POSTS.map((post, i) => (
                <ScrollReveal key={post.slug} direction="up" delay={i * 0.03}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`block p-6 rounded-lg border transition-all group ${
                      post.isFlagship
                        ? "bg-coral/10 border-coral/40 hover:bg-coral/15 hover:border-coral"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-coral/30"
                    }`}
                    data-track={`masters_hub_blog_${post.slug}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-3">
                      <h3 className="font-heading text-lg md:text-xl text-off-white group-hover:text-coral transition-colors tracking-wide">
                        {post.title.toUpperCase()}
                      </h3>
                      <span className="shrink-0 text-[10px] font-heading tracking-widest text-coral/80 uppercase">
                        {post.isFlagship ? "FLAGSHIP · " : ""}
                        {post.pillar}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {post.description}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <Link
                href="/blog?topic=masters"
                className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
              >
                ALL MASTERS WRITING →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Podcast playlist */}
        <Section background="deep-purple" grain id="podcast">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                PODCAST PLAYLIST
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE SIX EPISODES THAT MATTER MOST
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Start with Friel. Then Lipman for the structure, Seiler for
                the intensity distribution, Teel for the strength piece, and
                the solo science recap to tie it all together.
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {FEATURED_EPISODES.map((ep, i) => (
                <ScrollReveal key={ep.slug} direction="up" delay={i * 0.04}>
                  <Link
                    href={`/podcast/${ep.slug}`}
                    className="block p-6 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-coral/40 transition-all group"
                    data-track={`masters_hub_episode_${ep.slug}`}
                  >
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-3">
                        <p className="font-heading text-coral text-xs tracking-widest mb-1">
                          {ep.guest.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs leading-relaxed">
                          {ep.credential}
                        </p>
                      </div>
                      <div className="md:col-span-9">
                        <h3 className="font-heading text-base md:text-lg text-off-white group-hover:text-coral transition-colors tracking-wide mb-2">
                          {ep.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {ep.relevance}
                        </p>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <Link
                href="/blog/best-roadman-episodes-masters"
                className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
              >
                THE FULL MASTERS PLAYLIST →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Testimonials */}
        {masterTestimonials.length > 0 && (
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
                  MASTERS RIDERS WHO DIDN&apos;T ACCEPT THE PLATEAU
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-4">
                {masterTestimonials.map((t, i) => (
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

        {/* Coaching ladder */}
        <Section background="deep-purple" grain id="coaching">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE OFFER LADDER
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIND THE RIGHT NEXT STEP
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Three routes, depending on where you are. If you&apos;re not
                sure, the Find Your Fit quiz takes five questions and gives
                you one specific recommendation.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Plateau Diagnostic */}
              <ScrollReveal direction="up" delay={0}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="text-coral font-heading text-xs tracking-widest mb-3">
                    ENTRY · FREE
                  </p>
                  <h3 className="font-heading text-xl text-off-white mb-3 tracking-wide">
                    PLATEAU DIAGNOSTIC
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6">
                    A five-minute diagnostic that pinpoints which of four
                    common patterns has stalled your training — and the one
                    thing to do about it next. Built for masters cyclists.
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

              {/* Not Done Yet */}
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
                    Personalised TrainingPeaks plans, weekly coaching calls
                    with Anthony, the cycling-specific strength roadmap, and
                    race-weight and fuelling guidance — built for masters
                    cyclists training 6 to 12 hours a week.
                  </p>
                  <Button
                    href="/community/not-done-yet"
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

              {/* Inner Circle */}
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

            <ScrollReveal direction="up" className="text-center mt-10">
              <p className="text-foreground-muted mb-4">
                Not sure which fits?
              </p>
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

        {/* FAQ */}
        <Section background="charcoal">
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

        {/* Final CTA */}
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
              fixable, structured, and well-mapped. Pick the route that fits
              where you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/find-your-fit"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="masters_hub_footer_find_your_fit"
              >
                Find Your Fit
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
