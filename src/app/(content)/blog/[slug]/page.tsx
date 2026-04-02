import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";

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
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription,
      type: "article",
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      images: post.featuredImage
        ? [{ url: post.featuredImage, width: 1200, height: 630 }]
        : [],
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

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge pillar={post.pillar} size="md" />
              <span className="text-sm text-foreground-muted">
                {post.readTime}
              </span>
            </div>

            <h1 className="font-heading text-off-white text-3xl md:text-5xl leading-tight mb-6">
              {post.title.toUpperCase()}
            </h1>

            <div className="flex items-center justify-center gap-4 text-sm text-foreground-muted">
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
          </Container>
        </Section>

        {/* Content */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <article
              className="
                [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-off-white [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:uppercase
                [&_h3]:font-heading [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-off-white [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:uppercase
                [&_p]:text-foreground-muted [&_p]:leading-relaxed [&_p]:mb-5
                [&_strong]:text-off-white [&_strong]:font-semibold
                [&_em]:text-foreground-muted
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-2
                [&_li]:text-foreground-muted [&_li]:leading-relaxed
                [&_blockquote]:border-l-2 [&_blockquote]:border-coral [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-foreground-muted
                [&_a]:text-coral [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-coral-hover
                [&_hr]:border-white/10 [&_hr]:my-10
              "
            >
              <MDXRemote source={post.content} />
            </article>

            {/* CTA */}
            <div className="mt-16 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
              <h3 className="font-heading text-2xl text-off-white mb-3">
                WANT MORE LIKE THIS?
              </h3>
              <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                Join the Clubhouse for weekly insights, free training plans, and
                live Q&amp;A with Anthony.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/community/clubhouse">
                  Join the Clubhouse — Free
                </Button>
                <Button href="/blog" variant="ghost">
                  More Articles
                </Button>
              </div>
            </div>

            {/* Author */}
            <div className="mt-12 flex items-center gap-4 p-6 bg-background-elevated rounded-lg border border-white/5">
              <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center shrink-0">
                <span className="font-heading text-lg text-off-white">AW</span>
              </div>
              <div>
                <p className="font-heading text-lg text-off-white">
                  ANTHONY WALSH
                </p>
                <p className="text-sm text-foreground-muted">
                  Host of the Roadman Cycling Podcast. 100M+ downloads.
                  Translating access to the world&apos;s best cycling minds into
                  content that makes you faster.
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
