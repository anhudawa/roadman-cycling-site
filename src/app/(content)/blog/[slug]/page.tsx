import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { getEpisodeBySlug } from "@/lib/podcast";
import { getTopicsForPost } from "@/lib/topics";
import { EVENTS } from "@/lib/training-plans";
import { WeeksOutSelector } from "@/components/features/plan/WeeksOutSelector";
import { ShareButtons } from "@/components/features/blog/ShareButtons";
import { RelatedPosts } from "@/components/features/blog/RelatedPosts";
import { AuthorBio } from "@/components/features/blog/AuthorBio";
import { RelatedContent } from "@/components/features/RelatedContent";
import { InlineArticleCTA } from "@/components/features/conversion/InlineArticleCTA";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { TableOfContents } from "@/components/features/blog/TableOfContents";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { mdxComponents } from "@/components/mdx/MDXComponents";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription,
    keywords: post.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/blog/${slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription,
      type: "article",
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      url: `https://roadmancycling.com/blog/${slug}`,
      tags: post.keywords,
      ...(post.featuredImage && {
        images: [
          {
            url: post.featuredImage.startsWith('http') ? post.featuredImage : `https://roadmancycling.com${post.featuredImage}`,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription,
      ...(post.featuredImage && {
        images: [post.featuredImage.startsWith('http') ? post.featuredImage : `https://roadmancycling.com${post.featuredImage}`],
      }),
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
  // Reverse-lookup: does any event's blogSlug match this post? If so,
  // we render a WeeksOutSelector widget in the article.
  const planEvent = EVENTS.find((e) => e.blogSlug === slug) ?? null;

  const mentionedEvents = planEvent
    ? []
    : EVENTS.filter((e) => {
        const haystack = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();
        return haystack.includes(e.name.toLowerCase()) || haystack.includes(e.shortName.toLowerCase());
      }).slice(0, 3);

  const publishDate = new Date(post.publishDate);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seoDescription,
          author: {
            "@type": "Person",
            name: post.author,
            url: "https://roadmancycling.com/about",
          },
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          datePublished: post.publishDate,
          dateModified: post.updatedDate || post.publishDate,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://roadmancycling.com/blog/${slug}`,
          },
          keywords: post.keywords.join(", "),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: post.answerCapsule
              ? ["h1", ".answer-capsule"]
              : ["h1", ".prose-roadman > p:first-of-type"],
          },
          ...(post.featuredImage && {
            image: {
              "@type": "ImageObject",
              url: post.featuredImage.startsWith('http') ? post.featuredImage : `https://roadmancycling.com${post.featuredImage}`,
              width: 1200,
              height: 630,
            },
          }),
        }}
      />
      {/* Person schema for E-E-A-T */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Anthony Walsh",
          url: "https://roadmancycling.com/about",
          jobTitle: "Founder & Host, Roadman Cycling Podcast",
          worksFor: {
            "@type": "Organization",
            name: "Roadman Cycling",
          },
          knowsAbout: [
            "cycling training",
            "cycling nutrition",
            "endurance coaching",
            "cycling performance",
          ],
          sameAs: [
            "https://youtube.com/@theroadmanpodcast",
            "https://instagram.com/roadman.cycling",
            "https://x.com/Roadman_Podcast",
          ],
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

            <div className="flex items-center justify-center gap-4 text-sm text-foreground-muted mb-6">
              <span>By {post.author}</span>
              <span>&middot;</span>
              <time dateTime={post.publishDate}>
                {publishDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>

            <ShareButtons title={post.title} slug={slug} className="justify-center" />
            </div>
          </Container>
        </Section>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="w-full max-h-[480px] overflow-hidden relative aspect-[21/9]">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <Section background="charcoal" className="!py-12">
          {/* Floating Table of Contents */}
          <TableOfContents containerSelector=".prose-roadman" />

          <Container width="narrow">
            {post.answerCapsule && (
              <div className="answer-capsule mb-8">
                <AnswerCapsule text={post.answerCapsule} pillar={post.pillar} />
              </div>
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

            {/* Soft coaching CTA — only on high-intent pillars (coaching /
                nutrition). Visitors reading a training/nutrition deep-dive
                have already demonstrated problem-awareness; a gentle Apply
                prompt converts the highest-intent tail. */}
            {(post.pillar === "coaching" || post.pillar === "nutrition") && (
              <div className="mt-10 rounded-xl border border-white/10 bg-gradient-to-br from-deep-purple/50 to-charcoal p-6 md:p-8 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  WANT THIS APPLIED TO YOUR TRAINING?
                </p>
                <p className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
                  NOT DONE YET — PERSONALISED COACHING.
                </p>
                <p className="text-foreground-muted text-sm mb-5 max-w-xl mx-auto">
                  Your power numbers, your events, your calendar. 7-day free
                  trial. $195/month. Applications reviewed personally by
                  Anthony.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button href="/apply" size="md">
                    Apply — 7-Day Free Trial
                  </Button>
                  <Button href="/coaching" variant="ghost" size="md">
                    How Coaching Works
                  </Button>
                </div>
              </div>
            )}

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
                  Not Done Yet is 1:1 personalised coaching across training,
                  nutrition, strength, recovery, and accountability. $195/month
                  with a 7-day free trial.
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

      <Footer />
    </>
  );
}
