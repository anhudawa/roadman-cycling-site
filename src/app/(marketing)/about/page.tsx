import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About — Anthony Walsh & Roadman Cycling",
  description:
    "The story behind Roadman Cycling. How Anthony Walsh built a 100M+ download podcast and a community of serious cyclists who refuse to accept their best days are behind them.",
};

const expertNetwork = [
  { name: "Professor Stephen Seiler", role: "Exercise physiologist, polarised training pioneer" },
  { name: "Dan Lorang", role: "Coached Pogacar and Vingegaard" },
  { name: "Lachlan Morton", role: "EF Education pro, alt-racing pioneer" },
  { name: "Tim Kerrison", role: "Ex-Team Sky head of performance" },
  { name: "John Wakefield", role: "Bora-Hansgrohe coach" },
  { name: "Dr. David Dunne", role: "Sports science researcher" },
  { name: "Ben Healy", role: "Pro cyclist, Tour de France" },
  { name: "Michael Matthews", role: "15+ year pro, World Tour" },
  { name: "Joe Friel", role: "Legendary cycling coach, author" },
  { name: "Rosa Kloser", role: "European gravel champion" },
];

const milestones = [
  { year: "2016", event: "Roadman Cycling Podcast launches" },
  { year: "2019", event: "10 million podcast downloads" },
  { year: "2021", event: "50 million downloads, YouTube channel launches" },
  { year: "2023", event: "Free Clubhouse community created on Skool" },
  { year: "2024", event: "Not Done Yet paid community launches" },
  { year: "2025", event: "100 million podcast downloads" },
  { year: "2026", event: "New site, new era. We're just getting started." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Anthony Walsh",
          jobTitle: "Host, Roadman Cycling Podcast",
          url: "https://roadmancycling.com/about",
          worksFor: {
            "@type": "Organization",
            name: "Roadman Cycling",
          },
        }}
      />

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                RIDING THROUGH
              </h1>
              <p className="text-foreground-muted text-xl max-w-3xl mx-auto leading-relaxed">
                Riding through, always riding through, never sitting up, never
                coasting. Being smart, working hard, making an effort,
                contributing to the team. That&apos;s how we think about Roadman.
                That&apos;s how we think about life.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Anthony Photo */}
        <Section background="charcoal" className="!pb-0">
          <Container>
            <ScrollReveal direction="up">
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden">
                <Image
                  src="/images/about/anthony-walsh-podcast.jpg"
                  alt="Anthony Walsh recording the Roadman Cycling Podcast"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Anthony's Story */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE STORY
              </h2>
            </ScrollReveal>

            <div className="space-y-6 text-foreground-muted leading-relaxed">
              <ScrollReveal direction="up" delay={0.1}>
                <p>
                  Roadman Cycling started with a simple idea: what if the best
                  cycling knowledge in the world — the stuff that World Tour
                  coaches discuss behind closed doors — was available to everyone?
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.15}>
                <p>
                  Anthony Walsh didn&apos;t set out to build a media company. He
                  was a cyclist who wanted to get faster, and he started asking
                  questions. The right questions, to the right people. And those
                  people said yes.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <p>
                  Professor Stephen Seiler explained polarised training.
                  Dan Lorang shared what he taught Pogacar. Tim Kerrison
                  revealed the marginal gains philosophy behind Team Sky.
                  Lachlan Morton opened up about why the World Tour wasn&apos;t
                  enough.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.25}>
                <p>
                  100 million downloads later, Roadman Cycling isn&apos;t just a
                  podcast. It&apos;s a community of serious cyclists — professionals
                  with families, limited time, and genuine ambitions on the
                  bike — who refuse to accept that their best days are behind them.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-off-white font-medium text-lg">
                  We don&apos;t have all the answers. But we&apos;re going to ask all
                  the questions. We&apos;re not done yet. And neither are you.
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Timeline */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE TIMELINE
              </h2>
            </ScrollReveal>

            <div className="space-y-0">
              {milestones.map((m, i) => (
                <ScrollReveal key={m.year} direction="left" delay={i * 0.08}>
                  <div className="flex gap-6 items-start pb-8 relative">
                    {/* Line */}
                    {i < milestones.length - 1 && (
                      <div className="absolute left-[39px] top-8 bottom-0 w-px bg-white/10" />
                    )}
                    <div className="w-20 shrink-0 text-right">
                      <span className="font-heading text-2xl text-coral">
                        {m.year}
                      </span>
                    </div>
                    <div className="pt-1">
                      <p className="text-foreground-muted">{m.event}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Expert Network */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE EXPERT NETWORK
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12">
                The coaches, scientists, and athletes who have shaped Roadman
                Cycling through hundreds of conversations.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertNetwork.map((expert, i) => (
                <ScrollReveal key={expert.name} direction="up" delay={i * 0.05}>
                  <Card className="p-5" hoverable={false}>
                    <p className="font-heading text-lg text-off-white mb-1">
                      {expert.name.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {expert.role}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Team */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE TEAM
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { name: "Anthony Walsh", role: "Host & Content" },
                { name: "Sarah", role: "Operations & Community" },
                { name: "Sinead", role: "Support" },
                { name: "Wes", role: "Support" },
              ].map((member, i) => (
                <ScrollReveal key={member.name} direction="up" delay={i * 0.1}>
                  <div className="w-20 h-20 rounded-full bg-purple/30 border border-purple/40 mx-auto mb-3 flex items-center justify-center">
                    <span className="font-heading text-xl text-off-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <p className="font-heading text-lg text-off-white">
                    {member.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-muted">{member.role}</p>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <Button href="/community/clubhouse" size="lg">
                Join the Community
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
