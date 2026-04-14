import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import {
  fetchNewsletterIssues,
  fetchNewsletterIssueBySlug,
} from "@/lib/integrations/beehiiv";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const issues = await fetchNewsletterIssues(100);
  return issues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await fetchNewsletterIssueBySlug(slug);
  if (!issue) return {};

  return {
    title: issue.title,
    description: issue.previewText || issue.subtitle || issue.subject,
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

export const revalidate = 3600; // Revalidate every hour

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = await fetchNewsletterIssueBySlug(slug);
  if (!issue || !issue.content) notFound();

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
              dangerouslySetInnerHTML={{ __html: issue.content }}
            />
          </Container>
        </Section>

        <EmailCapture
          variant="banner"
          heading="GET THE SATURDAY SPIN EVERY WEEK"
          subheading="60,000+ cyclists already get the weekly insights. Join them."
          source="newsletter-issue-bottom"
        />
      </main>
      <Footer />
    </>
  );
}
