import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { GLOSSARY_TERMS } from "@/lib/glossary";

// Common "what does X mean in cycling" questions, structured for the
// FAQPage rich result on the glossary index. Pulled from the highest-
// search-volume cycling-terminology queries so the page can rank for
// the question form, not just the term-name form.
const GLOSSARY_FAQS = [
  {
    question: "What is FTP in cycling?",
    answer:
      "FTP (Functional Threshold Power) is the highest average power, in watts, you can sustain for roughly an hour. It's the anchor metric for setting training zones and tracking fitness over time. A 20-minute test multiplied by 0.95 is the standard estimate; a ramp test or a real 60-minute effort gives a more reliable number.",
  },
  {
    question: "What does W/kg mean?",
    answer:
      "W/kg (watts per kilogram) is power-to-weight ratio: your sustained power divided by your body weight in kg. It's the single best predictor of climbing performance — a 70kg rider at 280W (4.0 W/kg) climbs faster than a 90kg rider at 320W (3.6 W/kg) on the same gradient. Race categories at the amateur level are roughly tracked by FTP-based W/kg.",
  },
  {
    question: "What is polarised training?",
    answer:
      "Polarised training distributes hard sessions and easy sessions at the extremes — roughly 80% of training time at low intensity (zone 1–2, conversational) and 20% at high intensity (zone 4–5, hard intervals), with very little time in the moderate middle. It's the dominant model in elite endurance sport and was popularised in cycling research by Professor Stephen Seiler.",
  },
  {
    question: "What is sweet spot training?",
    answer:
      "Sweet spot training targets 88–94% of FTP — hard enough to drive aerobic adaptations but recoverable enough to repeat several times a week. It produces fast fitness gains in time-crunched cyclists but, sustained year-round, can blunt high-end power and burn out the central nervous system. Best used in focused blocks, not as a default.",
  },
  {
    question: "What is VO2max in cycling?",
    answer:
      "VO2max is the maximum amount of oxygen your body can use during all-out exercise, measured in millilitres per kg per minute. It sets the ceiling for your cycling potential — you train below it daily, but VO2max intervals (3–8 minute efforts above FTP) are how you raise the ceiling itself.",
  },
  {
    question: "What is lactate threshold?",
    answer:
      "Lactate threshold is the intensity at which lactate starts accumulating in the blood faster than your body can clear it — usually within a few percent of FTP. It marks the boundary between sustainable and unsustainable efforts, and it's the metric labs measure to set training zones precisely.",
  },
  {
    question: "What is periodisation in cycling training?",
    answer:
      "Periodisation is the structured organisation of training into blocks with different goals — base (aerobic), build (intensity), peak (race-specific), and recovery. Each block develops a specific quality, then you stack them so peak fitness lands on race day, not mid-training. Without periodisation, every week looks the same and improvement plateaus.",
  },
  {
    question: "What is a peloton in cycling?",
    answer:
      "The peloton is the main group of riders in a road race — the pack. Riding in the peloton saves roughly 30% energy compared to riding alone at the same speed, thanks to drafting. But it's not just about energy saving: positioning within the peloton determines your exposure to crashes, your ability to respond to attacks, and whether you're sheltered from wind. Experienced riders sit in the front third — close enough to react, protected enough to conserve. Group rides simulate peloton dynamics on a smaller scale.",
  },
  {
    question: "What is a groupset on a road bike?",
    answer:
      "A groupset is the complete matched set of drivetrain and braking components on a road bike: shifters, derailleurs, crankset, cassette, chain, and brakes. The three major manufacturers are Shimano, SRAM, and Campagnolo, each offering a hierarchy of tiers — Shimano's runs from Claris at entry level through Tiagra, 105, Ultegra, up to Dura-Ace. The biggest decision is mechanical versus electronic shifting (Shimano Di2, SRAM AXS), which uses motors for more precise, consistent shifts. The honest truth: a well-maintained mid-range groupset like Shimano 105 performs brilliantly for most riders.",
  },
];

export const metadata: Metadata = {
  title: "Cycling Glossary — FTP, VO2max, Polarised, Sweet Spot & More",
  description:
    "150+ cycling performance terms defined by a coach, not a textbook. FTP, VO2max, polarised training, sweet spot, W/kg, peloton, groupset, time trial — with how to actually use them.",
  alternates: {
    canonical: "https://roadmancycling.com/glossary",
  },
};

