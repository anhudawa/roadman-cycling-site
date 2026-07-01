import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Page Not Found — Roadman Cycling",
  description:
    "Looks like you've bonked. This page doesn't exist — but we've got plenty of roads worth riding.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
  openGraph: {
    title: "Page Not Found — Roadman Cycling",
    description:
      "Looks like you've bonked. This page doesn't exist — but we've got plenty of roads worth riding.",
    type: "website",
  },
};

/** Grab the 5 most recent posts as popular suggestions. */
function getPopularPosts() {
  return getAllPosts().slice(0, 5);
}

export default function NotFound() {
  const popularPosts = getPopularPosts();

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-20">
            <p className="font-heading text-[8rem] md:text-[12rem] text-coral leading-none mb-4">
              404
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-off-white mb-4">
              LOOKS LIKE YOU&apos;VE BONKED
            </h1>
            <p className="text-foreground-muted text-lg max-w-lg mx-auto mb-10">
              No gels left, legs are gone, and this page doesn&apos;t exist.
              But don&apos;t DNF on us — there&apos;s plenty more road ahead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/" size="lg">
                Back to Home
              </Button>
              <Button href="/podcast" variant="ghost" size="lg">
                Browse the Podcast
              </Button>
              <Button href="/blog" variant="ghost" size="lg">
                Read the Blog
              </Button>
            </div>

            {/* Popular posts suggestions */}
            {popularPosts.length > 0 && (
              <div className="mt-16 max-w-xl mx-auto text-left">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-4 text-center">
                  POPULAR ARTICLES
                </p>
                <div className="space-y-2">
                  {popularPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="
                        block p-4 rounded-lg
                        bg-white/[0.03] border border-white/5
                        hover:bg-white/[0.07] hover:border-coral/30
                        transition-all group
                      "
                    >
                      <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors leading-snug">
                        {post.title}
                      </p>
                      <p className="text-xs text-foreground-subtle mt-1">
                        {post.readTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16 max-w-lg mx-auto">
              <EmailCapture
                heading="YOU'RE LOST, BUT YOU DON'T HAVE TO MISS OUT"
                subheading="Every Saturday. The week's sharpest cycling insights from the podcast, straight to your inbox."
                source="404"
              />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
