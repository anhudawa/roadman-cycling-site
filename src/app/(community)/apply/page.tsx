import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoachingFooter } from "@/components/layout/CoachingFooter";
import { CoachingHeader } from "@/components/layout/CoachingHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { CASE_STUDIES } from "@/lib/case-studies";
import { TESTIMONIALS } from "@/lib/testimonials";
import type { StoredSubmission } from "@/lib/diagnostic/store";
import { CohortApplicationForm } from "./CohortApplicationForm";
import { PersonalisedDiagnosticBlock } from "./PersonalisedDiagnosticBlock";
import styles from "./ApplyPage.module.css";

const title = "Apply for Not Done Yet Cycling Coaching";
const description =
  "Apply for a personalised plan reviewed weekly by the Roadman coaching team, plus live group coaching led by Anthony Walsh. $195 USD/month, first 7 days free.";

export const APPLY_METADATA: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_ORIGIN}/apply`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${SITE_ORIGIN}/apply`,
    images: [
      {
        url: `${SITE_ORIGIN}/og-ndy.png`,
        width: 1200,
        height: 630,
        alt: "Not Done Yet cycling coaching by Roadman Cycling",
      },
    ],
  },
};

export const metadata = APPLY_METADATA;

const featuredNames = [
  "Damien Maloney",
  "Daniel Stone",
  "Brian Morrissey",
] as const;

const proof = featuredNames.map((name) => {
  const testimonial = TESTIMONIALS.find((item) => item.name === name);
  const caseStudy = CASE_STUDIES.find(
    (item) => item.testimonialName === name,
  );

  return {
    name,
    detail: testimonial?.detail ?? "",
    quote: testimonial?.shortQuote ?? testimonial?.quote ?? "",
    stat: testimonial?.stat ?? "",
    label: testimonial?.statLabel ?? "",
    href: caseStudy ? `/case-studies/${caseStudy.slug}` : "/case-studies",
  };
});

const delivery = [
  {
    number: "01",
    title: "Your plan",
    body: "A personalised TrainingPeaks plan, reviewed every week.",
  },
  {
    number: "02",
    title: "Your coaching",
    body: "Weekly live group coaching with Anthony — recordings included.",
  },
  {
    number: "03",
    title: "Your adjustments",
    body: "Individual plan changes when training, recovery or life changes.",
  },
  {
    number: "04",
    title: "Your full system",
    body: "Nutrition and strength guidance matched to your training.",
  },
  {
    number: "05",
    title: "Your people",
    body: "A private Not Done Yet community of serious amateur riders.",
  },
];

const questions = [
  {
    q: "How personal is the coaching?",
    a: "Your individual TrainingPeaks plan is reviewed every week by the Roadman coaching team. Anthony leads the live group coaching call, with recordings included, and your plan is adjusted individually when training, recovery or life changes. This is personalised programming with group coaching and community — not generic training content.",
  },
  {
    q: "How much time do I need?",
    a: "Most Not Done Yet riders train 6–12 hours a week. The plan is built around the hours you genuinely have, so work and family constraints are part of the programme rather than treated as a failure.",
  },
  {
    q: "What happens after I apply?",
    a: "Anthony reviews every application personally and replies within 48 hours. If the coaching fits, you'll receive the next steps to begin your first seven days. No credit card is needed to apply.",
  },
  {
    q: "What does it cost?",
    a: "$195 USD per month. Your first seven days are free, then the membership continues month to month. You can cancel anytime.",
  },
  {
    q: "Is this right for a newer cyclist?",
    a: "It can be once you are riding consistently and have a measurable goal. It is not designed for someone starting from zero. The application helps us check whether the coaching is the right next move for your current experience, constraints and ambition.",
  },
];

export default function ApplyPage() {
  return <ApplyPageView submission={null} />;
}

