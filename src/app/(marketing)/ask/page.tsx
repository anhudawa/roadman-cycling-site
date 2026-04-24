import type { Metadata } from "next";
import { Footer, Header } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { AskRoadmanClient } from "@/components/features/ask/AskRoadmanClient";

export const metadata: Metadata = {
  title: "Ask Roadman — the cycling performance assistant",
  description:
    "Ask Roadman: the on-site cycling performance assistant. Grounded in 100M+ downloads of conversations with Dan Lorang, Professor Seiler, Dr David Dunne and the Roadman guest roster. Honest, cited, on-brand answers for serious amateur cyclists.",
  alternates: { canonical: "https://roadmancycling.com/ask" },
  openGraph: {
    title: "Ask Roadman",
    description:
      "The on-site cycling performance assistant from Roadman Cycling. Grounded answers for serious riders.",
    type: "website",
    url: "https://roadmancycling.com/ask",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default function AskPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Ask Roadman",
          description:
            "On-site cycling performance assistant grounded in the Roadman Cycling content library.",
          url: "https://roadmancycling.com/ask",
          applicationCategory: "HealthApplication",
          isAccessibleForFree: true,
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes ask-blink { 0%,100%{opacity:1} 50%{opacity:0} }`,
        }}
      />
      <Header />
      <main id="main-content" className="bg-charcoal">
        {/* Hero */}
        <div className="relative border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-20 pb-6">
            <p className="font-heading text-coral tracking-widest text-xs uppercase mb-3">
              Ask Roadman
            </p>
            <h1
              className="font-heading text-off-white leading-[0.95] mb-3"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              CYCLING IS HARD.<br />
              THIS WILL HELP.
            </h1>
            <p className="text-foreground-muted max-w-2xl text-base md:text-lg leading-relaxed">
              Trained on 100M+ downloads of Roadman Cycling Podcast conversations
              with World Tour coaches, sports scientists and pro cyclists. Straight
              answers, cited to the source.
            </p>
          </div>
        </div>

        {/* Chat */}
        <div className="max-w-5xl mx-auto px-0 md:px-6">
          <div className="bg-charcoal md:bg-white/[0.01] md:rounded-xl md:my-6 md:border md:border-white/10 h-[calc(100vh-220px)] md:h-[72vh] flex flex-col overflow-hidden">
            <AskRoadmanClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
