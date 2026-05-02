import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { mdxComponents } from "@/components/mdx/MDXComponents";

import {
  ENTITY_IDS,
  PODCAST,
  SITE_ORIGIN,
} from "@/lib/brand-facts";
import {
  getAllEntitySlugs,
  getEntityBySlug,
  type ExpertEntityFull,
} from "@/lib/entities";
import { getGuestBySlug } from "@/lib/guests";
import { getPostBySlug } from "@/lib/blog";

/**
 * Expert-network entity pages.
 *
 * The brand/org entities (anthony-walsh, roadman-cycling, ...) live as
 * sibling static `page.tsx` folders under `/entity/`. Static segments
 * win over `[slug]` in Next.js App Router so this dynamic route only
 * fires for slugs that don't have a hand-written page — which is
 * exactly the expert network (Seiler, Lorang, Wakefield, ...).
 *
 * Each expert entity is rendered as a Person ProfilePage with full
 * Person JSON-LD: jobTitle, worksFor, sameAs, knowsAbout, plus a
 * `subjectOf` array linking to their podcast appearances. The visible
 * page mirrors the schema — short bio, credential card, "why their
 * work matters" prose, key positions, podcast appearances, related
 * articles — so anything Google or an LLM pulls from JSON-LD also
 * appears on the page they can quote from.
 */

const TOPIC_TITLES: Record<string, string> = {
  "ftp-training": "FTP Training",
  "cycling-nutrition": "Cycling Nutrition",
  "cycling-training-plans": "Training Plans",
  "cycling-recovery": "Recovery",
  "cycling-strength-conditioning": "Strength & Conditioning",
  "cycling-weight-loss": "Cycling & Weight Loss",
  "cycling-beginners": "Getting Into Cycling",
  "triathlon-cycling": "Triathlon Cycling",
  "mountain-biking": "Mountain Biking",
  "cycling-coaching": "Cycling Coaching",
};

export async function generateStaticParams() {
  return getAllEntitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = getEntityBySlug(slug);
  if (!entity) return { title: "Entity Not Found" };

  const url = `${SITE_ORIGIN}/entity/${slug}`;
  return {
    title: `${entity.name} — ${entity.jobTitle}`,
    description: entity.shortBio,
    alternates: { canonical: url },
    openGraph: {
      title: `${entity.name} — ${entity.jobTitle}`,
      description: entity.shortBio,
      type: "profile",
      url,
    },
  };
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entity = getEntityBySlug(slug);
  if (!entity) notFound();

  return <EntityPageContent slug={slug} entity={entity} />;
}