export function ApplyPageView({
  submission,
}: {
  submission: StoredSubmission | null;
}) {
  const personalised = submission !== null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${SITE_ORIGIN}/#not-done-yet-coaching`,
          name: "Not Done Yet Cycling Coaching",
          description:
            "Personalised TrainingPeaks programming, weekly group coaching with Anthony Walsh, individual plan adjustments, nutrition and strength guidance, and a private rider community.",
          serviceType: "Online Cycling Coaching",
          provider: { "@id": ENTITY_IDS.organization },
          offers: {
            "@type": "Offer",
            price: "195",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          url: `${SITE_ORIGIN}/apply`,
        }}
      />
      <JsonLd
        data={{
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
              name: "Apply",
              item: `${SITE_ORIGIN}/apply`,
            },
          ],
        }}
      />
      {!personalised && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: questions.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }}
        />
      )}

      <CoachingHeader
        applicationContext={personalised ? "diagnostic" : "form"}
      />

      <main id="main-content" className={styles.page}>
        {personalised && submission ? (
          <PersonalisedDiagnosticBlock submission={submission} />
        ) : (
          <>
            <section className={styles.hero}>
              <div className={styles.heroGlow} aria-hidden="true" />
              <div className={styles.heroGrid}>
                <div className={styles.heroCopy}>
                  <p className={styles.status}>
                    <span aria-hidden="true" />
                    APPLICATIONS OPEN · REVIEWED PERSONALLY
                  </p>
                  <p className={styles.kicker}>NOT DONE YET COACHING</p>
                  <h1>
                    YOUR NEXT BEST SEASON
                    <span> STARTS HERE.</span>
                  </h1>
                  <p className={styles.heroLead}>
                    A personalised TrainingPeaks plan reviewed weekly by the
                    Roadman coaching team, live group coaching led by Anthony,
                    and one connected system for training, nutrition, strength
                    and recovery.
                  </p>

                  <div className={styles.offerLine}>
                    <strong>$195 USD / MONTH</strong>
                    <span>FIRST 7 DAYS FREE</span>
                    <span>CANCEL ANYTIME</span>
                  </div>

                  <a
                    href="#application-form"
                    className={styles.heroCta}
                    data-track="apply_hero_start"
                  >
                    START THE 2-MINUTE APPLICATION
                    <span aria-hidden="true">↓</span>
                  </a>

                  <div className={styles.heroProof} aria-label="Member outcomes">
                    {proof.map((result) => (
                      <div key={result.name}>
                        <strong>{result.stat}</strong>
                        <span>{result.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formShell} id="application-form">
                  <div className={styles.formHeading}>
                    <p>2-MINUTE APPLICATION</p>
                    <h2>TELL US WHERE YOU&apos;RE STUCK.</h2>
                    <span>
                      Four quick questions. No credit card. Anthony replies
                      within 48 hours.
                    </span>
                  </div>
                  <CohortApplicationForm />
                  <p className={styles.formPrivacy}>
                    Your application goes straight to Anthony. No spam. Just a
                    personal reply about whether the coaching fits. An unfinished
                    draft stays on this device for up to 24 hours.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.proofSection} aria-labelledby="proof-heading">
              <div className={styles.sectionFrame}>
                <div className={styles.proofIntro}>
                  <p className={styles.sectionKicker}>MEASURED MEMBER OUTCOMES</p>
                  <h2 id="proof-heading">
                    THE WORK SHOWS UP
                    <br />
                    <span>IN THE DATA.</span>
                  </h2>
                </div>

                <div className={styles.proofGrid}>
                  {proof.map((result) => (
                    <Link
                      href={result.href}
                      className={styles.proofCard}
                      key={result.name}
                      data-track={`apply_case_study_${result.name
                        .toLowerCase()
                        .replaceAll(" ", "_")}`}
                    >
                      <div className={styles.proofMetric}>
                        <strong>{result.stat}</strong>
                        <span>{result.label}</span>
                      </div>
                      <blockquote>“{result.quote}”</blockquote>
                      <footer>
                        <strong>{result.name}</strong>
                        <span>{result.detail}</span>
                      </footer>
                      <p>READ THE CASE STUDY →</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.deliverySection} aria-labelledby="delivery-heading">
              <div className={styles.sectionFrame}>
                <div className={styles.deliveryIntro}>
                  <div>
                    <p className={styles.sectionKicker}>WHAT YOU ACTUALLY GET</p>
                    <h2 id="delivery-heading">
                      PERSONAL ENOUGH TO CHANGE.
                      <span> STRUCTURED ENOUGH TO LAST.</span>
                    </h2>
                  </div>
                  <p>
                    No template library. No disconnected advice. Your training,
                    recovery, nutrition and strength move together, with a
                    coach reviewing the signal every week.
                  </p>
                </div>

                <ol className={styles.deliveryList}>
                  {delivery.map((item) => (
                    <li key={item.number}>
                      <span>{item.number}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className={styles.offerCard}>
                  <div>
                    <p>NOT DONE YET COACHING</p>
                    <strong>$195</strong>
                    <span>USD / MONTH</span>
                  </div>
                  <ul>
                    <li>First 7 days free</li>
                    <li>6–12 hours a week works for most riders</li>
                    <li>Month to month · cancel anytime</li>
                  </ul>
                  <a
                    href="#application-form"
                    data-track="apply_offer_return_to_form"
                  >
                    START APPLICATION <span aria-hidden="true">↑</span>
                  </a>
                </div>
              </div>
            </section>

            <section className={styles.coachSection} aria-labelledby="coach-heading">
              <div className={styles.coachGrid}>
                <div className={styles.coachImage}>
                  <Image
                    src="/images/about/anthony-walsh-podcast-home.avif"
                    alt="Anthony Walsh, founder and cycling coach at Roadman Cycling"
                    fill
                    sizes="(max-width: 899px) 100vw, 50vw"
                  />
                </div>
                <div className={styles.coachCopy}>
                  <p className={styles.sectionKicker}>THE COACH BEHIND THE SYSTEM</p>
                  <h2 id="coach-heading">
                    REVIEWED BY A PERSON.
                    <span> NOT A PLATFORM.</span>
                  </h2>
                  <p>
                    Anthony Walsh has spent more than a decade coaching riders
                    and 1,400+ podcast conversations learning from the best
                    minds in endurance sport. Your application and your weekly
                    training signal get human attention.
                  </p>
                  <blockquote>
                    “The goal is not to squeeze training into the edges of your
                    life. It is to build the smartest plan your real life can
                    absorb.”
                  </blockquote>
                  <Link href="/about" data-track="apply_about_anthony">
                    MEET ANTHONY →
                  </Link>
                </div>
              </div>
            </section>

            <section className={styles.faqSection} aria-labelledby="faq-heading">
              <div className={styles.faqGrid}>
                <div className={styles.faqIntro}>
                  <p className={styles.sectionKicker}>BEFORE YOU APPLY</p>
                  <h2 id="faq-heading">
                    STRAIGHT
                    <br />
                    ANSWERS.
                  </h2>
                  <p>
                    No manufactured urgency. No hidden contract. Decide with
                    the full picture.
                  </p>
                  <a
                    href="#application-form"
                    data-track="apply_faq_return_to_form"
                  >
                    START THE APPLICATION ↑
                  </a>
                </div>

                <div className={styles.questions}>
                  {questions.map((item, index) => (
                    <details key={item.q} open={index === 0}>
                      <summary>
                        <span className={styles.questionIndex}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.questionText}>{item.q}</span>
                        <span className={styles.faqIcon} aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <CoachingFooter />
    </>
  );
}
