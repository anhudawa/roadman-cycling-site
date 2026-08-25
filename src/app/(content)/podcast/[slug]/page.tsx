import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { AICitationBlock, Badge, Button } from "@/components/ui";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { SearchOwnerLink } from "@/components/seo/SearchOwnerLink";
import { ENTITY_IDS, SITE_ORIGIN, FOUNDER, SAME_AS } from "@/lib/brand-facts";
import {
  getEpisodeBySlug,
  getAllEpisodeSlugs,
  hasTranscript,
} from "@/lib/podcast";
import { segmentTranscript } from "@/lib/transcript";
import { PodcastLinks } from "@/components/features/podcast/PodcastLinks";
import { TranscriptViewer } from "@/components/features/podcast/TranscriptViewer";
import { PlayButton } from "@/components/features/podcast/PlayButton";
import { RelatedContent } from "@/components/features/RelatedContent";
import { RelatedEpisodes } from "@/components/features/podcast/RelatedEpisodes";
import { JourneyLinks } from "@/components/features/JourneyLinks";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { KeyTakeaways } from "@/components/features/podcast/KeyTakeaways";
import { EpisodeChapters } from "@/components/features/podcast/EpisodeChapters";
import { EpisodeClaims } from "@/components/features/podcast/EpisodeClaims";
import { EpisodeCitations } from "@/components/features/podcast/EpisodeCitations";
import { EpisodeTopicTags } from "@/components/features/podcast/EpisodeTopicTags";
import { GuestBioCard } from "@/components/features/podcast/GuestBioCard";
import { PlateauCTA } from "@/components/cta";
import { getPostBySlug } from "@/lib/blog";
import { getTopicBySlug } from "@/lib/topics";
import { slugifyGuestName } from "@/lib/guests";
import { getGuestProfileOverride } from "@/lib/guests/profiles";
import { EVENTS } from "@/lib/training-plans";
import { getRelevantTools } from "@/lib/podcast-tools";
import { RelevantTools } from "@/components/features/podcast/RelevantTools";
import Link from "next/link";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import {
  getSearchOwnerWebPageId,
  resolveSearchOwner,
  stripRoadmanBrandSuffix,
} from "@/lib/seo/search-ownership";

