import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { getEpisodeBySlug } from "@/lib/podcast";
import { getEntityBySlug } from "@/lib/entities";
import { getTopicsForPost, getTopicTitleBySlug } from "@/lib/topics";
import { EVENTS } from "@/lib/training-plans";
import { WeeksOutSelector } from "@/components/features/plan/WeeksOutSelector";
import { ShareButtons } from "@/components/features/blog/ShareButtons";
import { RelatedPosts } from "@/components/features/blog/RelatedPosts";
import { AuthorBio } from "@/components/features/blog/AuthorBio";
import { PrimaryHubLink } from "@/components/features/blog/PrimaryHubLink";
import { FeaturedExperts } from "@/components/features/blog/FeaturedExperts";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { ArticleCitationBlock } from "@/components/seo/ArticleCitationBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { queryContentGraph } from "@/lib/content-graph";
import { RelatedContent } from "@/components/features/RelatedContent";
import { InlineArticleCTA } from "@/components/features/conversion/InlineArticleCTA";
import { NextStepBlock } from "@/components/features/conversion/NextStepBlock";
import { StickyCoachingBar } from "@/components/features/conversion/StickyCoachingBar";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { IntentCTA, inferIntentCategory } from "@/components/cta";
import { TableOfContents } from "@/components/features/blog/TableOfContents";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { CitedClaimTable } from "@/components/ui/CitedClaimTable";
import { EvidenceLevel } from "@/components/ui/EvidenceLevel";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { mdxComponents } from "@/components/mdx/MDXComponents";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const stripBrandSuffix = (t: string) =>
  t.replace(/\s*\|\s*Roadman\b.*$/i, "").trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const cleanTitle = stripBrandSuffix(post.seoTitle || post.title);

  return {
    title: cleanTitle,
    description: post.seoDescription,
    keywords: post.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/blog/${slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: post.seoDescription,
      type: "article",
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      url: `https://roadmancycling.com/blog/${slug}`,
      tags: post.keywords,
      // NB: og:image is injected automatically by Next.js from
      // src/app/(content)/blog/[slug]/opengraph-image.tsx (a
      // Satori-backed 1200×630 branded card). Do NOT hardcode
      // openGraph.images here — the previous implementation
      // declared width:1200 × height:630 for every post regardless
      // of the actual featuredImage dimensions, which broke
      // iMessage/Twitter/LinkedIn previews for posts whose
      // featured image didn't match those dimensions (e.g. the
      // Seiler portrait is 1000×667). Letting Next auto-inject the
      // Satori OG route guarantees dimensions always match.
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: post.seoDescription,
      // twitter:image falls back to the auto-injected opengraph-image
      // when no twitter-image.[ext] exists in the route segment.
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, post.pillar, post.keywords, 3);
  const parentTopics = getTopicsForPost(slug);
  // Resolve the primary topic hub for the in-article hub link. Prefer
  // the explicit `primaryHub` frontmatter field; fall back to the first
  // topic resolved via the reverse index so existing posts continue to
  // surface a hub link without requiring a frontmatter migration.
  const primaryHubSlug = post.primaryHub ?? parentTopics[0]?.slug ?? null;
  const primaryHubTitle = primaryHubSlug
    ? getTopicTitleBySlug(primaryHubSlug)
    : null;
  // Reverse-lookup: does any event's blogSlug match this post? If so,
  // we render a WeeksOutSelector widget in the article.
  const planEvent = EVENTS.find((e) => e.blogSlug === slug) ?? null;

  const mentionedEvents = planEvent
    ? []
    : EVENTS.filter((e) => {
        const haystack = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();
        return haystack.includes(e.name.toLowerCase()) || haystack.includes(e.shortName.toLowerCase());
      }).slice(0, 3);

  // Prefer the article's primary topic hub for graph lookups so posts that
  // belong to a topic inherit that topic's tool roster (content-graph only
  // returns tools when a topicSlug resolves a TopicHub). Falls back to
  // pillar-only matching for posts outside any topic hub.
  const graph = queryContentGraph({
    topicSlug: parentTopics[0]?.slug,
    pillar: post.pillar,
    limit: 3,
  });
  const publishDate = new Date(post.publishDate);

  // Pick the intent CTA off the article's metadata. When inference
  // turns up "event" we need a concrete event name for the variant —
  // pull it from `planEvent` (frontmatter ↔ EVENTS reverse-lookup) or
  // fall back to the first body-mentioned event. With no name we drop
  // the inference and let pillar fallback fire so the headline doesn't
  // read "Download your training plan" with nothing in the slot.
  const inferredCategory = inferIntentCategory({
    keywords: post.keywords,
    title: post.title,
    excerpt: post.excerpt,
    pillar: post.pillar,
  });
  // Accent-tolerant fallback so an article whose keywords say "etape"
  // still matches the EVENTS entry "Étape du Tour" — `mentionedEvents`
  // above stays accent-strict because the WeeksOutSelector flow it
  // feeds depends on display-name parity. The intent CTA is happy
  // with a fuzzy match.
  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const intentHaystack = stripAccents(
    `${post.title} ${post.excerpt} ${(post.keywords ?? []).join(" ")}`,
  );
  const fuzzyMatchedEvent =
    EVENTS.find((e) => {
      const name = stripAccents(e.name);
      const short = stripAccents(e.shortName);
      return intentHaystack.includes(name) || intentHaystack.includes(short);
    }) ?? null;
  const intentEventName =
    planEvent?.name ??
    mentionedEvents[0]?.name ??
    fuzzyMatchedEvent?.name ??
    null;
  const intentSource = `blog-intent-${slug}`;

  return (
    <>
      {/* BlogPosting references the canonical Person + Organization @ids
          emitted by OrganizationJsonLd in the root layout, so crawlers see
          a single connected knowledge graph rather than duplicate entities.

          Knowledge-graph relationships (GAP-12):
          - `about` points at parent topic hubs by @id, so the article is
            tied to the topical Thing nodes the hub pages emit.
          - `isPartOf` is an array — the website (top-level container) and
            every parent topic hub (mid-level container) — making the
            article a member of the hub's CollectionPage.
          - `mentions` carries cited experts (linked to /guests/[slug] @ids)
            and explicitly cited episodes (linked to /podcast/[slug] @ids)
            so the article is graph-connected to both Person and
            PodcastEpisode entities. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${SITE_ORIGIN}/blog/${slug}#article`,
          headline: post.title,
          description: post.seoDescription,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          datePublished: post.publishDate,
          dateModified: post.updatedDate || post.publishDate,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_ORIGIN}/blog/${slug}`,
          },
          keywords: post.keywords.join(", "),
          // isPartOf: WebSite (always) + every parent topic hub (when the
          // article appears in one). Topic hubs emit a matching `@id` of
          // `<origin>/topics/<slug>#topic` so the references resolve into
          // the same Thing/CollectionPage on the hub page.
          isPartOf: [
            { "@id": ENTITY_IDS.website },
            ...parentTopics.map((t) => ({
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#topic`,
            })),
          ],
          // about: the topical Thing the article is fundamentally about.
          // Topic hubs declare a co-located `@id` of
          // `<origin>/topics/<slug>#thing` so this lines up.
          ...(parentTopics.length > 0 && {
            about: parentTopics.map((t) => ({
              "@type": "Thing",
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#thing`,
              name: t.title,
              url: `${SITE_ORIGIN}/topics/${t.slug}`,
            })),
          }),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: post.answerCapsule
              ? ["h1", ".answer-capsule"]
              : ["h1", ".prose-roadman > p:first-of-type"],
          },
          ...(post.featuredImage && {
            image: {
              "@type": "ImageObject",
              url: post.featuredImage.startsWith('http') ? post.featuredImage : `${SITE_ORIGIN}${post.featuredImage}`,
              width: 1200,
              height: 630,
            },
          }),
          // mentions: experts cited in the article (linked to their
          // /guests/[slug]#person @id which the guest page emits) plus
          // any explicitly cited related podcast episodes (linked to
          // /podcast/[slug]#episode @id which the episode page emits).
          // Ties the article into the same Person and PodcastEpisode
          // nodes used elsewhere on the site rather than declaring
          // duplicate entities.
          ...((() => {
            const expertMentions = (post.experts ?? [])
              .filter((e) => e.href && e.href.startsWith("/guests/"))
              .map((e) => ({
                "@type": "Person" as const,
                "@id": `${SITE_ORIGIN}${e.href}#person`,
                name: e.name,
                url: `${SITE_ORIGIN}${e.href}`,
              }));
            // featuredEntities resolves to /entity/[slug]#person — the
            // canonical entity-page Person @id, distinct from the
            // /guests/[slug]#person used on the guest pages. Both are
            // legitimate Person nodes for the same human; including
            // them as separate mentions strengthens the cross-entity
            // graph rather than collapsing it.
            const entityMentions = (post.featuredEntities ?? [])
              .map((slug) => {
                const entity = getEntityBySlug(slug);
                if (!entity) return null;
                return {
                  "@type": "Person" as const,
                  "@id": `${SITE_ORIGIN}/entity/${slug}#person`,
                  name: entity.name,
                  url: `${SITE_ORIGIN}/entity/${slug}`,
                };
              })
              .filter((m): m is NonNullable<typeof m> => m !== null);
            const episodeMentions = (post.relatedEpisodes ?? [])
              .map((s) => getEpisodeBySlug(s))
              .filter((ep): ep is NonNullable<typeof ep> => ep !== null)
              .map((ep) => ({
                "@type": "PodcastEpisode" as const,
                "@id": `${SITE_ORIGIN}/podcast/${ep.slug}#episode`,
                name: ep.title,
                url: `${SITE_ORIGIN}/podcast/${ep.slug}`,
              }));
            const all = [...expertMentions, ...entityMentions, ...episodeMentions];
            return all.length > 0 ? { mentions: all } : {};
          })()),
          // citation: every row in `citedClaims` becomes a structured
          // citation. Sources that look like a journal paper (year + et al,
          // or "Journal" / "doi" markers) are typed as ScholarlyArticle to
          // signal research provenance to crawlers; everything else falls
          // back to the more permissive CreativeWork. Lets research-heavy
          // guides expose their sources as first-class graph nodes rather
          // than buried inside a table cell.
          ...((() => {
            if (!post.citedClaims || post.citedClaims.length === 0) return {};
            const looksScholarly = (src: string): boolean => {
              const s = src.toLowerCase();
              return (
                /\b(19|20)\d{2}\b/.test(s) &&
                (/\bet al\.?/.test(s) ||
                  /\bjournal\b/.test(s) ||
                  /\bdoi\b/.test(s) ||
                  /\bpubmed\b/.test(s) ||
                  /\bscience\b/.test(s) ||
                  /\bphysiol/.test(s) ||
                  /\bsports? med/.test(s))
              );
            };
            const seen = new Set<string>();
            const citations = post.citedClaims
              .map((c) => c.evidenceSource)
              .filter((src): src is string => Boolean(src && src.trim()))
              .filter((src) => {
                const key = src.trim();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map((src) => ({
                "@type": looksScholarly(src) ? "ScholarlyArticle" : "CreativeWork",
                name: src,
              }));
            return citations.length > 0 ? { citation: citations } : {};
          })()),
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
              name: "Blog",
              item: "https://roadmancycling.com/blog",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `https://roadmancycling.com/blog/${slug}`,
            },
          ],
        }}
      />

      {/* FAQPage schema for posts with FAQ sections */}
      {post.faq && post.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }}
        />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge pillar={post.pillar} size="md" />
              <span className="text-sm text-foreground-muted">
                {post.readTime}
              </span>
            </div>

            <h1 className="font-heading text-off-white text-3xl md:text-5xl leading-tight mb-6">
              {post.title.toUpperCase()}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-foreground-muted mb-6">
              <span>By {post.author}</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.publishDate}>
                {publishDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              {post.updatedDate && post.updatedDate !== post.publishDate && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="text-foreground-subtle">
                    Updated{" "}
                    <time dateTime={post.updatedDate}>
                      {new Date(post.updatedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </span>
                </>
              )}
            </div>

            <ShareButtons title={post.title} slug={slug} className="justify-center" />
            </div>
          </Container>
        </Section>

        {/* Content */}
        <Section background="charcoal" className="!py-12">
          {/* Floating Table of Contents */}
          <TableOfContents containerSelector=".prose-roadman" />

          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
            {post.answerCapsule && (
              <div className="answer-capsule mb-8">
                <AnswerCapsule text={post.answerCapsule} pillar={post.pillar} />
              </div>
            )}

            {post.evidenceLevel && (
              <EvidenceLevel
                level={post.evidenceLevel}
                variant="block"
                note={post.evidenceNote}
              />
            )}

            {post.citedClaims && post.citedClaims.length > 0 && (
              <CitedClaimTable
                claims={post.citedClaims}
                heading={post.claimsHeading}
                caption={post.claimsCaption}
              />
            )}

            {/* Primary topic hub link — declares the article's home in the
                site's information architecture and gives readers a one-tap
                path to the wider guide. Sits above the prose so search
                engines and humans both encounter it within the first 30%
                of the page. */}
            {primaryHubSlug && primaryHubTitle && (
              <PrimaryHubLink
                hubSlug={primaryHubSlug}
                hubTitle={primaryHubTitle}
              />
            )}

            {post.featuredEntities && post.featuredEntities.length > 0 && (
              <FeaturedExperts slugs={post.featuredEntities} />
            )}

            <article className="prose-roadman prose-enhanced">
              <MDXRemote source={post.content} components={mdxComponents} />
            </article>

            {/* WeeksOutSelector — only renders on event-specific training
                plan posts whose slug matches an event in training-plans.ts.
                Routes readers into the programmatic /plan/<event>/<weeks>
                landing pages. */}
            {planEvent && <WeeksOutSelector event={planEvent} />}

            {mentionedEvents.length > 0 && (
              <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  FREE TRAINING PLANS
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentionedEvents.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/plan/${e.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                    >
                      {e.shortName.toUpperCase()} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mid-article inline CTA — injects after 3rd paragraph, pillar-aware.
                Client-side portal so only JS users see it. */}
            <InlineArticleCTA
              pillar={post.pillar}
              source={`blog-inline-${slug}`}
            />

            {/* Visible FAQ — rendered from frontmatter faq[] array so the
                structured data we already emit as FAQPage JSON-LD also
                reads as actual on-page content. details/summary gives
                native accordion behaviour without JS and stays accessible
                to screen readers + Googlebot's on-page parser. */}
            {post.faq && post.faq.length > 0 && (
              <section
                aria-labelledby={`faq-heading-${slug}`}
                className="mt-16 not-prose"
              >
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  FAQ
                </p>
                <h2
                  id={`faq-heading-${slug}`}
                  className="font-heading text-off-white text-2xl md:text-3xl mb-6"
                >
                  FREQUENTLY ASKED QUESTIONS
                </h2>
                <div className="space-y-3">
                  {post.faq.map((item, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-coral/30 open:border-coral/30 transition-colors"
                    >
                      <summary
                        className="
                          cursor-pointer select-none list-none
                          [&::-webkit-details-marker]:hidden
                          flex items-center justify-between gap-4
                          px-5 py-4 font-heading text-off-white text-base md:text-lg leading-snug
                        "
                      >
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-coral text-xl font-heading transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="px-5 pb-5 text-foreground-muted text-sm md:text-base leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Persistent "next step" block — SSR-rendered, pillar-aware,
                three-option conversion surface. Placed immediately after
                the FAQ because that's the natural scroll-stop where the
                reader has just finished the "am I a fit?" decision loop
                and is most likely to take action. */}
            <NextStepBlock
              pillar={post.pillar}
              source={`blog-next-${slug}`}
              relatedReading={
                relatedPosts[0]
                  ? {
                      label: relatedPosts[0].title,
                      href: `/blog/${relatedPosts[0].slug}`,
                    }
                  : undefined
              }
            />

            {/* End-of-article email capture — SSR-rendered so Googlebot,
                AI crawlers, and no-JS visitors all see a newsletter opp. */}
            <div className="mt-16">
              <EmailCapture
                variant="inline"
                heading="KEEP READING — THE SATURDAY SPIN"
                subheading="The week's training takeaways, pro insights, and what to do about them. 65,000+ serious cyclists open it every Saturday."
                source={`blog-end-${slug}`}
                buttonText="SUBSCRIBE"
              />
            </div>

            {/* Intent-specific CTA — picks the right offer from article
                keywords (plateau / zones / event / masters / nutrition /
                strength / coaching-decision / podcast). Falls back to
                the pillar's default category when nothing scores. The
                bottom-of-article coaching funnel (rendered below for
                coaching-pillar posts) keeps the Apply pitch alive — this
                slot is now intent-routed instead of the old static
                "Apply for Coaching" block. */}
            <div className="mt-10">
              {inferredCategory === "event" && intentEventName ? (
                <IntentCTA
                  category="event"
                  props={{ event: intentEventName, source: intentSource }}
                />
              ) : inferredCategory && inferredCategory !== "event" ? (
                <IntentCTA
                  category={inferredCategory}
                  source={intentSource}
                />
              ) : (
                <IntentCTA pillar={post.pillar} source={intentSource} />
              )}
            </div>

            {/* Topic hub back-links — bidirectional signal for Google +
                natural "keep exploring" path for readers. */}
            {parentTopics.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  MORE ON THIS TOPIC
                </p>
                <div className="flex flex-wrap gap-2">
                  {parentTopics.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/topics/${t.slug}`}
                      className="
                        inline-flex items-center px-4 py-2 rounded-full
                        bg-white/5 border border-white/10
                        text-sm text-foreground-muted
                        hover:bg-white/10 hover:border-coral/30 hover:text-off-white
                        transition-all
                      "
                    >
                      {t.title} <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share + Author */}
            <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center shrink-0">
                  <span className="font-heading text-lg text-off-white">AW</span>
                </div>
                <div>
                  <p className="font-heading text-lg text-off-white">
                    ANTHONY WALSH
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Host of the Roadman Cycling Podcast
                  </p>
                </div>
              </div>
              <ShareButtons title={post.title} slug={slug} />
            </div>

            {/* Author bio — E-E-A-T signal + entity-link chain from every
                blog post to /about + verified social sameAs URLs. */}
            <AuthorBio />

            {/* Citation aid — collapsed `<details>` block giving readers
                and AI crawlers a structured citation (title, author,
                publisher, canonical URL, dates, key claim) plus an APA
                line. Schema.org Article microdata layered on top of the
                same DOM the page-level BlogPosting JSON-LD already
                covers, so models that prefer microdata pick up the same
                attribution without expanding the panel. */}
            <ArticleCitationBlock
              title={post.title}
              url={`${SITE_ORIGIN}/blog/${slug}`}
              datePublished={post.publishDate}
              dateModified={post.updatedDate}
              keyClaim={post.answerCapsule || post.excerpt}
            />

            {/* Evidence block — sources, related episodes, review date.
                Experts default to Anthony alone but can be overridden per
                post via the `experts` frontmatter array, which is how
                articles credit named coaches and scientists they cite. */}
            <EvidenceBlock
              experts={
                post.experts && post.experts.length > 0
                  ? post.experts
                  : [
                      {
                        name: "Anthony Walsh",
                        role: "Cycling Coach & Podcast Host",
                        href: "/about",
                      },
                    ]
              }
              episodes={
                post.relatedEpisodes
                  ? post.relatedEpisodes
                      .map((s) => {
                        const ep = getEpisodeBySlug(s);
                        return ep ? { title: ep.title, href: `/podcast/${ep.slug}` } : null;
                      })
                      .filter((e): e is { title: string; href: string } => e !== null)
                      .slice(0, 3)
                  : undefined
              }
              lastReviewed={String(
                post.lastReviewed || post.updatedDate || post.publishDate
              )}
              reviewedBy={post.reviewedBy || "Anthony Walsh"}
            />

            {/* Ask Roadman handoff — pre-fills the assistant input with
                a question framed around this article's topic so a reader
                with a follow-up doesn't have to re-establish context. */}
            <AskRoadmanCTA
              topic={post.title}
              question={`I just read "${post.title}". What should I do next based on this?`}
              source={`blog-${slug}`}
            />

            {/* Graph-powered: related calculator tools — surfaces at least
                one pillar-matched tool per article so every long-form piece
                has a "try it yourself" action, and satisfies the article
                internal-linking rule (1 hub + articles + tool + episode). */}
            {graph.tools.length > 0 && (
              <div className="mt-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  TRY THE CALCULATORS
                </p>
                <div className="flex flex-wrap gap-2">
                  {graph.tools.slice(0, 2).map((t) => (
                    <Link
                      key={t.slug}
                      href={t.href}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-xs font-heading text-off-white tracking-wider transition-all"
                    >
                      {t.title}
                      <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Graph-powered: related glossary terms */}
            {graph.glossaryTerms.length > 0 && (
              <div className="mt-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">KEY TERMS</p>
                <div className="flex flex-wrap gap-2">
                  {graph.glossaryTerms.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/glossary/${t.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-xs font-heading text-off-white tracking-wider transition-all"
                    >
                      {t.term}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts (blog-only) */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} className="mt-16" />
            )}

            {/* Author-curated related episodes — surfaced from the
                `relatedEpisodes` frontmatter array. Bidirectional blog↔podcast
                link equity. Only renders when the author explicitly tagged
                episodes for this post. */}
            {post.relatedEpisodes && post.relatedEpisodes.length > 0 && (() => {
              const episodes = post.relatedEpisodes
                .map((epSlug) => getEpisodeBySlug(epSlug))
                .filter((ep): ep is NonNullable<typeof ep> => ep !== null);
              if (episodes.length === 0) return null;
              return (
                <section className="mt-16" aria-label="Related podcast episodes">
                  <h2 className="font-heading text-2xl text-off-white mb-4 tracking-wide">
                    RELATED PODCAST EPISODES
                  </h2>
                  <p className="text-sm text-foreground-muted mb-6">
                    Hear the conversations behind this article.
                  </p>
                  <div className="space-y-3">
                    {episodes.map((ep) => (
                      <Link
                        key={ep.slug}
                        href={`/podcast/${ep.slug}`}
                        className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                      >
                        <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors mb-1">
                          {ep.title}
                        </p>
                        {ep.guest && (
                          <p className="text-xs text-foreground-subtle">
                            with {ep.guest}
                            {ep.guestCredential
                              ? ` — ${ep.guestCredential}`
                              : ""}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Related Content (cross-content: blog + podcast) */}
            <RelatedContent
              currentSlug={slug}
              currentType="blog"
              pillar={post.pillar}
              keywords={post.keywords}
              className="mt-16"
            />

            {/* Coaching funnel CTA — coaching-pillar posts only */}
            {post.pillar === "coaching" && (
              <div className="mt-16 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
                <h3 className="font-heading text-2xl text-off-white mb-3">
                  READY TO APPLY THIS TO YOUR TRAINING?
                </h3>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  The Not Done Yet coaching community is 1:1 personalised
                  coaching across training, nutrition, strength, recovery, and
                  accountability. $195/month with a 7-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/apply">Apply Now — 7-Day Free Trial</Button>
                  <Button href="/coaching" variant="ghost">
                    See Coaching Options
                  </Button>
                </div>
              </div>
            )}

            {/* Back to blog */}
            <div className="mt-12 text-center">
              <Button href="/blog" variant="ghost">
                All Articles
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      {(post.pillar === "coaching" || post.pillar === "nutrition") && (
        <StickyCoachingBar source={slug} />
      )}

      <Footer />
    </>
  );
}
