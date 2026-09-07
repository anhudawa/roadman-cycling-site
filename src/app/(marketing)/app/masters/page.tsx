import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AppEarlyAccessCapture,
  AppEarlyAccessCaptureFallback,
} from "@/components/features/conversion/AppEarlyAccessCapture";
import { Container, Footer, Header, Section } from "@/components/layout";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = ROADMAN_APP_PRODUCT.mastersSegmentUrl;
const DESCRIPTION =
  "Good Legs by Roadman is an upcoming strength and recovery app for cyclists over 40. Fit the gym around your riding, experience and time to recover.";
const IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Cycling App for Masters Cyclists")}&pillar=strength`;

export const metadata: Metadata = {
  title: { absolute: "Cycling App for Masters Cyclists Over 40 | Roadman" },
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    types: { "application/json": ROADMAN_APP_PRODUCT.feedUrl },
  },
  openGraph: {
    title: "Cycling Strength & Recovery App for Riders Over 40",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "Roadman Cycling",
    images: [
      {
        url: IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Roadman cycling app for masters cyclists over 40",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling App for Masters Cyclists Over 40 | Roadman",
    description: DESCRIPTION,
    images: [IMAGE_URL],
  },
};

const FAQS = [
  {
    question: "Is Good Legs a separate app for older riders?",
    answer: "No. Good Legs is for cyclists, including riders over 40 and over 50. Your lifting experience, riding week and response to training matter when choosing the work.",
  },
  {
    question: "Can I keep working with my cycling coach?",
    answer: "Yes. Good Legs is a strength and recovery app. Enter the week you’re riding so the gym sessions fit alongside your coach’s programme.",
  },
  {
    question: "What if I have never lifted before?",
    answer: "Start with help learning the movements and choosing suitable loads. A strength app cannot replace someone checking your technique in person. If pain or a health condition affects your training, get appropriate professional advice before starting.",
  },
  {
    question: "When will it be available?",
    answer: "Good Legs is in development for iPhone. The beta waitlist is open at getgoodlegs.com; a public release date and standalone price have not been announced. Not Done Yet members will receive access at launch as part of their membership.",
  },
] as const;

function MastersAppCapture({ placement }: { placement: "hero" | "bottom" }) {
  return <Suspense fallback={<AppEarlyAccessCaptureFallback placement={placement} acquisitionSource="masters-app" />}>
    <AppEarlyAccessCapture placement={placement} acquisitionSource="masters-app" />
  </Suspense>;
}

export default function MastersCyclingAppPage() {
  return <>
    <JsonLd data={{
      "@context": "https://schema.org", "@graph": [
        {
          "@type": "WebPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL,
          name: "Good Legs for cyclists over 40", description: DESCRIPTION,
          dateModified: ROADMAN_APP_PRODUCT.updatedDate,
          about: [{ "@id": `${ROADMAN_APP_PRODUCT.canonicalUrl}#software` }, { "@type": "Thing", name: "Masters cycling" }],
          publisher: { "@id": ENTITY_IDS.organization },
          primaryImageOfPage: { "@type": "ImageObject", url: IMAGE_URL },
        },
        {
          "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Good Legs", item: ROADMAN_APP_PRODUCT.canonicalUrl },
            { "@type": "ListItem", position: 3, name: "Cyclists over 40", item: PAGE_URL },
          ],
        },
      ],
    }} />
    <FAQSchema faqs={[...FAQS]} />
    <Header />
    <main id="main-content">
      <Section background="deep-purple" grain className="pt-32 md:pt-40">
        <Container width="narrow">
          <p className="font-heading text-sm tracking-[0.2em] text-coral">GOOD LEGS BY ROADMAN / CYCLISTS OVER 40</p>
          <h1 className="mt-6 font-heading leading-[1.02] text-off-white" style={{ fontSize: "clamp(3rem, 6.5vw, 6rem)" }}>Still making plans.</h1>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-foreground-muted md:text-xl">
            <p>The event is in the diary. So are the school run, the late meeting and the weekend away. You still want to ride well, and strength work needs a place in that week.</p>
            <p>Good Legs is the app we’re building to help with it. It brings strength and recovery around your cycling, taking account of the work you’ve done and how you feel today.</p>
          </div>
          <div className="mt-8"><MastersAppCapture placement="hero" /></div>
        </Container>
      </Section>

      <Section background="off-white">
        <Container width="narrow">
          <h2 className="font-heading text-charcoal" style={{ fontSize: "var(--text-section)" }}>Start with the rider.</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/75">
            <p>A rider who has lifted for twenty years arrives at the gym with different experience from someone starting at 45. Both might have the same Sunday ride planned. They need different starting points in the gym.</p>
            <p>Good Legs uses your training history, available equipment and riding week to help choose and place the strength work. The record of your previous session gives the next one a starting point.</p>
            <p>Age is relevant to training, but it cannot tell the whole story. The practical questions are how much work you’re accustomed to, what you’re preparing for and whether you’re recovering well enough to keep training.</p>
          </div>
        </Container>
      </Section>

      <Section background="charcoal">
        <Container width="narrow">
          <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>Leave something for the ride.</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground-muted">
            <p>That midweek gap can be tempting. Before putting strength into it, Good Legs looks at the cycling that follows. When your gym days are fixed, it adjusts the strength session around them.</p>
            <p>A short daily check-in asks about sleep, energy and soreness. On a low-recovery day, the app can reduce working sets while holding the loads. The assistant coach explains the change.</p>
            <p>The aim is a strength routine you can keep through the season, with enough recovery to make the next session worthwhile.</p>
          </div>
          <Link href="/app" className="mt-7 inline-block text-coral underline underline-offset-4">See a Good Legs week →</Link>
        </Container>
      </Section>

      <Section background="off-white">
        <Container width="narrow">
          <h2 className="font-heading text-charcoal" style={{ fontSize: "var(--text-section)" }}>Part of Not Done Yet.</h2>
          <p className="mt-6 text-lg leading-relaxed text-charcoal/75">Not Done Yet members will receive Good Legs access at launch. It will provide the strength and recovery part of the membership, alongside cycling coaching, nutrition guidance and a community of riders with their own plans for the season.</p>
          <Link href="/community/not-done-yet" className="mt-6 inline-block text-charcoal underline decoration-coral underline-offset-4">Read about the membership →</Link>
        </Container>
      </Section>

      <Section background="charcoal" id="faq">
        <Container width="narrow">
          <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>A few practical questions.</h2>
          <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
            {FAQS.map(faq => <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-xl text-off-white">{faq.question}<span aria-hidden="true" className="text-coral group-open:rotate-45">+</span></summary>
              <p className="mt-4 leading-relaxed text-foreground-muted">{faq.answer}</p>
            </details>)}
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" id="early-access">
        <Container width="narrow">
          <h2 className="mb-7 font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>Follow the build.</h2>
          <MastersAppCapture placement="bottom" />
        </Container>
      </Section>

      <Section background="charcoal" className="!py-12">
        <Container>
          <nav aria-label="Training after 40" className="flex flex-wrap gap-x-7 gap-y-4 text-sm text-foreground-muted">
            <Link href="/masters" className="underline">Cycling after 40</Link>
            <Link href="/blog/strength-training-cyclists-over-40-what-works" className="underline">Starting strength work</Link>
            <Link href="/blog/cycling-recovery-tips" className="underline">Recovery guide</Link>
            <Link href="/tools/strength-session-planner" className="underline">Try the strength planner</Link>
          </nav>
        </Container>
      </Section>
    </main>
    <Footer />
  </>;
}