export async function generateStaticParams() {
  return getAllEpisodeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return { title: "Episode Not Found" };

  const cleanTitle = stripRoadmanBrandSuffix(episode.seoTitle || episode.title);

  return {
    title: cleanTitle,
    description: episode.seoDescription,
    keywords: episode.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/podcast/${slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: episode.seoDescription,
      type: "article",
      publishedTime: episode.publishDate,
      modifiedTime: episode.updatedDate,
      url: `https://roadmancycling.com/podcast/${slug}`,
      images: episode.youtubeId
        ? [
            {
              url: `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`,
              width: 1280,
              height: 720,
              alt: episode.title,
            },
          ]
        : [
            {
              url: "https://roadmancycling.com/images/podcast-cover.jpg",
              width: 1200,
              height: 630,
              alt: "Roadman Cycling Podcast",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: episode.seoDescription,
      images: episode.youtubeId
        ? [`https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`]
        : ["https://roadmancycling.com/images/podcast-cover.jpg"],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  const publishDate = new Date(episode.publishDate);
  const episodeUrl = `https://roadmancycling.com/podcast/${slug}`;
  const searchOwner = resolveSearchOwner(
    [
      episode.title,
      episode.seoTitle,
      episode.seoDescription,
      ...(episode.keywords ?? []),
      ...(episode.topicTags ?? []),
    ],
    {
      currentPath: `/podcast/${slug}`,
      fallbackId: "cycling-podcast",
    },
  );

  // Resolve topic-tag slugs into hub objects so we can render labels
  // and emit `about` schema entries. Skips slugs that don't match a
  // live topic hub (defensive — catches frontmatter typos at render
  // time without breaking the page).
  const resolvedTopicTags = (episode.topicTags ?? [])
    .map((slug) => {
      const hub = getTopicBySlug(slug);
      if (!hub) return null;
      const shortLabel = hub.title.split(" — ")[0].split(":")[0].trim();
      return { slug, label: shortLabel, title: hub.title };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Pull the curated guest profile override so the inline bio card and
  // PodcastEpisode schema can carry sameAs / knowsAbout / bio without
  // re-declaring it per episode. Episode-level frontmatter wins where
  // it disagrees (lets a one-off episode override the canonical bio).
  // Use the same alias-aware slug helper as the guests directory so
  // "Dr Stephen Seiler" / "Prof Seiler" / "Professor Stephen Seiler" all
  // resolve to the canonical /guests/stephen-seiler profile and the
  // matching `GUEST_PROFILE_OVERRIDES` entry.
  const guestSlug = episode.guest ? slugifyGuestName(episode.guest) : null;
  const guestOverride = guestSlug ? getGuestProfileOverride(guestSlug) : null;
  const guestBio =
    episode.guestBio ?? guestOverride?.whyMatters ?? guestOverride?.description;
  const guestSameAs = episode.guestSameAs ?? guestOverride?.sameAs ?? [];
  const guestKnowsAbout = episode.guestKnowsAbout ?? [];

  // Resolve a key-quote speaker into a rich `creator` for Quotation
  // schema. When the speaker is the episode guest or the host, link the
  // quote to that person's canonical Person @id and carry jobTitle /
  // affiliation / sameAs so the quote is attributable on its own — the
  // strongest signal for AI engines citing the line back to a named,
  // credentialed expert. Unknown speakers fall back to name + jobTitle.
  const HOST_SLUG = "anthony-walsh";
  const resolveQuoteCreator = (speaker: string, credential?: string) => {
    const speakerSlug = slugifyGuestName(speaker);
    if (speakerSlug === HOST_SLUG) {
      return {
        "@type": "Person",
        "@id": ENTITY_IDS.person,
        name: FOUNDER.name,
        jobTitle: FOUNDER.jobTitle,
        url: FOUNDER.url,
        affiliation: { "@id": ENTITY_IDS.organization },
        sameAs: [...SAME_AS.person],
      };
    }
    if (guestSlug && episode.guest && speakerSlug === guestSlug) {
      const jobTitle = credential ?? episode.guestCredential;
      return {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/guests/${guestSlug}#person`,
        name: episode.guest,
        url: `${SITE_ORIGIN}/guests/${guestSlug}`,
        ...(jobTitle && { jobTitle }),
        ...(guestOverride?.worksFor && {
          affiliation: {
            "@type": guestOverride.worksFor.type,
            name: guestOverride.worksFor.name,
            ...(guestOverride.worksFor.url && { url: guestOverride.worksFor.url }),
          },
        }),
        ...(guestSameAs.length > 0 && { sameAs: guestSameAs }),
        ...(guestKnowsAbout.length > 0 && { knowsAbout: guestKnowsAbout }),
      };
    }
    return {
      "@type": "Person",
      name: speaker,
      ...(credential && { jobTitle: credential }),
    };
  };

  const mentionedEvents = EVENTS.filter((e) => {
    const haystack = `${episode.title} ${episode.description} ${episode.transcript || ""}`.toLowerCase();
    return haystack.includes(e.name.toLowerCase()) || haystack.includes(e.shortName.toLowerCase());
  }).slice(0, 3);

  // Score on-site calculators against the episode and surface up to 3.
  // Same pattern as mentionedEvents — pillar match plus keyword hits in
  // title/description/keywords/transcript. Tool pages emit WebApplication
  // schema, so we mirror that @type when adding them to `mentions` below.
  const relevantTools = getRelevantTools(episode, 3);

  // Segment the transcript once on the server so the schema and the
  // TranscriptViewer render from the same segmentation — keeping schema
  // `hasPart` anchors in sync with the actual `<h3 id>`s in the DOM.
  const segments = episode.transcript
    ? segmentTranscript(episode.transcript, { titles: episode.segmentTitles })
    : [];

  // Filesystem transcript library check — distinct from the inline
  // `transcript` frontmatter field that powers `<TranscriptViewer>`
  // below. When a `.txt` file lives in `content/podcast/transcripts/`,
  // the episode also gets a dedicated `/podcast/<slug>/transcript`
  // page, and we surface a prominent link here so listeners (and AI
  // crawlers) can find the full canonical transcript.
  const transcriptFileExists = hasTranscript(slug);

  return (
    <>
      {/* PodcastEpisode connected via @id to the PodcastSeries, Person, and
          Organization entities declared in OrganizationJsonLd, so crawlers
          ingest the whole show/host/publisher graph in one pass. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          "@id": `${episodeUrl}#episode`,
          name: episode.title,
          url: episodeUrl,
          description: episode.seoDescription,
          // episodeNumber intentionally omitted: clip uploads inflate the
          // numeric ID up to ~2,536 across ~310 long-form episodes, so
          // emitting it as a series ordinal would mislead crawlers about
          // the show's true episode count and an episode's position in it.
          datePublished: episode.publishDate,
          dateModified: episode.updatedDate || episode.publishDate,
          timeRequired: (() => {
            const parts = episode.duration.split(":").map(Number);
            if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
            if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
            return `PT${parts[0]}M`;
          })(),
          image: episode.youtubeId
            ? `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`
            : `${SITE_ORIGIN}/images/podcast-cover.jpg`,
          partOfSeries: { "@id": ENTITY_IDS.podcast },
          // isPartOf: PodcastSeries, the priority search owner selected from
          // the episode metadata, and every tagged topic hub. The search-owner
          // node mirrors the visible SearchOwnerLink below so humans and
          // crawlers receive the same canonical destination.
          isPartOf: [
            { "@id": ENTITY_IDS.podcast },
            ...(searchOwner
              ? [{ "@id": getSearchOwnerWebPageId(searchOwner) }]
              : []),
            ...resolvedTopicTags.map((t) => ({
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#topic`,
            })),
          ],
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          // AudioObject is the schema.org canonical for podcast audio —
          // tells crawlers this is the playable episode payload, not just
          // a generic media reference. Prefer the direct MP3 (`audioUrl`,
          // Anchor CDN) as `contentUrl`: a real playable audio file is the
          // canonical AudioObject payload, stronger than a Spotify/YouTube
          // page URL. The audio-only back catalogue (~369 eps) carries
          // `audioUrl` with no platform IDs, so this is the only way those
          // episodes get associatedMedia at all. Falls back to the platform
          // page when no direct file URL exists, then to nothing (rare,
          // legacy episodes with no media reference).
          ...(episode.audioUrl || episode.spotifyId || episode.youtubeId
            ? {
                associatedMedia: {
                  "@type": "AudioObject",
                  ...(episode.audioUrl
                    ? { contentUrl: episode.audioUrl }
                    : episode.spotifyId
                      ? { contentUrl: `https://open.spotify.com/episode/${episode.spotifyId}` }
                      : { contentUrl: `https://www.youtube.com/watch?v=${episode.youtubeId}` }),
                  ...(episode.spotifyId && {
                    embedUrl: `https://open.spotify.com/embed/episode/${episode.spotifyId}`,
                  }),
                  encodingFormat: "audio/mpeg",
                  duration: (() => {
                    const parts = episode.duration.split(":").map(Number);
                    if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
                    if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
                    return `PT${parts[0]}M`;
                  })(),
                  uploadDate: episode.publishDate,
                },
              }
            : {}),
          ...(episode.guest && {
            actor: {
              "@type": "Person",
              name: episode.guest,
              ...(guestSlug && {
                "@id": `${SITE_ORIGIN}/guests/${guestSlug}#person`,
                url: `${SITE_ORIGIN}/guests/${guestSlug}`,
              }),
              ...(episode.guestCredential && {
                description: episode.guestCredential,
              }),
              ...(guestSameAs.length > 0 && { sameAs: guestSameAs }),
              ...(guestKnowsAbout.length > 0 && {
                knowsAbout: guestKnowsAbout,
              }),
            },
          }),
          ...(resolvedTopicTags.length > 0 && {
            // about: each topic the episode is tagged with, referenced by
            // the canonical Thing @id the topic hub page emits so all
            // mentions of the topic across the site resolve to one node.
            about: resolvedTopicTags.map((t) => ({
              "@type": "Thing",
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#thing`,
              name: t.title,
              url: `${SITE_ORIGIN}/topics/${t.slug}`,
            })),
          }),
          // mentions: the guest as a connected Person entity (in addition
          // to the `actor` slot above, which is the schema.org-recommended
          // role for a podcast episode but isn't always picked up as a
          // graph relationship), plus any author-curated related blog
          // posts. Both reference the canonical @ids on the target pages
          // so the graph stays consolidated.
          ...((() => {
            const mentions: Array<Record<string, unknown>> = [];
            if (episode.guest && guestSlug) {
              mentions.push({
                "@type": "Person",
                "@id": `${SITE_ORIGIN}/guests/${guestSlug}#person`,
                name: episode.guest,
                url: `${SITE_ORIGIN}/guests/${guestSlug}`,
                ...(episode.guestCredential && {
                  description: episode.guestCredential,
                }),
              });
            }
            for (const postSlug of episode.relatedPosts ?? []) {
              const post = getPostBySlug(postSlug);
              if (!post) continue;
              mentions.push({
                "@type": "BlogPosting",
                "@id": `${SITE_ORIGIN}/blog/${post.slug}#article`,
                name: post.title,
                url: `${SITE_ORIGIN}/blog/${post.slug}`,
              });
            }
            // Surface relevant calculators / tools as mentions so the
            // episode's knowledge graph connects to the supporting tool
            // pages. @type matches what each tool page already emits.
            for (const tool of relevantTools) {
              mentions.push({
                "@type": tool.schemaType,
                name: tool.title,
                url: `${SITE_ORIGIN}${tool.href}`,
                description: tool.blurb,
              });
            }
            return mentions.length > 0 ? { mentions } : {};
          })()),
          ...(episode.keyTakeaways &&
            episode.keyTakeaways.length > 0 && {
              abstract: episode.keyTakeaways.join(" "),
            }),
          ...(episode.citations &&
            episode.citations.length > 0 && {
              citation: episode.citations.map((c) => ({
                "@type":
                  c.type === "paper"
                    ? "ScholarlyArticle"
                    : c.type === "book"
                      ? "Book"
                      : c.type === "episode"
                        ? "PodcastEpisode"
                        : "CreativeWork",
                name: c.title,
                ...(c.url && { url: c.url }),
                ...(c.author && { author: { "@type": "Person", name: c.author } }),
              })),
            }),
          // Expose the full transcript text to search + AI assistants as a
          // first-class schema field (supported under PodcastEpisode via
          // schema.org CreativeWork inheritance). Lets LLM crawlers ingest
          // the episode content without needing to render the page.
          ...(episode.transcript && { transcript: episode.transcript }),
          // Speakable targets the same `.answer-capsule` block blog posts
          // use, so voice search gets a consistent TL;DR across all content
          // types. The h1 fallback ensures voice UAs always have something
          // to read even for episodes that pre-date the capsule rollout.
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".answer-capsule"],
          },
          // hasPart strategy: prefer author-curated `chapters` (with real
          // YouTube timecodes) when present; otherwise fall back to the
          // auto-segmented transcript anchors. Chapters give Google a
          // native passage-indexing target tied to actual narrative beats
          // — same UX as YouTube's chapter strip but indexable in DOM.
          ...(episode.chapters && episode.chapters.length > 0
            ? {
                hasPart: episode.chapters.map((c, i) => {
                  const parts = c.timestamp.split(":").map(Number);
                  const secs =
                    parts.length === 3
                      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                      : parts.length === 2
                        ? parts[0] * 60 + parts[1]
                        : parts[0] || 0;
                  return {
                    "@type": "Clip",
                    name: c.title,
                    startOffset: secs,
                    position: i + 1,
                    url: episode.youtubeId
                      ? `https://www.youtube.com/watch?v=${episode.youtubeId}&t=${secs}s`
                      : `${episodeUrl}#chapter-${i + 1}`,
                    isPartOf: { "@type": "PodcastEpisode", url: episodeUrl },
                  };
                }),
              }
            : segments.length > 1 && {
                hasPart: segments.map((segment) => ({
                  "@type": "CreativeWork",
                  name: segment.title,
                  url: `${episodeUrl}#${segment.id}`,
                  position: segment.index,
                  wordCount: segment.wordCount,
                  isPartOf: { "@type": "PodcastEpisode", url: episodeUrl },
                })),
              }),
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
              name: "Podcast",
              item: "https://roadmancycling.com/podcast",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: episode.title,
              item: `https://roadmancycling.com/podcast/${slug}`,
            },
          ],
        }}
      />
      {/* VideoObject for YouTube episodes */}
      {episode.youtubeId && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: episode.title,
            description: episode.seoDescription,
            thumbnailUrl: `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`,
            uploadDate: episode.publishDate,
            contentUrl: `https://www.youtube.com/watch?v=${episode.youtubeId}`,
            embedUrl: `https://www.youtube.com/embed/${episode.youtubeId}`,
            duration: (() => {
              const parts = episode.duration.split(":").map(Number);
              if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
              if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
              return `PT${parts[0]}M`;
            })(),
            publisher: { "@id": ENTITY_IDS.organization },
          }}
        />
      )}
      {/* Quotation schema for key expert quotes extracted from transcript */}
      {episode.keyQuotes && episode.keyQuotes.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": episode.keyQuotes.map((quote) => ({
              "@type": "Quotation",
              text: quote.text,
              creator: resolveQuoteCreator(quote.speaker, quote.credential),
              isPartOf: {
                "@type": "PodcastEpisode",
                "@id": `${episodeUrl}#episode`,
                name: episode.title,
                url: episodeUrl,
              },
            })),
          }}
        />
      )}

      {/* FAQPage schema for episodes with FAQ sections */}
      {episode.faq && episode.faq.length > 0 && (
        <FAQSchema faqs={episode.faq} />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge pillar={episode.pillar} size="md" />
              <span className="text-sm text-foreground-subtle capitalize">
                {episode.type.replace("-", " & ")}
              </span>
            </div>

            <h1 className="font-heading text-off-white text-3xl md:text-5xl leading-tight mb-4">
              {episode.title.toUpperCase()}
            </h1>

            {episode.guest && (
              <p className="text-foreground-muted text-lg mb-2">
                with{" "}
                <span className="text-off-white font-medium">
                  {episode.guest}
                </span>
                {episode.guestCredential && (
                  <span className="text-foreground-subtle">
                    {" "}
                    &mdash; {episode.guestCredential}
                  </span>
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground-subtle mb-6">
              <span>{episode.duration}</span>
              <span>&middot;</span>
              <time dateTime={episode.publishDate}>
                {publishDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              {episode.updatedDate &&
                episode.updatedDate !== episode.publishDate && (
                  <>
                    <span>&middot;</span>
                    <span>
                      Updated{" "}
                      <time dateTime={episode.updatedDate}>
                        {new Date(episode.updatedDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </time>
                    </span>
                  </>
                )}
            </div>

            {episode.youtubeId && (
              <div className="flex items-center justify-center mb-4">
                <PlayButton
                  episode={{
                    slug: episode.slug,
                    title: episode.title,
                    guest: episode.guest,
                    youtubeId: episode.youtubeId,
                    spotifyId: episode.spotifyId,
                    duration: episode.duration,
                  }}
                  className="mr-3"
                />
                <span className="text-sm text-foreground-muted font-heading tracking-wider">
                  LISTEN NOW
                </span>
              </div>
            )}

            <PodcastLinks
              spotifyId={episode.spotifyId}
              episodeTitle={episode.title}
              className="flex flex-col items-center"
            />
            </div>
          </Container>
        </Section>

        {/* YouTube Embed (primary) — Wide for cinematic feel */}
        {episode.youtubeId && (
          <Section background="charcoal" className="!py-8 border-b border-white/5">
            <Container>
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden bg-background-elevated border border-white/5 aspect-video shadow-[var(--shadow-elevated)]">
                <iframe
                  src={`https://www.youtube.com/embed/${episode.youtubeId}`}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="border-0"
                  title={`Watch ${episode.title}`}
                />
              </div>
              <div className="mt-4 text-center">
                <Link
                  href={`/watch/${episode.slug}`}
                  className="font-heading text-sm tracking-wider text-coral hover:text-off-white transition-colors"
                >
                  OPEN FOCUSED VIDEO PAGE →
                </Link>
              </div>
            </Container>
          </Section>
        )}

        {/* Guest Info Card + Spotify */}
        <Section background="charcoal" className="!py-6 border-b border-white/5">
          <Container width="narrow">
            <div className="flex flex-col gap-6">
              {/* Guest bio card — richer than a single-line link: pulls
                  curated bio + verified profiles + topics-known-for from
                  GUEST_PROFILE_OVERRIDES, with episode-frontmatter
                  fields taking precedence for episode-specific overrides. */}
              {episode.guest && guestSlug && (
                <GuestBioCard
                  name={episode.guest}
                  slug={guestSlug}
                  credential={episode.guestCredential}
                  bio={guestBio}
                  knowsAbout={guestKnowsAbout}
                  sameAs={guestSameAs}
                />
              )}

              {/* Spotify Embed (secondary, if available) */}
              {episode.spotifyId && (
                <div>
                  <p className="text-xs text-foreground-subtle mb-2 uppercase tracking-widest font-heading">
                    Also on Spotify
                  </p>
                  <div className="rounded-xl overflow-hidden bg-background-elevated border border-white/5">
                    <iframe
                      src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?theme=0`}
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="border-0"
                      title={`Listen to ${episode.title} on Spotify`}
                    />
                  </div>
                </div>
              )}
            </div>
          </Container>
        </Section>

        {/* Content / Show Notes */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Podcast", href: "/podcast" },
                { label: episode.title },
              ]}
            />
            {/* Answer capsule — AI-citation-optimised TL;DR of the episode.
                Prefers the curated `answerCapsule` (60–100 words, generated
                from the full transcript) over `seoDescription` (150-char
                SERP snippet). Aligned with the .answer-capsule CSS selector
                referenced by SpeakableSpecification schema. Primary AI-
                citation target for ChatGPT / Perplexity / Claude when this
                episode is quoted as a source. */}
            {(episode.answerCapsule ?? episode.seoDescription) && (
              <AnswerCapsule
                text={episode.answerCapsule ?? episode.seoDescription}
                pillar={episode.pillar}
              />
            )}

            {searchOwner && <SearchOwnerLink owner={searchOwner} />}

            {/* Key takeaways — skim-first summary above show notes so a
                rushed reader walks away with the value in seconds. */}
            {episode.keyTakeaways && episode.keyTakeaways.length > 0 && (
              <KeyTakeaways
                takeaways={episode.keyTakeaways}
                className="mb-8"
              />
            )}

            {/* Topic tags → topic hub link block. Feeds the hub-and-spoke
                architecture: episodes → topics → coaching CTA. */}
            {resolvedTopicTags.length > 0 && (
              <EpisodeTopicTags
                tags={resolvedTopicTags.map(({ slug: s, label }) => ({
                  slug: s,
                  label,
                }))}
                className="mb-8"
              />
            )}

            {/* Author-curated chapter markers with YouTube timecode
                deep-links. Only rendered when chapters are explicitly
                authored — auto transcript segmentation continues to
                power the TranscriptViewer below. */}
            {episode.chapters && episode.chapters.length > 0 && (
              <EpisodeChapters
                chapters={episode.chapters}
                youtubeId={episode.youtubeId}
                className="mb-10"
              />
            )}

            <article className="prose-roadman prose-episode">
              <MDXRemote
                source={episode.content}
                components={{ ...mdxComponents, AICitationBlock }}
              />
            </article>

            {/* Claims surfaced in the episode, each tagged with an
                evidence level (study / expert / practice / anecdote /
                opinion) so readers know what's grounded vs. a take. */}
            {episode.claims && episode.claims.length > 0 && (
              <EpisodeClaims claims={episode.claims} className="mt-12" />
            )}

            {/* Resources mentioned — papers, books, tools, episodes
                referenced in the conversation. Outbound links carry
                rel="nofollow" by default to keep authority on-site. */}
            {episode.citations && episode.citations.length > 0 && (
              <EpisodeCitations
                citations={episode.citations}
                className="mt-12"
              />
            )}

            {/* Key Quotes — verbatim expert quotes from the transcript,
                rendered as styled blockquotes with speaker attribution.
                Placed between show notes and transcript for maximum
                visibility without interrupting the reading flow. */}
            {episode.keyQuotes && episode.keyQuotes.length > 0 && (
              <section className="mt-12" aria-label="Key quotes from this episode">
                <h2 className="font-heading text-xl text-off-white mb-6 tracking-wide">
                  KEY QUOTES
                </h2>
                <div className="space-y-6">
                  {episode.keyQuotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="relative pl-5 border-l-2 border-coral/60"
                    >
                      <p className="text-foreground-muted text-base italic leading-relaxed">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      <footer className="mt-2 text-sm text-foreground-subtle">
                        <span className="text-off-white font-medium not-italic">
                          {quote.speaker}
                        </span>
                        {quote.credential && (
                          <span className="not-italic">
                            {" "}&mdash; {quote.credential}
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Universal Plateau Diagnostic CTA — replaces the previous
                pillar-conditional "Apply for Coaching" block per the May
                2026 copy audit. /plateau is now the universal entry CTA
                on every content page (not just coaching/nutrition
                pillars), so cold listeners get segmented through the
                diagnostic before the offer-ladder pitch. High-intent
                position after content, before transcript. */}
            <div className="mt-12">
              <PlateauCTA variant="inline" source={`podcast-${slug}`} />
            </div>

            {/* Read full transcript link — surfaces the dedicated
                /podcast/<slug>/transcript page when a `.txt` file exists
                in the transcript library. Placed above the inline
                accordion so the canonical, full-page experience is the
                primary affordance for readers and crawlers; the inline
                viewer remains for in-page skimming. */}
            {transcriptFileExists && (
              <Link
                href={`/podcast/${slug}/transcript`}
                className="mt-12 group flex items-center justify-between gap-4 rounded-xl border border-white/10 hover:border-coral/40 bg-white/[0.03] hover:bg-coral/5 p-5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-coral shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <div>
                    <p className="font-heading text-off-white text-base tracking-wide group-hover:text-coral transition-colors">
                      READ THE FULL TRANSCRIPT
                    </p>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      Searchable, deep-linkable, every word.
                    </p>
                  </div>
                </div>
                <span
                  className="text-coral font-heading text-xl shrink-0"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            )}

            {/* Transcript */}
            {episode.transcript && (
              <TranscriptViewer
                transcript={episode.transcript}
                titles={episode.segmentTitles}
                className="mt-12"
              />
            )}

            {/* FAQ section — visible accordion for episodes with FAQ pairs */}
            {episode.faq && episode.faq.length > 0 && (
              <section className="mt-16" aria-label="Frequently asked questions">
                <h2 className="font-heading text-2xl text-off-white mb-6 tracking-wide">
                  FREQUENTLY ASKED QUESTIONS
                </h2>
                <div className="space-y-4">
                  {episode.faq.map((item, idx) => (
                    <details
                      key={idx}
                      className="group rounded-lg bg-white/5 border border-white/5 hover:border-coral/20 transition-colors"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-4 font-heading text-off-white text-sm tracking-wide select-none list-none [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span className="ml-4 shrink-0 text-coral transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-foreground-muted leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* E-E-A-T trust block — named host, editorial standards,
                corrections link + named on-episode guest as an expert
                source when present. Renders on every episode page. */}
            <EvidenceBlock
              experts={
                episode.guest
                  ? [
                      {
                        name: episode.guest,
                        role: episode.guestCredential,
                        href: `/guests/${episode.guest
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")}`,
                      },
                    ]
                  : undefined
              }
              lastReviewed={episode.updatedDate ?? episode.publishDate}
            />

            {/* Ask Roadman handoff — episode-specific question seed so a
                listener with a follow-up can take the topic into the
                assistant without re-establishing context. */}
            <AskRoadmanCTA
              topic={episode.title}
              question={
                episode.guest
                  ? `In the episode with ${episode.guest} on "${episode.title}", what's the most important takeaway for me to apply?`
                  : `In the episode "${episode.title}", what's the most important takeaway for me to apply?`
              }
              source={`podcast-${slug}`}
            />

            {/* Newsletter */}
            <EmailCapture
              variant="inline"
              heading="NEVER MISS AN EPISODE"
              subheading="Weekly insights from the podcast. The stuff that actually makes you faster."
              source={`podcast-${slug}`}
              className="mt-16"
            />

            {/* Author-curated related blog posts — explicit episode→blog
                link equity. Populated by
                scripts/populate-episode-related-posts.ts. */}
            {episode.relatedPosts && episode.relatedPosts.length > 0 && (() => {
              const posts = episode.relatedPosts
                .map((s) => getPostBySlug(s))
                .filter((p): p is NonNullable<typeof p> => p !== null);
              if (posts.length === 0) return null;
              return (
                <section className="mt-16" aria-label="Related blog posts">
                  <h2 className="font-heading text-2xl text-off-white mb-4 tracking-wide">
                    READ THE GUIDE
                  </h2>
                  <p className="text-sm text-foreground-muted mb-6">
                    The written companion to this episode.
                  </p>
                  <div className="space-y-3">
                    {posts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                      >
                        <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                          {p.title}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {p.excerpt.slice(0, 140)}
                          {p.excerpt.length > 140 ? "…" : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })()}

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

            <RelevantTools tools={relevantTools} className="mt-10" />

            {/* Related Episodes (podcast-only, server-rendered for SEO) */}
            <RelatedEpisodes
              currentSlug={slug}
              pillar={episode.pillar}
              keywords={episode.keywords}
              title={episode.title}
              className="mt-16"
            />

            {/* Related Content (cross-content: blog + podcast) */}
            <RelatedContent
              currentSlug={slug}
              currentType="podcast"
              pillar={episode.pillar}
              keywords={episode.keywords}
              className="mt-16"
            />

            {/* Journey-aware funnel block — replaces the static "Want
                this applied to your training?" CTA with stage + pillar
                aware routing. Coaching-pillar episodes still resolve
                to /apply via the destination resolver; non-coaching
                episodes get the Inner Circle community pitch. The
                forward links bridge listeners back to a reading-format
                explainer and a related episode. */}
            <JourneyLinks
              currentType="podcast"
              currentSlug={slug}
              currentTitle={episode.title}
              pillar={episode.pillar}
              keywords={episode.keywords}
              source={`podcast-${slug}`}
              className="mt-12"
            />
            {episode.pillar !== "coaching" && (
              <div className="mt-12 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
                <h3 className="font-heading text-2xl text-off-white mb-3">
                  LIKED THIS EPISODE?
                </h3>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  Join the Clubhouse to discuss this episode, ask Anthony your
                  questions, and connect with serious cyclists.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/community/clubhouse">
                    Join the Clubhouse — Free
                  </Button>
                  <Button href="/podcast" variant="ghost">
                    More Episodes
                  </Button>
                </div>
              </div>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