export default function GlossaryPage() {
  // Sort terms alphabetically and group by first letter
  const sortedTerms = [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term));
  const grouped = new Map<string, typeof GLOSSARY_TERMS>();
  for (const term of sortedTerms) {
    const letter = /^[A-Za-z]/.test(term.term) ? term.term[0].toUpperCase() : '#';
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(term);
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Performance Glossary",
          description: "Key cycling performance terms defined for amateur and masters cyclists.",
          url: "https://roadmancycling.com/glossary",
        }}
      />
      {/* DefinedTermSet enumerates every term in the glossary as a
          first-class entity — gives Google + AI crawlers an explicit list
          of terms in this set so each /glossary/[slug] DefinedTerm can be
          linked back to a concrete parent set, not just a name string. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": "https://roadmancycling.com/glossary#termset",
          name: "Cycling Performance Glossary",
          description:
            "Cycling performance vocabulary — FTP, VO2max, polarised training, sweet spot, W/kg, periodisation, and more. Defined by a coach, not a textbook.",
          url: "https://roadmancycling.com/glossary",
          inLanguage: "en",
          publisher: { "@id": "https://roadmancycling.com/#organization" },
          hasDefinedTerm: GLOSSARY_TERMS.map((term) => ({
            "@type": "DefinedTerm",
            "@id": `https://roadmancycling.com/glossary/${term.slug}#term`,
            name: term.term,
            description: term.definition,
            url: `https://roadmancycling.com/glossary/${term.slug}`,
          })),
        }}
      />
      {/* FAQPage — pairs the term-name index above with the question form
          of the same vocabulary so the glossary ranks for both "FTP" and
          "what is FTP in cycling" style queries. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: GLOSSARY_FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Glossary", item: "https://roadmancycling.com/glossary" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                DEFINITIONS
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>GLOSSARY.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                {GLOSSARY_TERMS.length} cycling performance terms defined by a coach, not a textbook.
                Each one links to the guide that explains how to apply it.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {(['coaching', 'nutrition', 'community', 'recovery', 'strength'] as const).map(pillar => {
                  const count = GLOSSARY_TERMS.filter(t => t.pillar === pillar).length;
                  return count > 0 ? (
                    <span key={pillar} className="inline-flex items-center gap-1.5">
                      <Badge pillar={pillar} size="sm" />
                      <span className="text-foreground-subtle text-xs">{count}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            {/* A-Z letter navigation */}
            <nav aria-label="Alphabetical index" className="flex flex-wrap gap-1.5 justify-center mb-10">
              {alphabet.map(letter => {
                const hasTerms = grouped.has(letter);
                return hasTerms ? (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm font-heading text-off-white hover:text-coral hover:bg-white/[0.06] transition-colors"
                  >
                    {letter}
                  </a>
                ) : (
                  <span
                    key={letter}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm font-heading text-foreground-subtle/40"
                  >
                    {letter}
                  </span>
                );
              })}
            </nav>

            {/* Grouped terms */}
            {Array.from(grouped.entries()).map(([letter, terms]) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <p className="font-heading text-coral text-xs tracking-widest mb-4 mt-10 first:mt-0">
                  {letter}
                </p>
                <div className="space-y-4">
                  {terms.map((term, i) => (
                    <ScrollReveal key={term.slug} direction="up" delay={i * 0.03}>
                      <Link href={`/glossary/${term.slug}`} className="block group">
                        <Card className="p-6 transition-all group-hover:border-coral/30">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h2 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors">
                                  {term.term}
                                </h2>
                                <Badge pillar={term.pillar} size="sm" />
                              </div>
                              <p className="text-foreground-muted text-sm leading-relaxed">
                                {term.definition}
                              </p>
                            </div>
                            <span className="text-coral shrink-0 mt-1">→</span>
                          </div>
                        </Card>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            ))}
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                KNOW THE TERMS. WANT THE PLAN?
              </p>
              <p className="text-off-white font-heading text-xl mb-4">
                Coaching turns this knowledge into structured weekly training.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="glossary_index_apply"
              >
                Apply for Coaching →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
