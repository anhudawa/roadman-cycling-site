import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, BRAND_STATS } from "@/lib/brand-facts";
import { getSiteStats } from "@/lib/content-graph";
import { getAllPosts } from "@/lib/blog";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

export const metadata: Metadata = {
  title: "Anthony Walsh — Cycling Coach & Podcast Host",
  description:
    "Anthony Walsh is a cycling coach and founder of Roadman Cycling. Host of 1,400+ podcast episodes with World Tour coaches, scientists, and pro riders. Based in Dublin, Ireland.",
  alternates: {
    canonical: "https://roadmancycling.com/author/anthony-walsh",
  },
  openGraph: {
    title: "Anthony Walsh — Cycling Coach & Podcast Host",
    description:
      "Cycling coach and founder of Roadman Cycling. 1,400+ podcast interviews with the best minds in cycling performance.",
    type: "profile",
    url: "https://roadmancycling.com/author/anthony-walsh",
    images: [
      {
        url: "https://roadmancycling.com/images/about/anthony-walsh-podcast.jpg",
        width: 1200,
        height: 630,
        alt: "Anthony Walsh — Roadman Cycling",
      },
    ],
  },
};

const credentials = [
  "Cycling coach — Not Done Yet coaching",
  "Host of the Roadman Cycling Podcast (1M+ monthly listeners)",
  "1,400+ on-the-record interviews with World Tour coaches, sports scientists, and professional riders",
  "Guests include Prof. Stephen Seiler, Dan Lorang, Greg LeMond, Joe Friel, Tim Spector, and Ben Healy",
  "Based in Dublin, Ireland",
  "Coaches cyclists and triathletes across Ireland, the UK, and the US",
];

const expertise = [
  "Cycling training methodology",
  "Polarised and threshold training",
  "FTP and power-based coaching",
  "Cycling nutrition and fuelling",
  "Strength training for cyclists",
  "Recovery and adaptation",
  "Triathlon bike coaching",
  "Masters cyclist performance",
];

export default function AuthorPage() {
  const stats = getSiteStats();
  const recentPosts = getAllPosts().slice(0, 6);

  return (
    <>
      {/* Canonical Person + Organization entities live in the root layout's
          @graph. This page is the canonical Person URL, so we reference the
          shared @id rather than redeclaring the same sameAs/knowsAbout. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: "Anthony Walsh — Cycling Coach & Podcast Host",
          url: "https://roadmancycling.com/author/anthony-walsh",
          mainEntity: { "@id": ENTITY_IDS.person },
          isPartOf: { "@id": ENTITY_IDS.website },
          about: { "@id": ENTITY_IDS.person },
          dateCreated: "2024-01-01",
          dateModified: new Date().toISOString().slice(0, 10),
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
              name: "Anthony Walsh",
              item: "https://roadmancycling.com/author/anthony-walsh",
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-2 border-coral/30">
                  <Image
                    src="/images/about/anthony-profile-closeup-v2.jpg"
                    alt="Anthony Walsh — cycling coach and host of the Roadman Cycling Podcast"
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="font-heading text-off-white text-4xl md:text-5xl tracking-wide mb-2">
                    ANTHONY WALSH
                  </h1>
                  <p className="text-coral font-heading text-sm tracking-widest mb-4">
                    CYCLING COACH & PODCAST HOST
                  </p>
                  <p className="text-foreground-muted text-lg leading-relaxed max-w-xl">
                    Founder of Roadman Cycling. Host of the Roadman Cycling
                    Podcast, with over 1,400 on-the-record conversations with
                    World Tour coaches, sports scientists, and professional
                    riders. Based in Dublin, Ireland.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                // Total catalogue across Apple Podcasts and Spotify — the
                // headline trust claim. The on-camera (YouTube) count is a
                // smaller but distinct stat and lives in `Video Episodes`.
                { label: "Podcast Episodes", value: BRAND_STATS.episodeCountLabel },
                { label: "Video Episodes", value: BRAND_STATS.videoEpisodesLabel },
                { label: "Expert Guests", value: `${stats.guests}+` },
                { label: "Monthly Listeners", value: BRAND_STATS.monthlyListenersLabel },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  <p className="font-heading text-2xl md:text-3xl text-coral mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-foreground-subtle font-heading tracking-wider">
                    {stat.label.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
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
                  {credentials.map((c) => (
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
                  {expertise.map((e) => (
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

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <h2 className="font-heading text-xl text-off-white tracking-wide mb-6">
              RECENT ARTICLES
            </h2>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block p-4 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {post.excerpt.slice(0, 120)}
                    {post.excerpt.length > 120 ? "..." : ""}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button href="/blog" variant="ghost" size="sm">
                All {stats.blogPosts} Articles
              </Button>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-heading text-xl text-off-white tracking-wide mb-3">
                WORK WITH ANTHONY
              </h2>
              <p className="text-foreground-muted text-sm max-w-md mb-6">
                1:1 personalised coaching across five pillars: training,
                nutrition, strength, recovery, and accountability. $195/month
                with a 7-day free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/apply">Apply for Coaching</Button>
                <Button href="/coaching" variant="ghost">
                  How Coaching Works
                </Button>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs font-heading tracking-wider">
              <a
                href="https://youtube.com/@theroadmanpodcast"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-foreground-muted hover:text-coral transition-colors"
              >
                YOUTUBE
              </a>
              <a
                href="https://instagram.com/roadman.cycling"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-foreground-muted hover:text-coral transition-colors"
              >
                INSTAGRAM
              </a>
              <a
                href="https://x.com/Roadman_Podcast"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-foreground-muted hover:text-coral transition-colors"
              >
                X / TWITTER
              </a>
              <a
                href="https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-foreground-muted hover:text-coral transition-colors"
              >
                SPOTIFY
              </a>
              <a
                href="https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-foreground-muted hover:text-coral transition-colors"
              >
                APPLE PODCASTS
              </a>
            </div>

            <EmailCapture
              variant="inline"
              heading="GET ANTHONY'S WEEKLY NEWSLETTER"
              subheading="The sharpest cycling insights from the podcast, every Saturday."
              source="author-page"
              className="mt-12"
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
