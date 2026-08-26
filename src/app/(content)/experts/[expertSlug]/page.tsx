import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_ORIGIN } from "@/lib/brand-facts";
import { getGuestBySlug } from "@/lib/guests";
import { getGuestProfileOverride } from "@/lib/guests/profiles";
import {
  getExpertsWithTopics,
  getTopicSlugsForExpert,
  getExpertTopic,
} from "@/lib/experts";

export async function generateStaticParams() {
  return getExpertsWithTopics().map((e) => ({ expertSlug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ expertSlug: string }>;
}): Promise<Metadata> {
  const { expertSlug } = await params;
  const guest = getGuestBySlug(expertSlug);
  if (!guest) return { title: "Not Found" };
  const override = getGuestProfileOverride(expertSlug);

  const defaults = {
    title: `What Does ${guest.name} Say? — Topics`,
    description: `What does ${guest.name} say about training, nutrition and racing? Explore direct quotes, key positions and Roadman podcast episodes by topic.`,
  };
  const title = override?.expertSeoTitle ?? defaults.title;
  const description = override?.expertSeoDescription ?? defaults.description;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_ORIGIN}/experts/${expertSlug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${SITE_ORIGIN}/experts/${expertSlug}`,
    },
  };
}

export default async function ExpertIndexPage({
  params,
}: {
  params: Promise<{ expertSlug: string }>;
}) {
  const { expertSlug } = await params;
  const guest = getGuestBySlug(expertSlug);
  if (!guest) notFound();

  const topicSlugs = getTopicSlugsForExpert(expertSlug);
  if (topicSlugs.length === 0) notFound();

  const override = getGuestProfileOverride(expertSlug);
  const credential = override?.credential ?? guest.credential;
  const topics = topicSlugs
    .map((slug) => getExpertTopic(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      {/* ProfilePage with the canonical Person nested inline as
          `mainEntity`. Google's ProfilePage rich result requires
          `mainEntity` to resolve to a Person carrying a `name`; a bare
          `{ "@id" }` reference to a Person in a separate <script> is not
          resolved for rich-result eligibility. The `#person` @id is
          shared with /guests/[slug] so cross-site references still
          resolve to one Knowledge Graph node. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `${guest.name} — Expert Topics`,
          url: `${SITE_ORIGIN}/experts/${expertSlug}`,
          mainEntity: {
            "@type": "Person",
            "@id": `${SITE_ORIGIN}/guests/${expertSlug}#person`,
            name: guest.name,
            ...(credential && { jobTitle: credential }),
            description:
              override?.whyMatters ?? override?.description ?? undefined,
            url: `${SITE_ORIGIN}/guests/${expertSlug}`,
            ...(override?.image && { image: override.image }),
            ...(override?.sameAs &&
              override.sameAs.length > 0 && { sameAs: override.sameAs }),
            knowsAbout: topics.flatMap((t) => [t.label, t.phrase]),
          },
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
              name: "Experts",
              item: `${SITE_ORIGIN}/experts`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: guest.name,
              item: `${SITE_ORIGIN}/experts/${expertSlug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Experts", href: "/experts" },
                { label: guest.name },
              ]}
            />
          </Container>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                WHAT DOES {guest.name.toUpperCase()} SAY?
              </p>
              <h1 className="font-heading text-off-white text-4xl md:text-6xl leading-tight mb-4">
                {guest.name.toUpperCase()}
              </h1>
              {credential && (
                <p className="text-foreground-muted text-lg mb-6">
                  {credential}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 text-sm text-foreground-subtle flex-wrap">
                <Link
                  href={`/guests/${expertSlug}`}
                  className="hover:text-coral transition-colors underline underline-offset-4 decoration-white/20"
                >
                  Full profile &amp; episodes
                </Link>
                <span>&middot;</span>
                <div className="flex gap-2">
                  {guest.pillars.map((pillar) => (
                    <Badge key={pillar} pillar={pillar} size="sm" />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {(override?.whyMatters || override?.description) && (
          <Section background="charcoal" className="!pt-12 !pb-6">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <p className="text-foreground-muted text-base leading-relaxed">
                  {override?.whyMatters ?? override?.description}
                </p>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        <Section background="charcoal" className="!pt-6">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white mb-2 text-2xl tracking-wide">
                EXPLORE BY TOPIC
              </h2>
              <p className="text-sm text-foreground-muted mb-8">
                Where {guest.name.split(" ").slice(-1)[0]} lands on the
                questions people ask most.
              </p>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {topics.map((t, i) => (
                <ScrollReveal key={t.slug} direction="up" delay={(i % 4) * 0.05}>
                  <Link
                    href={`/experts/${expertSlug}/${t.slug}`}
                    className="block group h-full"
                  >
                    <Card className="p-6 h-full transition-all group-hover:border-coral/30">
                      <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors tracking-wide mb-2">
                        On {t.label}
                      </h3>
                      <p className="text-sm text-foreground-subtle">
                        {t.blurb}
                      </p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/experts" variant="ghost">
                &larr; All Experts
              </Button>
              <Button href={`/guests/${expertSlug}`}>
                Full {guest.name.split(" ").slice(-1)[0]} Profile
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
