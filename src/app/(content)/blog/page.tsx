import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { getAllPosts } from "@/lib/blog";
import { BlogSearch } from "@/components/features/blog/BlogSearch";
import {
  BLOG_POSTS_PER_PAGE,
  getBlogArchiveHref,
  getBlogArchivePage,
  getBlogArchivePageCount,
} from "@/lib/seo/blog-archive-pagination";

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

function parsePage(raw?: string): number {
  if (!raw) return 1;
  const page = Number.parseInt(raw, 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const path = getBlogArchiveHref(page);
  const canonical = `https://roadmancycling.com${path}`;
  const title =
    page === 1
      ? "Cycling Blog — Training, Nutrition & Performance"
      : `Cycling Articles — Page ${page}`;
  const description =
    "Evidence-based cycling articles covering training plans, coaching, masters performance, nutrition, recovery and the craft of being a cyclist.";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parsePage((await searchParams).page);
  const posts = getAllPosts();
  const totalPages = getBlogArchivePageCount(posts.length);
  if (page > totalPages) notFound();

  const archivePosts = getBlogArchivePage(posts, page);
  const canonical = `https://roadmancycling.com${getBlogArchiveHref(page)}`;
  const firstPosition = (page - 1) * BLOG_POSTS_PER_PAGE;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name:
            page === 1
              ? "Roadman Cycling Blog"
              : `Roadman Cycling Blog — Page ${page}`,
          description:
            "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture.",
          url: canonical,
          numberOfItems: posts.length,
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Latest Cycling Articles",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: archivePosts.length,
          itemListElement: archivePosts.map((post, i) => ({
            "@type": "ListItem",
            position: firstPosition + i + 1,
            url: `https://roadmancycling.com/blog/${post.slug}`,
            name: post.title,
          })),
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
          ],
        }}
      />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE KNOWLEDGE
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                Evidence-based cycling content — grounded in real conversations
                with the world&apos;s best coaches, scientists, and riders.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Search + Posts (Client Component) */}
        <Section background="charcoal">
          <Container>
            <BlogSearch
              posts={posts}
              archivePosts={archivePosts}
              currentPage={page}
              totalPages={totalPages}
            />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
