import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { FitFinder } from "./_components/FitFinder";

/**
 * /find-your-fit — interactive five-question router that points
 * riders at the right Roadman product:
 *   • Free Clubhouse
 *   • Not Done Yet ($195/month)
 *   • Roadman Inner Circle 1:1 Coaching ($525/month, application only)
 *
 * Goal: cut the "which one is for me?" ambiguity that quietly kills
 * conversions across the funnel. Quiz lives client-side, fires a
 * Meta Pixel `Lead` on result, and routes straight into the matched
 * product page.
 */

export const metadata: Metadata = {
  title: "Find Your Fit — Which Roadman Option Suits How You Train",
  description:
    "Five questions. Two minutes. One specific recommendation — free Clubhouse, Not Done Yet group coaching, or Roadman Inner Circle 1:1 coaching.",
  alternates: {
    canonical: `${SITE_ORIGIN}/find-your-fit`,
  },
  openGraph: {
    title: "Find Your Fit — Which Roadman Option Suits How You Train",
    description:
      "Five questions, one clear recommendation: free Clubhouse, Not Done Yet group coaching, or Roadman Inner Circle 1:1 coaching.",
    type: "website",
    url: `${SITE_ORIGIN}/find-your-fit`,
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" },
    ],
  },
  robots: { index: true, follow: true },
};

const FAQ = [
  {
    q: "How does this work?",
    a: "Five short questions about your goal, time, frustration, learning style, and budget. We score the answers against the four Roadman options and recommend the one that fits where you actually are.",
  },
  {
    q: "Will the recommendation push me toward the most expensive option?",
    a: "No. Your investment answer acts as a real cap — if you tell us free is right for now, you'll get pointed at the Clubhouse, even if the rest of your answers would have scored higher.",
  },
  {
    q: "What if more than one option could fit?",
    a: "That's normal. Pick the answer closest to the truth at each step. You can also tweak your answers from the result screen, or click 'See all options' to compare side by side.",
  },
  {
    q: "How long does it take?",
    a: "Two to three minutes if you don't overthink it.",
  },
];

export default function FindYourFitPage() {
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
        name: "Find Your Fit",
        item: `${SITE_ORIGIN}/find-your-fit`,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_ORIGIN}/find-your-fit#webpage`,
    url: `${SITE_ORIGIN}/find-your-fit`,
    name: "Which Roadman Option Fits You?",
    description:
      "Five-question interactive quiz that recommends the right Roadman product: Free Clubhouse, Not Done Yet group coaching, or Roadman Inner Circle 1:1 coaching.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    inLanguage: "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/og-image.jpg`,
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

      <main>
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="text-center pt-6">
              <p className="font-heading tracking-[0.3em] uppercase text-coral text-sm">
                Find Your Fit
              </p>
              <h1 className="mt-4 font-heading text-off-white uppercase leading-[0.95] text-5xl md:text-6xl lg:text-7xl">
                Which Roadman option fits&nbsp;you?
              </h1>
              <p className="mt-6 text-foreground-muted text-lg md:text-xl leading-relaxed">
                Five questions. Two minutes. One specific answer for which
                Roadman product matches how you actually train. No fluff, no
                upsell push — your budget is a real cap, not a starting
                point.
              </p>
            </div>
          </Container>

          <Container width="narrow" className="mt-12">
            <FitFinder />
          </Container>

          <Container width="narrow" className="mt-12">
            <div className="text-center text-foreground-subtle text-sm">
              Already know the room you want?{" "}
              <Link
                href="/community"
                className="text-coral hover:text-coral-hover underline underline-offset-4"
              >
                Compare every option
              </Link>
              .
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <h2 className="font-heading text-off-white uppercase text-3xl md:text-4xl">
              Common questions
            </h2>
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group py-5"
                >
                  <summary className="cursor-pointer flex items-center justify-between gap-4 font-heading tracking-wide uppercase text-off-white text-lg list-none">
                    <span>{f.q}</span>
                    <span className="text-coral transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-foreground-muted leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
