import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Badge, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { PlateauDiagnostic } from "@/components/features/persona/PlateauDiagnostic";
import { EventDiagnostic } from "@/components/features/persona/EventDiagnostic";
import {
  getPersona,
  getAllPersonaSlugs,
  type PersonaContent,
} from "@/lib/personas";
import {
  getHeroTestimonial,
  getTestimonialsForPersona,
} from "@/lib/testimonials";
import { getPostBySlug } from "@/lib/blog";
import { getEpisodeBySlug } from "@/lib/podcast";

export function generateStaticParams() {
  return getAllPersonaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const persona = getPersona(slug);
  if (!persona) return { title: "Find Your Starting Point" };

  return {
    title: persona.metaTitle,
    description: persona.metaDescription,
    alternates: {
      canonical: `https://roadmancycling.com/you/${slug}`,
    },
    openGraph: {
      title: persona.metaTitle,
      description: persona.metaDescription,
      type: "website",
      url: `https://roadmancycling.com/you/${slug}`,
    },
  };
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const persona = getPersona(slug);
  if (!persona) notFound();

  // Resolve curated content bundles — posts and episodes that
  // actually exist on disk, skipping anything that doesn't.
  const posts = persona.blogSlugs
    .map((s) => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== null);
  const episodes = persona.podcastSlugs
    .map((s) => getEpisodeBySlug(s))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // Hero testimonial = the one-with-stat that matches this persona,
  // pulled from the central library. Extra testimonials below feed
  // the social proof wall further down the page.
  const heroTestimonial = getHeroTestimonial(persona.slug);
  const wallTestimonials = getTestimonialsForPersona(persona.slug, 6).filter(
    (t) => t.name !== heroTestimonial.name,
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: persona.metaTitle,
          description: persona.metaDescription,
          url: `https://roadmancycling.com/you/${slug}`,
          isPartOf: { "@id": ENTITY_IDS.website },
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".persona-subhead"],
          },
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
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Find Your Starting Point",
              item: `https://roadmancycling.com/you/${slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero — recognition statement, not a value prop */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                {persona.kicker}
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-none"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {persona.headline}
              </h1>
              <p className="persona-subhead text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {persona.subheading}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Hero testimonial — single punchy quote with stat pull-out */}
        <Section background="charcoal" className="!py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-deep-purple/50 px-6 py-7 md:px-10 md:py-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-4 text-center">
                  SOMEONE LIKE YOU
                </p>
                <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                  {heroTestimonial.stat && (
                    <div className="shrink-0 text-center md:text-left md:border-r md:border-white/10 md:pr-7">
                      <p
                        className="font-heading text-coral leading-none"
                        style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                      >
                        {heroTestimonial.stat}
                      </p>
                      {heroTestimonial.statLabel && (
                        <p className="text-xs font-body tracking-widest text-foreground-subtle uppercase mt-1">
                          {heroTestimonial.statLabel}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-off-white italic text-base md:text-lg leading-relaxed mb-4">
                      &ldquo;{heroTestimonial.quote}&rdquo;
                    </p>
                    <p className="text-foreground-subtle text-sm">
                      <span className="text-off-white font-medium">
                        {heroTestimonial.name}
                      </span>
                      <span className="mx-2">&middot;</span>
                      {heroTestimonial.detail}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Diagnostic (Tom + Mark only) */}
        {persona.hasDiagnostic && (
          <Section background="charcoal" className="!pt-0 !pb-16">
            <Container width="narrow">
              <ScrollReveal direction="up">
                {slug === "plateau" ? <PlateauDiagnostic /> : null}
                {slug === "event" ? <EventDiagnostic /> : null}
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Featured YouTube — the anchor conversation */}
        <Section background="charcoal" className="!pt-0">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3 text-center">
                THE CONVERSATION THAT MATTERS MOST
              </p>
              <h2
                className="font-heading text-off-white text-center mb-2"
                style={{ fontSize: "var(--text-section)" }}
              >
                {persona.featuredYoutube.title.toUpperCase()}
              </h2>
              <p className="text-foreground-muted text-sm text-center mb-8">
                With {persona.featuredYoutube.guest} &middot;{" "}
                {persona.featuredYoutube.duration}
              </p>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-background-elevated shadow-2xl">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${persona.featuredYoutube.id}`}
                  title={persona.featuredYoutube.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Curated content bundle — blogs + podcasts */}
        {(posts.length > 0 || episodes.length > 0) && (
          <Section background="deep-purple" grain>
            <Container>
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  THE ESSENTIAL READING
                </p>
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  START WITH THESE.
                </h2>
              </ScrollReveal>

              {/* Blog posts */}
              {posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                  {posts.map((post, i) => (
                    <ScrollReveal
                      key={post.slug}
                      direction="up"
                      delay={i * 0.08}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="
                          block h-full bg-background-elevated rounded-lg
                          border border-white/5 overflow-hidden group
                          hover:border-coral/30 hover:-translate-y-0.5
                          hover:shadow-[var(--shadow-card)]
                          transition-all
                        "
                      >
                        {post.featuredImage && (
                          <div className="aspect-[16/9] relative bg-gradient-to-br from-deep-purple to-charcoal overflow-hidden">
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge pillar={post.pillar} size="sm" />
                            <span className="text-xs text-foreground-subtle">
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="font-heading text-base text-off-white leading-tight group-hover:text-coral transition-colors">
                            {post.title.toUpperCase()}
                          </h3>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {/* Podcast episodes */}
              {episodes.length > 0 && (
                <div>
                  <p className="font-heading text-coral text-xs tracking-widest mb-4">
                    AND THESE CONVERSATIONS
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {episodes.map((ep, i) => (
                      <ScrollReveal
                        key={ep.slug}
                        direction="up"
                        delay={i * 0.08}
                      >
                        <Link
                          href={`/podcast/${ep.slug}`}
                          className="
                            flex items-start gap-4 p-4 md:p-5
                            rounded-lg bg-white/5 border border-white/10
                            hover:bg-white/10 hover:border-coral/30
                            transition-colors group
                          "
                        >
                          {ep.youtubeId && (
                            <div className="relative w-28 aspect-video rounded overflow-hidden bg-black shrink-0">
                              <Image
                                src={`https://i.ytimg.com/vi/${ep.youtubeId}/mqdefault.jpg`}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="112px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-off-white leading-tight mb-1 group-hover:text-coral transition-colors">
                              {ep.title.toUpperCase()}
                            </p>
                            <p className="text-xs text-foreground-subtle">
                              {ep.duration}
                              {ep.guest && ` · with ${ep.guest}`}
                            </p>
                          </div>
                        </Link>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* Mid-page coaching CTA — closes the reading-distance gap between
            the content bundle and the testimonial wall. Plateau and event
            get a diagnostic-gated soft CTA higher up; comeback and listener
            have no /apply touchpoint between hero and end-of-page without
            this block. One persona-specific line, one coral button. */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-xl border border-coral/25 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-deep-purple/50 px-6 py-7 md:px-10 md:py-8 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  NOT DONE YET COACHING COMMUNITY
                </p>
                <p className="font-heading text-off-white text-xl md:text-2xl leading-tight mb-5">
                  {persona.ctaHeadline.toUpperCase()}
                </p>
                <Button href="/apply" size="md">
                  Apply &mdash; 7-Day Free Trial
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Testimonial wall — 6 more quotes tagged for this persona */}
        {wallTestimonials.length > 0 && (
          <Section background="charcoal" className="section-glow-coral">
            <Container>
              <ScrollReveal direction="up" className="text-center mb-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  MORE CYCLISTS LIKE YOU
                </p>
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHAT ACTUALLY HAPPENED FOR THEM.
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {wallTestimonials.map((t, i) => (
                  <ScrollReveal
                    key={t.name}
                    direction="up"
                    delay={i * 0.05}
                  >
                    <div className="h-full flex flex-col rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-5 md:p-6">
                      {t.stat && (
                        <div className="inline-flex items-center self-start mb-3 gap-2 px-3 py-1 rounded-full bg-coral/10 border border-coral/20">
                          <span className="text-coral font-heading text-sm">
                            {t.stat}
                          </span>
                          {t.statLabel && (
                            <span className="text-coral/70 text-[10px] font-body tracking-widest uppercase">
                              {t.statLabel}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-off-white italic text-sm leading-relaxed mb-4 flex-1">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </p>
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-off-white font-medium text-sm">
                          {t.name}
                        </p>
                        <p className="text-foreground-subtle text-xs mt-0.5">
                          {t.detail}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Coaching CTA */}
        <Section background="charcoal" className="section-glow-coral">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <p className="font-heading text-coral text-sm tracking-widest mb-4">
                  WHEN LISTENING IS NO LONGER ENOUGH
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  {persona.ctaHeadline.toUpperCase()}
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  {persona.ctaBody}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button href="/apply" size="lg">
                    Apply — 7-Day Free Trial
                  </Button>
                  <Button href="/coaching" variant="ghost" size="lg">
                    How Coaching Works
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm mt-6">
                  $195/month &middot; 7-day free trial &middot; Cancel anytime
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Saturday Spin — soft fallback for the not-ready-to-apply visitor */}
        <EmailCapture
          variant="banner"
          heading="NOT READY TO APPLY? START WITH THE SATURDAY SPIN."
          subheading={persona.emailHook}
          source={`persona-${slug}`}
        />

        {/* Explore other personas */}
        <Section background="charcoal" className="!py-14">
          <Container width="narrow">
            <OtherPersonas currentSlug={slug} />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}

function OtherPersonas({ currentSlug }: { currentSlug: string }) {
  const others = getAllPersonaSlugs()
    .filter((s) => s !== currentSlug)
    .map((s) => getPersona(s))
    .filter((p): p is PersonaContent => p !== null);

  return (
    <div>
      <p className="font-heading text-coral text-xs tracking-widest mb-4 text-center">
        NOT QUITE YOU?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {others.map((p) => (
          <Link
            key={p.slug}
            href={`/you/${p.slug}`}
            className="
              block p-4 rounded-xl bg-white/[0.02]
              border border-white/5 hover:border-coral/30
              hover:bg-white/[0.05] transition-all text-left
            "
          >
            <p className="font-heading text-off-white text-sm leading-tight mb-1">
              {p.headline.replace(/\.$/, "").toUpperCase()}
            </p>
            <p className="text-foreground-subtle text-xs">
              See this path <span aria-hidden="true">&rarr;</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