function EntityPageContent({
  slug,
  entity,
}: {
  slug: string;
  entity: ExpertEntityFull;
}) {
  const url = `${SITE_ORIGIN}/entity/${slug}`;

  // Resolve guest data when this expert has a matching /guests/[slug]
  // page. We use it to fill in subjectOf episodes for Person schema and
  // to render the on-page "On the Roadman Podcast" list with real
  // episode titles + dates rather than a static "appearances" count.
  const guest = entity.guestSlug ? getGuestBySlug(entity.guestSlug) : null;
  const sortedEpisodes = guest
    ? [...guest.episodes].sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      )
    : [];

  // Resolve curated `relatedArticles` slugs into real blog post entries
  // — silently drops any slugs that don't match a current MDX file so
  // a broken slug never crashes the page.
  const relatedPosts = (entity.relatedArticles ?? [])
    .map((s) => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const relatedHubs = (entity.relatedTopicHubs ?? []).filter(
    (s) => TOPIC_TITLES[s] !== undefined,
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `${entity.name} — Entity & Roadman Cycling`,
          url,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": `${url}#person` },
          about: { "@id": `${url}#person` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${url}#person`,
          name: entity.name,
          jobTitle: entity.jobTitle,
          description: entity.shortBio,
          url,
          mainEntityOfPage: url,
          ...(entity.image && { image: entity.image }),
          ...(entity.location && {
            homeLocation: { "@type": "Place", name: entity.location },
          }),
          ...(entity.worksFor && {
            worksFor: {
              "@type": entity.worksFor.type,
              name: entity.worksFor.name,
              ...(entity.worksFor.url && { url: entity.worksFor.url }),
            },
            memberOf: {
              "@type": entity.worksFor.type,
              name: entity.worksFor.name,
              ...(entity.worksFor.url && { url: entity.worksFor.url }),
            },
          }),
          ...(entity.sameAs &&
            entity.sameAs.length > 0 && { sameAs: entity.sameAs }),
          knowsAbout: entity.knowsAbout,
          // subjectOf — every podcast episode this person appears in. AI
          // engines treat this as the strongest signal that "X appeared on
          // the Roadman Podcast on Y date discussing Z."
          ...(sortedEpisodes.length > 0 && {
            subjectOf: sortedEpisodes.slice(0, 8).map((ep) => ({
              "@type": "PodcastEpisode",
              "@id": `${SITE_ORIGIN}/podcast/${ep.slug}#episode`,
              name: ep.title,
              url: `${SITE_ORIGIN}/podcast/${ep.slug}`,
              datePublished: ep.publishDate,
              partOfSeries: { "@id": ENTITY_IDS.podcast },
            })),
          }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            {
              "@type": "ListItem",
              position: 2,
              name: "Entities",
              item: `${SITE_ORIGIN}/entity/anthony-walsh`,
            },
            { "@type": "ListItem", position: 3, name: entity.name, item: url },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Experts", href: "/guests" },
                { label: entity.name },
              ]}
            />
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · PERSON
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {entity.name.toUpperCase()}
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {entity.shortBio}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                {entity.relationship}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Quick-fact cards */}
        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  CANONICAL NAME
                </p>
                <p className="font-heading text-off-white text-lg">{entity.name}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ROLE
                </p>
                <p className="text-off-white">{entity.jobTitle}</p>
              </Card>
              {entity.worksFor && (
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                    AFFILIATION
                  </p>
                  {entity.worksFor.url ? (
                    <a
                      href={entity.worksFor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-off-white hover:text-coral transition-colors"
                    >
                      {entity.worksFor.name}
                    </a>
                  ) : (
                    <p className="text-off-white">{entity.worksFor.name}</p>
                  )}
                </Card>
              )}
              {entity.location && (
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                    BASED IN
                  </p>
                  <p className="text-off-white">{entity.location}</p>
                </Card>
              )}
              {typeof entity.podcastAppearances === "number" && (
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                    ROADMAN PODCAST APPEARANCES
                  </p>
                  <p className="text-off-white">
                    {entity.podcastAppearances} episode
                    {entity.podcastAppearances === 1 ? "" : "s"}
                  </p>
                </Card>
              )}
            </div>
          </Container>
        </Section>

        {/* Long-form "why their work matters to your cycling" — MDX body */}
        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                WHY {entity.name.split(" ").slice(-1)[0].toUpperCase()}&rsquo;S
                WORK MATTERS TO YOUR CYCLING
              </h2>
            </ScrollReveal>
            <article className="prose-roadman prose-enhanced">
              <MDXRemote source={entity.content} components={mdxComponents} />
            </article>
          </Container>
        </Section>

        {/* Areas of expertise */}
        {entity.knowsAbout.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                  AREAS OF EXPERTISE
                </h2>
              </ScrollReveal>
              <div className="flex flex-wrap gap-2">
                {entity.knowsAbout.map((topic) => (
                  <span
                    key={topic}
                    className="inline-block px-3 py-1.5 text-xs font-heading tracking-wider text-foreground-muted bg-white/[0.04] border border-white/10 rounded-md"
                  >
                    {topic.toUpperCase()}
                  </span>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Notable positions / quotes */}
        {entity.positions.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                  NOTABLE POSITIONS
                </h2>
                <p className="text-foreground-muted text-sm mb-6">
                  Positions {entity.name.split(" ").slice(-1)[0]} is publicly
                  on the record for. Each one is something the rest of the
                  Roadman content network leans on.
                </p>
              </ScrollReveal>
              <div className="space-y-4">
                {entity.positions.map((p, i) => (
                  <Card key={i} className="p-5" hoverable={false}>
                    <p className="text-off-white leading-relaxed">{p.claim}</p>
                    {p.context && (
                      <p className="text-sm text-foreground-subtle mt-2 leading-relaxed">
                        {p.context}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Podcast appearances — only when this entity has a matching guest page */}
        {sortedEpisodes.length > 0 && guest && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                  ON THE ROADMAN PODCAST
                </h2>
                <p className="text-foreground-muted text-sm mb-6">
                  Every appearance by {entity.name} on {PODCAST.name} —{" "}
                  {guest.episodeCount} episode
                  {guest.episodeCount > 1 ? "s" : ""} in total.
                </p>
              </ScrollReveal>
              <div className="space-y-3">
                {sortedEpisodes.slice(0, 6).map((ep) => (
                  <Card
                    key={ep.slug}
                    href={`/podcast/${ep.slug}`}
                    className="p-5"
                  >
                    <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1 leading-snug">
                      {ep.title}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {new Date(ep.publishDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {ep.duration ? ` · ${ep.duration}` : ""}
                    </p>
                  </Card>
                ))}
              </div>
              {guest.episodeCount > 6 && (
                <div className="mt-6 text-center">
                  <Button href={`/guests/${guest.slug}`} variant="ghost">
                    View All {guest.episodeCount} Appearances →
                  </Button>
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* Related Roadman articles */}
        {relatedPosts.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                  FEATURED IN THESE ROADMAN GUIDES
                </h2>
                <p className="text-foreground-muted text-sm mb-6">
                  Articles that lean on {entity.name}&rsquo;s work, either
                  directly or through Anthony&rsquo;s podcast conversations.
                </p>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedPosts.map((p) => (
                  <Card key={p.slug} href={`/blog/${p.slug}`} className="p-4">
                    <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                      {p.title}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {p.excerpt.slice(0, 140)}
                      {p.excerpt.length > 140 ? "…" : ""}
                    </p>
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Topic hubs */}
        {relatedHubs.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                  RELATED TOPICS
                </h2>
              </ScrollReveal>
              <div className="flex flex-wrap gap-3">
                {relatedHubs.map((s) => (
                  <Link
                    key={s}
                    href={`/topics/${s}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    {TOPIC_TITLES[s]} →
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Official links */}
        {entity.sameAs && entity.sameAs.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                  OFFICIAL LINKS
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {entity.sameAs.map((u) => {
                  let host = u;
                  try {
                    host = new URL(u).host.replace(/^www\./, "");
                  } catch {
                    // Fall through with raw URL — frontmatter is hand-curated
                    // so a malformed entry should be visible for the editor
                    // to fix rather than silently dropped.
                  }
                  return (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
                    >
                      <p className="text-xs font-heading tracking-widest text-off-white truncate">
                        {host.toUpperCase()}
                      </p>
                    </a>
                  );
                })}
              </div>
            </Container>
          </Section>
        )}

        {/* Coaching CTA */}
        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              TRAIN WITH THE KNOWLEDGE
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              Apply what {entity.name.split(" ").slice(-1)[0]} has put on the
              record to your own training — coached by Anthony, $195/month
              with a 7-day free trial.
            </p>
            <Button
              href="/apply"
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
              dataTrack={`entity_${slug}_apply`}
            >
              Apply for Coaching
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
