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
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";

const APP_URL = ROADMAN_APP_PRODUCT.canonicalUrl;
const APP_DESCRIPTION = ROADMAN_APP_PRODUCT.description;
const STRUCTURED_IMAGE_URL = `${SITE_ORIGIN}/api/og/blog-hero?title=${encodeURIComponent("Good Legs by Roadman")}&pillar=strength`;

export const metadata: Metadata = {
  title: { absolute: "Good Legs by Roadman | Cycling Strength & Recovery App" },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: APP_URL,
    types: { "application/json": ROADMAN_APP_PRODUCT.feedUrl },
  },
  openGraph: {
    title: "Good Legs by Roadman — The ride is only half the story.",
    description: APP_DESCRIPTION,
    type: "website",
    url: APP_URL,
    siteName: "Roadman Cycling",
    images: [
      {
        url: STRUCTURED_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Good Legs by Roadman: strength and recovery for cyclists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Good Legs by Roadman | Cycling Strength & Recovery App",
    description: APP_DESCRIPTION,
    images: [STRUCTURED_IMAGE_URL],
  },
};

const FAQS = [
  {
    question: "When can I use Good Legs?",
    answer: "Good Legs is in development for iPhone. You can join the beta waitlist at getgoodlegs.com. Joining the list does not guarantee an invitation. We have not announced a public launch date or standalone price.",
  },
  {
    question: "Is it included with Not Done Yet?",
    answer: "Yes. Not Done Yet members will receive Good Legs access at launch as part of their membership. It will cover strength and recovery alongside their cycling coaching, nutrition guidance and community.",
  },
  {
    question: "How does it fit around my riding?",
    answer: "Enter your planned rides and available gym time. Good Legs uses that week to place strength sessions and recovery work, with the hardest rides taken into account.",
  },
  {
    question: "Do I need a wearable?",
    answer: "No. The daily check-in asks about sleep, energy and soreness. You can use Good Legs without a watch or other wearable.",
  },
  {
    question: "What happens if I miss a gym session?",
    answer: "Missed work is not added to the next session. The aim is to help you return to a routine you can keep alongside your riding.",
  },
] as const;

function Waitlist({ placement }: { placement: "hero" | "bottom" }) {
  return <Suspense fallback={<AppEarlyAccessCaptureFallback placement={placement} />}>
    <AppEarlyAccessCapture placement={placement} />
  </Suspense>;
}

export default function AppLandingPage() {
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage", "@id": `${APP_URL}#webpage`, url: APP_URL,
          name: ROADMAN_APP_PRODUCT.name, description: APP_DESCRIPTION,
          dateModified: ROADMAN_APP_PRODUCT.updatedDate,
          publisher: { "@id": ENTITY_IDS.organization },
          about: { "@id": `${APP_URL}#software` },
          primaryImageOfPage: { "@type": "ImageObject", url: STRUCTURED_IMAGE_URL },
          subjectOf: { "@type": "DataFeed", url: ROADMAN_APP_PRODUCT.feedUrl },
        },
        {
          "@type": ["SoftwareApplication", "MobileApplication"],
          "@id": `${APP_URL}#software`, name: ROADMAN_APP_PRODUCT.name,
          url: APP_URL, sameAs: ROADMAN_APP_PRODUCT.productWebsiteUrl,
          description: APP_DESCRIPTION,
          applicationCategory: ROADMAN_APP_PRODUCT.applicationCategory,
          operatingSystem: ROADMAN_APP_PRODUCT.operatingSystems.join(", "),
          publisher: { "@id": ENTITY_IDS.organization },
          image: STRUCTURED_IMAGE_URL, featureList: ROADMAN_APP_PRODUCT.features,
        },
        {
          "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Good Legs", item: APP_URL },
          ],
        },
      ],
    }} />
    <FAQSchema faqs={[...FAQS]} />
    <Header />
    <main id="main-content">
      <Section background="deep-purple" grain className="pt-32 md:pt-40">
        <Container>
          <p className="mb-6 font-heading text-sm tracking-[0.2em] text-coral">GOOD LEGS BY ROADMAN</p>
          <h1 className="max-w-5xl font-heading leading-[0.98] text-off-white" style={{ fontSize: "clamp(3.1rem, 7vw, 6.8rem)" }}>
            The ride is only<br /><span className="text-coral">half the story.</span>
          </h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-foreground-muted md:text-xl">
              <p>The long ride is in the diary. The gym is still a vague intention, and recovery is whatever time remains before bed.</p>
              <p>Good Legs is the strength and recovery app we’re building at Roadman. Plan your gym sessions, record your lifts and follow your progress. Give recovery the same attention, with daily guidance that takes your sleep, energy and soreness into account.</p>
            </div>
            <div className="self-end"><Waitlist placement="hero" /></div>
          </div>
        </Container>
      </Section>

      <Section background="charcoal">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <article>
              <p className="font-heading text-sm tracking-[0.2em] text-coral">01 / IN THE GYM</p>
              <h2 className="mt-4 font-heading text-4xl leading-tight text-off-white md:text-5xl">Pick up where you left off.</h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground-muted">
                <p>The useful detail is what happened last time: the weight on the bar, the reps you completed and how hard they felt. Good Legs keeps that record beside the next session, so you can see what you’re being asked to do and why.</p>
                <p>Choose the time you have for strength. Log the sets as you go. If the rack is taken, an exercise swap keeps the same movement in the session.</p>
              </div>
            </article>
            <article>
              <p className="font-heading text-sm tracking-[0.2em] text-coral">02 / BETWEEN SESSIONS</p>
              <h2 className="mt-4 font-heading text-4xl leading-tight text-off-white md:text-5xl">Some days call for less.</h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground-muted">
                <p>Sleep, energy and soreness help put today’s session in context. On a low-recovery day, Good Legs can take working sets out while holding the loads. It explains the adjustment so you know what to do when you reach the gym.</p>
                <p>Recovery has a place in the diary too: time for sleep, mobility or a short breathing session. When the plan changes, the assistant coach explains the decision and what to do next.</p>
              </div>
            </article>
          </div>
        </Container>
      </Section>

      <Section background="off-white" id="how-it-works">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="font-heading text-sm tracking-[0.2em] text-coral">03 / FINDING THE DAY</p>
              <h2 className="mt-4 font-heading text-charcoal" style={{ fontSize: "var(--text-section)" }}>Thursday matters.</h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-charcoal/75">
              <p>A free evening isn’t always a good evening to lift. Wednesday might be empty in the diary, but a hard gym session then can follow you into Thursday’s ride.</p>
              <p>Good Legs looks at the riding on either side of a possible gym session. In the example below, Thursday’s threshold work puts strength on Friday. If your gym day is fixed, the app adjusts the strength session to fit.</p>
            </div>
          </div>
          <div className="mt-10 overflow-x-auto rounded-xl border border-charcoal/15">
            <table className="w-full border-collapse text-left text-sm text-charcoal sm:text-base">
              <caption className="p-5 text-left text-sm text-charcoal/65">An example week from Good Legs: strength on Friday, after Thursday’s threshold ride.</caption>
              <thead><tr className="border-y border-charcoal/15 bg-charcoal/[0.04]">
                <th scope="col" className="p-4">Day</th><th scope="col" className="p-4">Your riding</th><th scope="col" className="p-4">Strength</th>
              </tr></thead>
              <tbody>
                {[
                  ["Monday", "Recovery ride", "—"], ["Tuesday", "Intervals", "—"], ["Wednesday", "No ride planned", "—"],
                  ["Thursday", "Threshold", "—"], ["Friday", "No ride planned", "Gym session"],
                  ["Saturday", "Easy ride", "—"], ["Sunday", "Long ride", "—"],
                ].map(([day, ride, gym]) => <tr key={day} className={`border-b border-charcoal/10 last:border-0 ${day === "Friday" ? "bg-coral/10" : ""}`}>
                  <th scope="row" className="p-4 font-semibold">{day}</th><td className="p-4">{ride}</td><td className="p-4">{gym}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/60">Friday suits this example; the right day depends on your own week.</p>
        </Container>
      </Section>

      <Section background="off-white">
        <Container width="narrow">
          <p className="font-heading text-sm tracking-[0.2em] text-coral">FROM ROADMAN</p>
          <h2 className="mt-4 font-heading text-charcoal" style={{ fontSize: "var(--text-section)" }}>Why we’re building it.</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/75">
            <p>The Roadman podcast has spent years asking riders, coaches and researchers how training works in practice. Good Legs takes on one recurring problem: fitting the work off the bike into a week already full of riding.</p>
            <p>It’s also part of what we’re building for <Link href="/community/not-done-yet" className="underline decoration-coral underline-offset-4">Not Done Yet</Link>. Members will receive Good Legs access at launch for strength and recovery. Cycling coaching, nutrition guidance and the community complete Roadman’s five pillars.</p>
            <p>For now, our coaches continue to support members with strength and recovery. The app is still in development.</p>
          </div>
        </Container>
      </Section>

      <Section background="charcoal" id="faq">
        <Container width="narrow">
          <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>Before you join.</h2>
          <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
            {FAQS.map(faq => <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-xl text-off-white">{faq.question}<span aria-hidden="true" className="text-coral group-open:rotate-45">+</span></summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-foreground-muted">{faq.answer}</p>
            </details>)}
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" id="early-access">
        <Container width="narrow">
          <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>A closer look at Good Legs.</h2>
          <p className="mb-7 mt-5 text-lg leading-relaxed text-foreground-muted">See the product, read about the research behind it and put your name down for the iPhone beta.</p>
          <Waitlist placement="bottom" />
        </Container>
      </Section>

      <Section background="charcoal" className="!py-12">
        <Container>
          <nav aria-label="More about Good Legs" className="flex flex-wrap gap-x-7 gap-y-4 text-sm text-foreground-muted">
            <Link href="/app/masters" className="underline">Good Legs for riders over 40</Link>
            <Link href="/tools/strength-session-planner" className="underline">Try the strength planner</Link>
            <Link href="/blog/cycling-strength-training-guide" className="underline">Strength training guide</Link>
            <Link href="/blog/cycling-recovery-tips" className="underline">Recovery guide</Link>
            <Link href="/app/methodology" className="underline">How training decisions are made</Link>
            <Link href="/app/testing" className="underline">Testing plans</Link>
            <Link href="/app/evidence" className="underline">Research and product evidence</Link>
          </nav>
        </Container>
      </Section>
    </main>
    <Footer />
  </>;
}
