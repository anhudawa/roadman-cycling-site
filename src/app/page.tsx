import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoachingFooter } from "@/components/layout/CoachingFooter";
import { CoachingHeader } from "@/components/layout/CoachingHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, BRAND_STATS, ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  FIVE_PILLARS,
  MESSAGING_BLOCKS,
  NAMED_EXPERTS,
} from "@/lib/brand-messaging";
import { CASE_STUDIES } from "@/lib/case-studies";
import { TESTIMONIALS } from "@/lib/testimonials";
import styles from "./HomePage.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Roadman Cycling | Cycling Coaching, Podcast & Training",
  },
  description:
    "Personalised cycling coaching for riders not done yet, plus the Roadman Podcast, evidence-led training guides, free cycling tools and training camps.",
  alternates: { canonical: SITE_ORIGIN },
  openGraph: {
    type: "website",
    url: SITE_ORIGIN,
    title: "You’re Not Done Yet. | Roadman Cycling Coaching",
    description:
      "Personalised cycling coaching for serious amateurs who refuse to accept that their best riding is behind them.",
    images: [
      {
        url: "/og-ndy.png",
        width: 1200,
        height: 630,
        alt: "You’re Not Done Yet — personalised cycling coaching from Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You’re Not Done Yet. | Roadman Cycling Coaching",
    description:
      "Personalised cycling coaching for serious amateurs who refuse to plateau.",
    images: ["/og-ndy.png"],
  },
};

export const revalidate = 900;

const resultProfiles = [
  {
    name: "Damien Maloney",
    image: "/images/testimonials/damien.jpg",
    metric: "+90W",
    label: "FTP · 205W → 295W",
  },
  {
    name: "Daniel Stone",
    image: "/images/testimonials/daniel.jpg",
    metric: "CAT 3 → 1",
    label: "In one season",
  },
  {
    name: "Brian Morrissey",
    image: "/images/testimonials/brian.jpg",
    metric: "+15%",
    label: "FTP at age 52",
  },
] as const;

const results = resultProfiles.map((profile) => {
  const testimonial = TESTIMONIALS.find(
    (candidate) => candidate.name === profile.name,
  );
  const caseStudy = CASE_STUDIES.find(
    (study) => study.testimonialName === profile.name,
  );

  return {
    ...profile,
    quote: testimonial?.shortQuote ?? testimonial?.quote ?? "",
    detail: testimonial?.detail ?? "",
    href: caseStudy ? `/case-studies/${caseStudy.slug}` : "/case-studies",
  };
});

const frictionPoints = [
  {
    number: "01",
    title: "Your plan ignores your life.",
    copy: "Work gets heavy, sleep falls apart, the weekend changes — and the template keeps prescribing as if nothing happened.",
  },
  {
    number: "02",
    title: "Every input is disconnected.",
    copy: "Training, fuelling, strength and recovery are all moving, but nobody is reading the whole picture.",
  },
  {
    number: "03",
    title: "Hard work became grey-zone habit.",
    copy: "You are consistent. You are motivated. But more of the same is no longer creating adaptation.",
  },
] as const;

const delivery = [
  {
    number: "01",
    title: "A plan built around your goal",
    copy: "Your TrainingPeaks plan is shaped around your event, available hours, training history and current data.",
  },
  {
    number: "02",
    title: "A team reading the signals",
    copy: "The Roadman coaching team reviews your plan each week. Anthony leads the live group call that turns data, fatigue and real-life context into clear decisions.",
  },
  {
    number: "03",
    title: "One connected performance system",
    copy: "Training, nutrition, strength, recovery and community work together — not as five unrelated content folders.",
  },
  {
    number: "04",
    title: "Adjustments when life changes",
    copy: "A disrupted week does not ruin the block. The system adapts, the priority stays visible and momentum continues.",
  },
] as const;

const applicationSteps = [
  {
    number: "01",
    title: "Tell us where you’re stuck",
    copy: "A short application covers your riding, your target and the constraint that keeps getting in the way.",
  },
  {
    number: "02",
    title: "Anthony reviews the fit",
    copy: "Every application is read personally. If Not Done Yet is not the right next step, we will tell you.",
  },
  {
    number: "03",
    title: "Start with seven days",
    copy: "If the fit is right, begin with a 7-day free trial. No long contract. Cancel anytime.",
  },
] as const;

const offerInclusions = [
  "Personalised TrainingPeaks plan, reviewed every week",
  "Weekly live group coaching with Anthony — recordings included",
  "Individual plan adjustments when training or life changes",
  "Nutrition and strength guidance matched to your training",
  "Private Not Done Yet rider community",
] as const;

const faqs = [
  {
    question: "How much time do I need to train?",
    answer:
      "Not Done Yet is built for serious amateurs with real lives. Most riders have 6–12 hours a week. The point is to make those hours work together, not to pretend you have a professional schedule.",
  },
  {
    question: "How personal is the coaching?",
    answer:
      "Your individual TrainingPeaks plan is reviewed every week by the Roadman coaching team. Anthony leads the live group coaching call, with recordings included, and your plan is adjusted individually when training, recovery or life changes. The community adds access and accountability; it does not replace personalisation.",
  },
  {
    question: "Do I need to race?",
    answer:
      "No. You do need a meaningful reason to improve. That can be a race, a sportive, a comeback, a climbing goal or simply refusing to accept the plateau.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "Anthony reviews your application personally and replies within 48 hours. If the coaching matches your needs, you will be invited to start a 7-day free trial. If it does not, you will get an honest answer.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Yes. Not Done Yet is $195 USD per month after the trial, billed month to month. There is no long-term contract and you can cancel anytime.",
  },
] as const;

const discoveryPaths = [
  {
    number: "01",
    category: "Listen",
    title: "The Roadman Podcast",
    href: "/podcast",
    copy: "1,400+ podcast episodes, including conversations with world-class coaches, athletes and researchers.",
    secondaryLabel: "Meet the guests",
    secondaryHref: "/guests",
    track: "home_discovery_podcast",
  },
  {
    number: "02",
    category: "Learn",
    title: "Training knowledge, made useful",
    href: "/blog",
    copy: "Evidence-led guidance on training, fuelling, recovery and performance.",
    secondaryLabel: "Browse training plans",
    secondaryHref: "/plan",
    track: "home_discovery_blog",
  },
  {
    number: "03",
    category: "Use",
    title: "Free cycling tools",
    href: "/tools",
    copy: "Calculators and diagnostics that turn your data into a clear next step.",
    secondaryLabel: "Diagnose your plateau",
    secondaryHref: "/plateau",
    track: "home_discovery_tools",
  },
  {
    number: "04",
    category: "Ride",
    title: "Roadman training camps",
    href: "/training-camps",
    copy: "Focused riding experiences that bring the Roadman method beyond the screen.",
    secondaryLabel: "Explore the free Clubhouse",
    secondaryHref: "/community/clubhouse",
    track: "home_discovery_camps",
  },
] as const;

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up";
  delay?: number;
}) {
  return (
    <div
      className={`${styles.reveal} ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <CoachingHeader />

      <main id="main-content" className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-heading">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <span className={styles.heroIdentity} aria-hidden="true">
            NOT DONE YET
          </span>

          <div className={`${styles.container} ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                NOT DONE YET <span aria-hidden="true">·</span> PERSONALISED
                CYCLING COACHING
              </p>
              <h1 id="home-heading" className={styles.heroTitle}>
                <span>STOP</span>
                <span>PLATEAUING.</span>
                <span className={styles.heroTitleAccent}>START</span>
                <span className={styles.heroTitleAccent}>PROGRESSING.</span>
              </h1>
              <p className={styles.heroLead}>{MESSAGING_BLOCKS.hero.subhead}</p>
              <div className={styles.heroActions}>
                <Link
                  href="/apply"
                  className={styles.primaryCta}
                  data-track="home_hero_apply"
                >
                  Start the 2-minute application
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="#system"
                  className={styles.textCta}
                  data-track="home_hero_system"
                >
                  See what you get
                  <span aria-hidden="true">↓</span>
                </Link>
              </div>
              <p className={styles.heroTerms}>
                $195 USD/month <span>·</span> 7-day free trial <span>·</span>{" "}
                Cancel anytime
              </p>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroPortraitFrame}>
                <Image
                  src="/images/team/anthony.avif"
                  alt="Anthony Walsh, Roadman cycling coach"
                  fill
                  sizes="(max-width: 767px) 86vw, (max-width: 1200px) 43vw, 520px"
                  className={styles.heroPortrait}
                  preload
                />
              </div>
              <div className={styles.heroCoachTag}>
                <span>COACHING CYCLISTS</span>
                <strong>SINCE 2013</strong>
              </div>
              <div className={styles.heroResultCard}>
                <span className={styles.heroResultValue}>WEEKLY</span>
                <span>Plan review</span>
                <small>Adjusted around real life</small>
              </div>
            </div>
          </div>

          <div className={styles.heroBottomRule} aria-hidden="true">
            <span />
          </div>
        </section>

        <section id="results" className={styles.resultsSection}>
          <div className={styles.container}>
            <ScrollReveal direction="up">
              <div className={styles.sectionIntroRow}>
                <div>
                  <p className={styles.eyebrow}>MEASURED MEMBER OUTCOMES</p>
                  <h2 className={styles.sectionTitle}>
                    PROOF IN WATTS.
                    <br />
                    <span>NOT ADJECTIVES.</span>
                  </h2>
                </div>
                <p className={styles.sectionLead}>
                  Progress looks different for every rider. The standard is the
                  same: a result you can feel on the road and see in the data.
                </p>
              </div>
            </ScrollReveal>

            <div className={styles.resultGrid}>
              {results.map((result, index) => (
                <ScrollReveal
                  key={result.name}
                  direction="up"
                  delay={index * 0.08}
                >
                  <article className={styles.resultCard}>
                    <div className={styles.resultImage}>
                      <Image
                        src={result.image}
                        alt={`${result.name}, Roadman coaching member`}
                        fill
                        sizes="(max-width: 767px) 88px, 104px"
                      />
                    </div>
                    <div className={styles.resultMetricBlock}>
                      <p className={styles.resultMetric}>{result.metric}</p>
                      <p className={styles.resultMetricLabel}>{result.label}</p>
                    </div>
                    <blockquote>
                      <p>“{result.quote}”</p>
                      <footer>
                        <strong>{result.name}</strong>
                        <span>{result.detail}</span>
                      </footer>
                    </blockquote>
                    <Link
                      href={result.href}
                      className={styles.resultCaseStudy}
                      data-track={`home_case_study_${result.name
                        .toLowerCase()
                        .replaceAll(" ", "_")}`}
                    >
                      Read the verified case study{" "}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <div className={styles.inlineAction}>
              <Link href="/apply" data-track="home_results_apply">
                Start the 2-minute application <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.problemSection}>
          <span className={styles.problemWord} aria-hidden="true">
            STUCK
          </span>
          <div className={`${styles.container} ${styles.problemLayout}`}>
            <ScrollReveal direction="up" className={styles.problemCopy}>
              <p className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                THE PLATEAU IS NOT A PERSONALITY FLAW
              </p>
              <h2
                className={`${styles.sectionTitle} ${styles.sectionTitleDark}`}
              >
                YOU TRAIN HARD.
                <br />
                THE NUMBERS STOPPED MOVING.
              </h2>
              <p className={styles.problemLead}>
                You do not need more motivation. You need an outside read on the
                system — and a coach willing to change it.
              </p>
              <div className={styles.fitNote}>
                <strong>BUILT FOR:</strong>
                <span>
                  Serious amateur and masters cyclists, 35–55, with a full life
                  and unfinished business.
                </span>
              </div>
            </ScrollReveal>

            <div className={styles.frictionList}>
              {frictionPoints.map((point, index) => (
                <ScrollReveal
                  key={point.number}
                  direction="up"
                  delay={index * 0.08}
                >
                  <article className={styles.frictionItem}>
                    <span>{point.number}</span>
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.copy}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.systemSection}>
          <div className={`${styles.container} ${styles.systemLayout}`}>
            <ScrollReveal direction="up" className={styles.systemVisual}>
              <div className={styles.systemImage}>
                <Image
                  src="/images/community/main.JPG"
                  alt="Roadman cyclists talking together after a ride"
                  fill
                  sizes="(max-width: 959px) 100vw, 48vw"
                />
              </div>
              <div className={styles.systemImageCaption}>
                <span>THE SYSTEM FITS YOUR LIFE.</span>
                <strong>NOT THE OTHER WAY AROUND.</strong>
              </div>
            </ScrollReveal>

            <div id="system" className={styles.systemContent}>
              <ScrollReveal direction="up">
                <p className={styles.eyebrow}>WHAT YOU ACTUALLY GET</p>
                <h2 className={styles.sectionTitle}>
                  YOUR PLAN
                  <br />
                  IS NOT A PDF.
                </h2>
                <p className={styles.sectionLead}>
                  It is a living coaching process: built, watched and adjusted
                  as your fitness and your week change.
                </p>
              </ScrollReveal>

              <div className={styles.deliveryList}>
                {delivery.map((item, index) => (
                  <ScrollReveal
                    key={item.number}
                    direction="up"
                    delay={index * 0.06}
                  >
                    <article className={styles.deliveryItem}>
                      <span>{item.number}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.copy}</p>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>

              <div
                className={styles.pillarRail}
                aria-label="Five coaching pillars"
              >
                {FIVE_PILLARS.map((pillar, index) => (
                  <span key={pillar}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    {pillar.replace(" (Le Métier)", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.authoritySection}>
          <div className={styles.authorityImage}>
            <Image
              src="/images/about/anthony-walsh-podcast-home.avif"
              alt="Anthony Walsh recording the Roadman Cycling Podcast"
              fill
              sizes="(max-width: 959px) 100vw, 54vw"
            />
            <div className={styles.authorityImageWash} />
          </div>

          <div className={`${styles.container} ${styles.authorityLayout}`}>
            <ScrollReveal direction="up" className={styles.authorityCopy}>
              <p className={styles.eyebrow}>THE KNOWLEDGE BEHIND YOUR PLAN</p>
              <h2 className={styles.sectionTitle}>
                1,400+ CONVERSATIONS.
                <br />
                <span>APPLIED TO YOUR WEEK.</span>
              </h2>
              <p>
                Anthony Walsh turns lessons from World Tour coaches, sports
                scientists and pros into decisions you can use Monday morning.
                Not Done Yet is where that knowledge becomes your training week.
              </p>
              <div className={styles.authorityStats}>
                <div>
                  <strong>{BRAND_STATS.podcastDownloadsLabel}</strong>
                  <span>Podcast downloads</span>
                </div>
                <div>
                  <strong>{BRAND_STATS.episodeCountLabel}</strong>
                  <span>Recorded episodes</span>
                </div>
                <div>
                  <strong>
                    {new Date().getFullYear() - BRAND.coachingSince}
                  </strong>
                  <span>Years coaching</span>
                </div>
              </div>
              <Link
                href="/methodology"
                className={styles.textCta}
                data-track="home_authority_method"
              >
                Read the methodology <span aria-hidden="true">→</span>
              </Link>
            </ScrollReveal>
          </div>

          <div
            className={styles.expertRail}
            aria-label="Roadman expert network"
          >
            {NAMED_EXPERTS.map((expert) => (
              <span key={expert}>{expert}</span>
            ))}
          </div>
        </section>

        <section className={styles.applicationSection}>
          <div className={styles.container}>
            <ScrollReveal direction="up">
              <div className={styles.sectionIntroRow}>
                <div>
                  <p className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                    WHAT HAPPENS NEXT
                  </p>
                  <h2
                    className={`${styles.sectionTitle} ${styles.sectionTitleDark}`}
                  >
                    THREE STEPS.
                    <br />
                    <span>ONE HONEST DECISION.</span>
                  </h2>
                </div>
                <p className={styles.applicationLead}>
                  Applying is not a commitment. It is a fit check — for you and
                  for us.
                </p>
              </div>
            </ScrollReveal>

            <div className={styles.applicationGrid}>
              <div className={styles.applicationSteps}>
                {applicationSteps.map((step, index) => (
                  <ScrollReveal
                    key={step.number}
                    direction="up"
                    delay={index * 0.08}
                  >
                    <article className={styles.applicationStep}>
                      <span>{step.number}</span>
                      <h3>{step.title}</h3>
                      <p>{step.copy}</p>
                    </article>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal direction="up" className={styles.offerCard}>
                <div className={styles.offerTopline}>
                  <span>NOT DONE YET COACHING</span>
                  <small>MONTH TO MONTH</small>
                </div>
                <div className={styles.price}>
                  <span>$</span>
                  <strong>195</strong>
                  <small>USD / MONTH</small>
                </div>
                <p className={styles.trialLine}>
                  Your first 7 days are free. Cancel anytime.
                </p>
                <ul>
                  {offerInclusions.map((inclusion) => (
                    <li key={inclusion}>
                      <span aria-hidden="true">✓</span>
                      {inclusion}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className={styles.offerCta}
                  data-track="home_offer_apply"
                >
                  Start the 2-minute application
                  <span aria-hidden="true">↗</span>
                </Link>
                <p className={styles.offerMicrocopy}>
                  Every application is reviewed personally by Anthony.
                </p>
              </ScrollReveal>
            </div>

            <p className={styles.notReady}>
              Not ready to apply?{" "}
              <Link href="/plateau" data-track="home_offer_plateau">
                Take the free Plateau Diagnostic
              </Link>
              .
            </p>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={`${styles.container} ${styles.faqLayout}`}>
            <ScrollReveal direction="up" className={styles.faqIntro}>
              <p className={styles.eyebrow}>BEFORE YOU APPLY</p>
              <h2 className={styles.sectionTitle}>
                STRAIGHT
                <br />
                ANSWERS.
              </h2>
              <p>
                No manufactured urgency. No hidden contract. Just what the
                coaching is, who it is for and what happens next.
              </p>
            </ScrollReveal>

            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <ScrollReveal
                  key={faq.question}
                  direction="up"
                  delay={index * 0.05}
                >
                  <details className={styles.faqItem}>
                    <summary>
                      <span>{faq.question}</span>
                      <span className={styles.faqIcon} aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p>{faq.answer}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.exploreSection}
          aria-labelledby="explore-roadman-heading"
          data-sticky-apply-stop
        >
          <div className={styles.container}>
            <div className={styles.exploreIntro}>
              <ScrollReveal direction="up">
                <p className={styles.eyebrow}>OTHER WAYS INTO ROADMAN</p>
                <h2
                  id="explore-roadman-heading"
                  className={styles.exploreTitle}
                >
                  KEEP LEARNING.
                  <br />
                  KEEP MOVING.
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.06}>
                <p className={styles.exploreLead}>
                  Not ready for coaching today? Start with the route that fits
                  where you are now — and come back when you want a team behind
                  the next move.
                </p>
              </ScrollReveal>
            </div>

            <div className={styles.exploreGrid}>
              {discoveryPaths.map((path, index) => (
                <ScrollReveal
                  key={path.href}
                  direction="up"
                  delay={index * 0.05}
                >
                  <article className={styles.exploreCard}>
                    <div className={styles.exploreCardMeta}>
                      <span>{path.number}</span>
                      <span>{path.category}</span>
                    </div>
                    <h3>
                      <Link
                        href={path.href}
                        prefetch={false}
                        data-track={path.track}
                      >
                        {path.title}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </h3>
                    <p>{path.copy}</p>
                    <Link
                      href={path.secondaryHref}
                      prefetch={false}
                      className={styles.exploreSecondary}
                      data-track={`${path.track}_secondary`}
                    >
                      {path.secondaryLabel}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <div className={styles.newsletterRail}>
              <p>
                <span>A sharper cycling idea, every Saturday.</span>
                Join 30,000+ riders reading the Saturday Spin.
              </p>
              <Link
                href="/newsletter"
                prefetch={false}
                data-track="home_discovery_newsletter"
              >
                GET THE SATURDAY SPIN
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.finalCta} data-sticky-apply-stop>
          <Image
            src="/images/cycling/gravel-road-climb-home.avif"
            alt="Two cyclists climbing a steep open road"
            fill
            sizes="100vw"
            className={styles.finalCtaImage}
          />
          <div className={styles.finalCtaWash} />
          <div className={`${styles.container} ${styles.finalCtaInner}`}>
            <ScrollReveal direction="up">
              <p className={styles.eyebrow}>YOUR NEXT BEST SEASON</p>
              <h2>
                NOT DONE
                <br />
                <span>YET.</span>
              </h2>
              <p>
                You can keep guessing at the plateau. Or put a coach, a system
                and a serious group of riders behind the next move.
              </p>
              <Link
                href="/apply"
                className={styles.primaryCta}
                data-track="home_final_apply"
              >
                Start the 2-minute application
                <span aria-hidden="true">↗</span>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <CoachingFooter expanded />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${SITE_ORIGIN}/#webpage`,
              url: SITE_ORIGIN,
              name: "Roadman Cycling | Cycling Coaching, Podcast & Training",
              description:
                "Personalised cycling coaching for serious amateur and masters cyclists, alongside the Roadman Podcast, training guides, free tools and cycling camps.",
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": ENTITY_IDS.organization },
              primaryImageOfPage: `${SITE_ORIGIN}/og-ndy.png`,
              publisher: { "@id": ENTITY_IDS.organization },
              inLanguage: "en",
              significantLink: [
                `${SITE_ORIGIN}/apply`,
                `${SITE_ORIGIN}/community/not-done-yet`,
                `${SITE_ORIGIN}/methodology`,
                `${SITE_ORIGIN}/proof`,
                `${SITE_ORIGIN}/plateau`,
                `${SITE_ORIGIN}/podcast`,
                `${SITE_ORIGIN}/blog`,
                `${SITE_ORIGIN}/tools`,
                `${SITE_ORIGIN}/training-camps`,
              ],
            },
            {
              "@type": "Service",
              "@id": `${SITE_ORIGIN}/#not-done-yet-coaching`,
              name: "Not Done Yet Personalised Cycling Coaching",
              description:
                "A personalised TrainingPeaks plan, weekly live coaching, integrated nutrition, strength and recovery guidance, and a private cycling community.",
              serviceType: "Online Cycling Coaching",
              provider: { "@id": ENTITY_IDS.organization },
              areaServed: "Worldwide",
              audience: {
                "@type": "Audience",
                audienceType: "Serious amateur and masters cyclists",
              },
              offers: {
                "@type": "Offer",
                price: "195",
                priceCurrency: "USD",
                url: `${SITE_ORIGIN}/apply`,
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@type": "FAQPage",
              "@id": `${SITE_ORIGIN}/#faq`,
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ],
        }}
      />
    </>
  );
}
