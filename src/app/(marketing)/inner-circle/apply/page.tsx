import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { InnerCircleApplicationForm } from "./InnerCircleApplicationForm";

export const metadata: Metadata = {
  title: "Apply for the Roadman Inner Circle — Premium 1:1 Cycling Coaching",
  description:
    "Apply for the Roadman Inner Circle. Premium 1:1 coaching across six pillars — training, nutrition, recovery, strength, community, and Performance Health. Daily session feedback. Quarterly bloods. $525 / month.",
  alternates: {
    canonical: "https://roadmancycling.com/inner-circle/apply",
  },
  openGraph: {
    title: "Apply for the Roadman Inner Circle",
    description:
      "Daily session review. Weekly written check-in. Monthly video review. Quarterly bloods. Limited intake. $525 / month.",
    type: "website",
    url: "https://roadmancycling.com/inner-circle/apply",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const expectations = [
  {
    n: "01",
    t: "We read every application",
    d: "Anthony reviews every Inner Circle application personally. No autoresponders, no boilerplate.",
  },
  {
    n: "02",
    t: "Reply within 48 hours",
    d: "If we think the fit is right, you'll get an onboarding questionnaire and a call invite. If it's not the right tier yet, we'll tell you that too.",
  },
  {
    n: "03",
    t: "Set up inside seven days",
    d: "Onboarding questionnaire, training history, recent bloods if you have them. TrainingPeaks, plan, and daily review go live the same week.",
  },
];

export default function InnerCircleApplyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Apply for the Roadman Inner Circle",
          url: "https://roadmancycling.com/inner-circle/apply",
          description:
            "Application form for the Roadman Inner Circle — premium 1:1 cycling coaching at $525 / month. Limited intake.",
          isPartOf: { "@id": "https://roadmancycling.com#website" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Inner Circle", item: "https://roadmancycling.com/inner-circle" },
            { "@type": "ListItem", position: 3, name: "Apply", item: "https://roadmancycling.com/inner-circle/apply" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* ===========================================================
            HERO — restrained, gold-accented, application-focused
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          className="!pt-36 !pb-20 md:!pt-44 md:!pb-28 relative"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 1100px 700px at 50% 20%, rgba(76,18,115,0.55) 0%, transparent 60%), radial-gradient(ellipse 700px 450px at 50% 100%, rgba(251,191,36,0.08) 0%, transparent 70%)",
            }}
          />
          <Container width="narrow" className="relative text-center">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-amber-300 text-xs md:text-sm tracking-[0.4em] mb-7">
                ★ THE INNER CIRCLE &middot; APPLICATION
              </p>
              <h1
                className="font-heading text-off-white leading-[1.0] mb-8"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.25rem)" }}
              >
                APPLY FOR THE
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  INNER CIRCLE.
                </span>
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 leading-relaxed font-light"
                style={{ fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", maxWidth: "620px" }}
              >
                Eight short questions. Anthony reads every application personally
                and writes back within 48 hours. No autoresponders. No
                boilerplate.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-foreground-subtle text-xs md:text-sm tracking-[0.25em] uppercase">
                <span className="text-amber-200">$525 / month</span>
                <span aria-hidden className="text-amber-300/40">&bull;</span>
                <span>Limited intake</span>
                <span aria-hidden className="text-amber-300/40">&bull;</span>
                <span>Cancel any time</span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ===========================================================
            WHAT HAPPENS NEXT — sets expectations before the form
            =========================================================== */}
        <Section background="charcoal" className="!py-16 md:!py-20">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-foreground-subtle text-xs tracking-[0.4em] text-center mb-8">
                WHAT HAPPENS AFTER YOU SUBMIT
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {expectations.map((e, i) => (
                <ScrollReveal key={e.n} direction="up" delay={i * 0.06}>
                  <div className="relative h-full rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
                    <div
                      aria-hidden
                      className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
                    />
                    <p className="font-heading text-amber-300 text-xs tracking-[0.3em] mb-3">
                      STEP {e.n}
                    </p>
                    <h3 className="font-heading text-off-white text-base tracking-wide leading-snug mb-2">
                      {e.t.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-[14px] leading-relaxed font-light">
                      {e.d}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ===========================================================
            APPLICATION FORM — gold border, premium card
            =========================================================== */}
        <Section
          background="deep-purple"
          grain
          className="!py-20 md:!py-28 relative"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 700px 500px at 50% 50%, rgba(251,191,36,0.07) 0%, transparent 70%)",
            }}
          />
          <Container width="narrow" className="relative">
            <ScrollReveal direction="up">
              <div
                className="relative rounded-2xl p-[1px] bg-gradient-to-b from-amber-300/40 via-amber-300/10 to-amber-500/30"
                style={{ boxShadow: "0 30px 80px -30px rgba(251,191,36,0.18)" }}
              >
                <div className="rounded-2xl bg-gradient-to-b from-[#1a0535]/95 via-[#150128]/95 to-[#1a0535]/95 backdrop-blur-sm p-6 sm:p-10 md:p-14">
                  <InnerCircleApplicationForm />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.05}>
              <p className="text-foreground-subtle text-xs text-center mt-8 max-w-md mx-auto leading-relaxed">
                Your application goes straight to Anthony. We don&apos;t share
                applications outside the Roadman coaching team.
              </p>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
