import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { fetchNewsletterIssueBySlug } from "@/lib/integrations/beehiiv";

interface Props {
  params: Promise<{ slug: string }>;
}

// Newsletter slug content depends on a live Beehiiv fetch that filters out
// issues whose web content hasn't been generated. Pre-listing slugs here
// promised pages we can't actually render; let them resolve on demand instead.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await fetchNewsletterIssueBySlug(slug);
  if (!issue) return {};

  return {
    title: issue.title,
    description: issue.previewText || issue.subtitle || issue.subject,
    // Newsletter archive issues are one-time email broadcasts — thin content for
    // web search indexing. Noindex to avoid dragging site-wide quality signals
    // down, while still letting subscribers share/link to specific issues.
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://roadmancycling.com/newsletter/${issue.slug}`,
    },
    openGraph: {
      title: issue.title,
      description: issue.previewText || issue.subtitle || issue.subject,
      type: "article",
      url: `https://roadmancycling.com/newsletter/${issue.slug}`,
      ...(issue.thumbnailUrl ? { images: [{ url: issue.thumbnailUrl }] } : {}),
    },
  };
}

function hasMeaningfulContent(html: string | null): boolean {
  if (!html) return false;
  // Strip tags + entities and check there's actual readable copy. Beehiiv has
  // shipped issues where the post exists but `content.free.web` is an empty
  // wrapper like `<div></div>` — those used to render as a blank article body
  // below the hero. Redirect those to /newsletter rather than show nothing.
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .trim();
  return text.length > 20;
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = await fetchNewsletterIssueBySlug(slug);
  if (!issue || !hasMeaningfulContent(issue.content)) {
    redirect("/newsletter");
  }
  const content: string = issue.content!;

  const publishDate = issue.publishDate
    ? new Date(issue.publishDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral font-heading text-sm tracking-widest mb-4">
              THE SATURDAY SPIN
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
            >
              {issue.title.toUpperCase()}
            </h1>
            {issue.subtitle && (
              <p className="text-foreground-muted text-lg mb-4">
                {issue.subtitle}
              </p>
            )}
            {publishDate && (
              <p className="text-foreground-subtle text-sm">{publishDate}</p>
            )}
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <article
              className="newsletter-content prose-roadman prose-enhanced"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Container>
        </Section>

        <EmailCapture
          variant="banner"
          heading="GET THE SATURDAY SPIN EVERY WEEK"
          subheading="30,000+ cyclists get the week's sharpest training insights every Saturday. Join them."
          source="newsletter-issue-bottom"
        />
      </main>
      <Footer />
    </>
  );
}
