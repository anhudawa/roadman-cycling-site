import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { CoachingAssessment } from "./CoachingAssessment";

export const metadata: Metadata = {
  title: "Free Coaching Assessment $€” Are You Ready for a Cycling Coach?",
  description:
    "Answer 5 questions to find out if coaching would accelerate your cycling goals. Free, instant result, no commitment. Takes 60 seconds.",
  alternates: {
    canonical: "https://roadmancycling.com/assessment",
  },
  openGraph: {
    title: "Free Coaching Assessment $€” Are You Ready for a Cycling Coach?",
    description:
      "Answer 5 questions to find out if coaching would accelerate your cycling goals. Free, instant result.",
    type: "website",
    url: "https://roadmancycling.com/assessment",
  },
};

export default function AssessmentPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Free Coaching Assessment",
          description: "A 5-question diagnostic to determine if personalised cycling coaching would accelerate your goals.",
          url: "https://roadmancycling.com/assessment",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Coaching Assessment", item: "https://roadmancycling.com/assessment" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                FREE DIAGNOSTIC
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>ARE YOU READY FOR A COACH?</span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                5 questions. 60 seconds. Find out whether coaching would
                accelerate your cycling $€” or whether you should wait.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <CoachingAssessment />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
