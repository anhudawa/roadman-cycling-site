import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getAllAuthors, getAuthorBySlug } from "@/lib/authors";
import { getAllPosts } from "@/lib/blog";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { CoachingCTA } from "@/components/proof";

export function generateStaticParams() {
  return getAllAuthors()
    // Anthony has a hand-tuned static page at /author/anthony-walsh.
    // The Next.js router prefers static segments over dynamic ones, so
    // listing him here is harmless — but we filter to keep the dynamic
    // route minimal and avoid two pages emitting overlapping schema.
    .filter((a) => !a.primary)
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found" };

  return {
    title: `${author.name} — ${author.jobTitle}`,
    description: author.tagline,
    alternates: {
      canonical: `${SITE_ORIGIN}/author/${slug}`,
    },
    openGraph: {
      title: `${author.name} — ${author.jobTitle}`,
      description: author.tagline,
      type: "profile",
      url: `${SITE_ORIGIN}/author/${slug}`,
      ...(author.image && {
        images: [
          {
            url: author.image.startsWith("http")
              ? author.image
              : `${SITE_ORIGIN}${author.image}`,
            width: 1200,
            height: 630,
            alt: `${author.name} — Roadman Cycling`,
          },
        ],
      }),
    },
  };
}

export default async function ContributorAuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const posts = getAllPosts()
    .filter((p) => p.author.toLowerCase() === author.name.toLowerCase())
    .slice(0, 6);

  const personId = `${SITE_ORIGIN}/author/${slug}#person`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `${author.name} — ${author.jobTitle}`,
          url: `${SITE_ORIGIN}/author/${slug}`,
          mainEntity: {
            "@id": personId,
            "@type": "Person",
            name: author.name,
            jobTitle: author.jobTitle,
            description: author.tagline,
            url: `${SITE_ORIGIN}/author/${slug}`,
            ...(author.image && {
              image: author.image.startsWith("http")
                ? author.image
                : `${SITE_ORIGIN}${author.image}`,
            }),
            ...(author.sameAs.length > 0 && { sameAs: author.sameAs }),
            knowsAbout: author.expertise,
            worksFor: { "@id": ENTITY_IDS.organization },
          },
          isPartOf: { "@id": ENTITY_IDS.website },
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
              name: author.name,
              item: `${SITE_ORIGIN}/author/${slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {author.image && (
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-2 border-coral/30">
                    <Image
                      src={author.image}
                      alt={`${author.name} — ${author.jobTitle}`}
                      fill
                      className="object-cover"
                      sizes="160px"
                      priority
                    />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h1 className="font-heading text-off-white text-4xl md:text-5xl tracking-wide mb-2">
                    {author.name.toUpperCase()}
                  </h1>
                  <p className="text-coral font-heading text-sm tracking-widest mb-4">
                    {author.jobTitle.toUpperCase()}
                  </p>
                  <p className="text-foreground-muted text-lg leading-relaxed max-w-xl">
                    {author.bio}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-heading text-xl text-off-white tracking-wide mb-6">
                  CREDENTIALS
                </h2>
                <ul className="space-y-3">
                  {author.credentials.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-3 text-sm text-foreground-muted"
                    >
                      <span className="text-coral mt-1 shrink-0">-</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-xl text-off-white tracking-wide mb-6">
                  AREAS OF EXPERTISE
                </h2>
                <div className="flex flex-wrap gap-2">
                  {author.expertise.map((e) => (
                    <span
                      key={e}
                      className="inline-block px-3 py-1.5 text-xs font-heading tracking-wider text-foreground-muted bg-white/[0.04] border border-white/10 rounded-md"
                    >
                      {e.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {posts.length > 0 && (
          <Section background="charcoal" className="!py-12 border-t border-white/5">
            <Container width="narrow">
              <h2 className="font-heading text-xl text-off-white tracking-wide mb-6">
                RECENT ARTICLES BY {author.name.toUpperCase()}
              </h2>
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block p-4 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                  >
                    <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                      {post.title}
                    </p>
                    {post.excerpt && (
                      <p className="text-xs text-foreground-subtle">
                        {post.excerpt.slice(0, 120)}
                        {post.excerpt.length > 120 ? "..." : ""}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button href="/blog" variant="ghost" size="sm">
                  All Articles
                </Button>
              </div>
            </Container>
          </Section>
        )}

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <CoachingCTA source={`author-${slug}`} />
            <EmailCapture
              variant="inline"
              heading="GET ANTHONY'S WEEKLY NEWSLETTER"
              subheading="The sharpest cycling insights from the podcast, every Saturday."
              source={`author-${slug}-page`}
              className="mt-12"
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
