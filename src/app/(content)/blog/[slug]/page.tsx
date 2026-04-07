import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { ShareButtons } from "@/components/features/blog/ShareButtons";
import { RelatedPosts } from "@/components/features/blog/RelatedPosts";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { TableOfContents } from "@/components/features/blog/TableOfContents";

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

  const ogParams = new URLSearchParams({
    type: "blog",
    title: post.title,
    pillar: post.pillar,
    author: post.author,
  });

  const ogImageUrl = `https://roadmancycling.com/api/og?${ogParams.toString()}`;

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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription,
      images: [ogImageUrl],
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
          ...(post.featuredImage && {
            image: {
              "@type": "ImageObject",
              url: `https://roadmancycling.com${post.featuredImage}`,
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
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
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

        {/* Content */}
        <Section background="charcoal" className="!py-12">
          {/* Floating Table of Contents */}
          <TableOfContents containerSelector=".prose-roadman" />

          <Container width="narrow">
            <article className="prose-roadman prose-enhanced">
              <MDXRemote source={post.content} />
            </article>

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

            {/* Newsletter */}
            <EmailCapture
              variant="inline"
              heading="THE SATURDAY SPIN"
              subheading="Every Saturday. The week's sharpest cycling insights — training, nutrition, performance — from the podcast."
              source={`blog-${slug}`}
              className="mt-12"
            />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} className="mt-16" />
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
