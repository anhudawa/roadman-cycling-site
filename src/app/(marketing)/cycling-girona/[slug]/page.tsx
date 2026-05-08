import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import {
  GIRONA_ROUTE_LIST,
  getAllGironaRouteSlugs,
  getGironaRoute,
} from "@/lib/girona/routes";
import { CAMPS } from "@/lib/camps/camps";

const SITE = "https://roadmancycling.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllGironaRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getGironaRoute(slug);
  if (!route) return {};

  const url = `${SITE}/cycling-girona/${route.slug}`;
  return {
    title: `${route.seoTitle} | Roadman Cycling`,
    description: route.seoDescription,
    keywords: route.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: route.seoTitle,
      description: route.seoDescription,
      type: "article",
      url,
      images: [
        {
          url: `${SITE}${route.heroImage}`,
          alt: route.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: route.seoTitle,
      description: route.seoDescription,
    },
  };
}

export default async function GironaRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const route = getGironaRoute(slug);
  if (!route) notFound();

  const linkedCamp =
    route.campSlug === "gravel" ? CAMPS.gravel : CAMPS.road;
  const otherRoutes = GIRONA_ROUTE_LIST.filter((r) => r.slug !== route.slug);
  const url = `${SITE}/cycling-girona/${route.slug}`;

  return (
    <>
      {/* Place schema for the climb itself */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: route.name,
          alternateName: route.alternateNames,
          description: route.summary,
          url,
          image: `${SITE}${route.heroImage}`,
          geo: {
            "@type": "GeoCoordinates",
            latitude: route.geo.latitude,
            longitude: route.geo.longitude,
          },
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "Girona, Catalunya, Spain",
          },
        }}
      />
      {/* Article schema for the guide page itself */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: route.seoTitle,
          description: route.seoDescription,
          url,
          image: `${SITE}${route.heroImage}`,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntityOfPage: url,
          articleSection: "Cycling in Girona",
          about: {
            "@type": "Thing",
            name: route.name,
          },
          keywords: route.keywords.join(", "),
        }}
      />
      {/* Breadcrumb */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            {
              "@type": "ListItem",
              position: 2,
              name: "Cycling in Girona",
              item: `${SITE}/cycling-girona`,
            },
            { "@type": "ListItem", position: 3, name: route.name, item: url },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* HERO */}
        <Section
          background="deep-purple"
          grain
          className="!pt-36 !pb-14 md:!pt-44 md:!pb-20 relative"
        >
          <Container className="relative">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-coral text-[11px] md:text-sm tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                CYCLING IN GIRONA · ROUTE GUIDE
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2.5rem, 11vw, 5rem)" }}
              >
                {route.name.toUpperCase()}
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 leading-relaxed font-light text-center"
                style={{
                  fontSize: "clamp(1.0625rem, 1.5vw, 1.25rem)",
                  maxWidth: "680px",
                }}
              >
                {route.summary}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.04}>
              <div className="relative aspect-[16/10] md:aspect-[16/8] max-w-5xl mx-auto mb-8 md:mb-10 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <Image
                  src={route.heroImage}
                  alt={route.heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority
                />
              </div>
            </ScrollReveal>

            {/* STATS BAR */}
            <ScrollReveal direction="up" delay={0.05}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-white/10 max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10">
                {[
                  { label: "Surface", value: route.surface },
                  { label: "Climb length", value: route.climbLength },
                  { label: "Avg gradient", value: route.averageGradient },
                  { label: "Max gradient", value: route.maxGradient },
                  { label: "Loop distance", value: route.distance },
                  { label: "Loop elevation", value: route.elevation },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-deep-purple px-4 py-4 md:py-5 text-center"
                  >
                    <p className="font-heading text-coral text-[10px] tracking-[0.25em] uppercase mb-1.5 md:mb-2">
                      {stat.label}
                    </p>
                    <p className="text-off-white text-sm md:text-base font-light leading-tight">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* WHY IT MATTERS */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                WHY THIS CLIMB
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)" }}
              >
                THE PRO ROAD MOST AMATEURS NEVER FIND.
              </h2>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg">
                {route.whyItMatters}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* WHAT TO EXPECT */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                WHAT TO EXPECT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-8 md:mb-10"
                style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)" }}
              >
                THE RIDE, START TO FINISH.
              </h2>
            </ScrollReveal>
            <ol className="space-y-5 md:space-y-6">
              {route.whatToExpect.map((line, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.04}>
                  <li className="flex gap-4 md:gap-5">
                    <span
                      className="font-heading text-coral text-2xl md:text-3xl shrink-0 leading-none pt-1"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-foreground-muted leading-relaxed text-[15px] md:text-base">
                      {line}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </Container>
        </Section>

        {/* PRACTICAL */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                PRACTICAL
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)" }}
              >
                HOW TO RIDE IT WELL.
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {[
                { title: "Where to start", body: route.whereToStart },
                { title: "Best time of day", body: route.bestTimeOfDay },
                { title: "Coffee stop", body: route.coffeeStop },
                { title: "Watch out for", body: route.watchOutFor },
              ].map((card, i) => (
                <ScrollReveal key={card.title} direction="up" delay={i * 0.05}>
                  <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7 backdrop-blur-sm">
                    <p className="font-heading text-coral text-[11px] tracking-[0.3em] uppercase mb-3">
                      {card.title}
                    </p>
                    <p className="text-foreground-muted text-[15px] md:text-base leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            {route.segmentNames && route.segmentNames.length > 0 && (
              <ScrollReveal direction="up" delay={0.2}>
                <p className="text-foreground-subtle text-xs md:text-sm text-center mt-8 max-w-2xl mx-auto leading-relaxed">
                  Strava segments to look up:{" "}
                  <span className="text-foreground-muted">
                    {route.segmentNames.join(" · ")}
                  </span>
                </p>
              </ScrollReveal>
            )}
          </Container>
        </Section>

        {/* CAMP CTA */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                RIDE IT WITH ROADMAN
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                style={{ fontSize: "clamp(1.875rem, 4vw, 2.75rem)" }}
              >
                {route.name.toUpperCase()} IS ON THE
                <br />
                <span className="text-coral">{linkedCamp.shortName.toUpperCase()} CAMP.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-8 max-w-md mx-auto text-[15px] md:text-base">
                {route.campDay
                  ? `${route.campDay}. Two pace groups, follow car the whole week, sixteen riders, Anthony in the group every day. €${linkedCamp.pricePerPerson}.`
                  : `Featured on the Roadman Girona ${linkedCamp.type} Camp. Two pace groups, follow car the whole week, sixteen riders, Anthony in the group every day. €${linkedCamp.pricePerPerson}.`}
              </p>
              <Link
                href={linkedCamp.href}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
              >
                See the {linkedCamp.shortName} camp →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* OTHER ROUTES */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                MORE GIRONA CLIMBS
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)" }}
              >
                THE REST OF THE PLAYBOOK.
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {otherRoutes.map((r, i) => (
                <ScrollReveal key={r.slug} direction="up" delay={i * 0.05}>
                  <Link
                    href={`/cycling-girona/${r.slug}`}
                    className="group block rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40 transition-all p-5 sm:p-6"
                  >
                    <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-2">
                      {r.surface} · {r.climbLength}
                    </p>
                    <h3 className="font-heading text-off-white text-xl md:text-2xl leading-tight mb-3 group-hover:text-coral transition-colors">
                      {r.name.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-[14px] leading-relaxed line-clamp-3">
                      {r.summary}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
              <ScrollReveal direction="up" delay={otherRoutes.length * 0.05}>
                <Link
                  href="/cycling-girona"
                  className="group h-full flex flex-col justify-center rounded-xl border border-coral/40 bg-coral/[0.05] hover:bg-coral/[0.1] transition-all p-5 sm:p-6"
                >
                  <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-2">
                    THE FULL GUIDE
                  </p>
                  <h3 className="font-heading text-off-white text-xl md:text-2xl leading-tight mb-3 group-hover:text-coral transition-colors">
                    CYCLING IN GIRONA →
                  </h3>
                  <p className="text-foreground-muted text-[14px] leading-relaxed">
                    Routes, weather, where to ride, where to coffee, why the
                    pros moved here. The full Girona handbook.
                  </p>
                </Link>
              </ScrollReveal>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
