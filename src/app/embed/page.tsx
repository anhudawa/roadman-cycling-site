import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { EmbedCodeBox } from "@/components/embed/EmbedCodeBox";
import { SPORTIVE_EVENTS } from "@/lib/tools/calculators";

export const metadata: Metadata = {
  title: { absolute: "Embeddable Cycling Calculators — Roadman Cycling" },
  description:
    "Free embeddable widgets for cycling sites and coaches: FTP zones calculator, sportive finish-time predictor, and carbs-per-hour fuelling planner. Copy a single iframe snippet.",
  alternates: { canonical: "https://roadmancycling.com/embed" },
};

const SITE_URL = "https://roadmancycling.com";

interface EmbedSpec {
  id: string;
  title: string;
  blurb: string;
  benefits: string[];
  /** Relative path on this site — used for the live-preview iframe. */
  path: string;
  /** Production URL (always roadmancycling.com) — used in the copy-paste snippet. */
  snippetSrc: string;
  width: string;
  height: number;
  iframeTitle: string;
  toolPath: string;
}

const EMBEDS: EmbedSpec[] = [
  {
    id: "ftp-zones",
    title: "FTP Power Zones",
    blurb:
      "Enter an FTP and read off all seven Coggan-style training zones (active recovery → neuromuscular). The same zone definitions used inside the Not Done Yet coaching.",
    benefits: [
      "7 zones — Z1 recovery to Z7 neuromuscular",
      "Watts per zone, calculated live",
      "Reads from your site's width — drops in clean",
    ],
    path: "/embed/ftp-zones",
    snippetSrc: `${SITE_URL}/embed/ftp-zones`,
    width: "100%",
    height: 720,
    iframeTitle: "Roadman Cycling — FTP Power Zones Calculator",
    toolPath: "/tools/ftp-zones",
  },
  {
    id: "race-predictor",
    title: "Sportive Finish-Time Predictor",
    blurb:
      "Pick an event, enter FTP and weight, drag the pacing slider — get a finish-time estimate using the same power-balance physics the full Roadman race predictor runs on.",
    benefits: [
      `${SPORTIVE_EVENTS.length} preset events (Marmotte, Étape, Maratona, Mallorca 312…) plus custom`,
      "Pacing slider 55-90% of FTP",
      "Returns total time, average km/h, average watts and W/kg",
    ],
    path: "/embed/race-predictor",
    snippetSrc: `${SITE_URL}/embed/race-predictor`,
    width: "100%",
    height: 700,
    iframeTitle: "Roadman Cycling — Sportive Finish-Time Predictor",
    toolPath: "/tools/race-predictor",
  },
  {
    id: "fuelling",
    title: "Carbs-per-Hour Fuelling",
    blurb:
      "Weight + duration + average watts + session type → grams of carbs, ml of fluid, mg of sodium per hour. Built on Coyle, Romijn, Jeukendrup and Sawka.",
    benefits: [
      "Evidence-based: glucose/fructose split above 60g/hr",
      "Gut-training ceilings (none / some / trained)",
      "Total carbs, total fluid, feeding interval, start time",
    ],
    path: "/embed/fuelling",
    snippetSrc: `${SITE_URL}/embed/fuelling`,
    width: "100%",
    height: 600,
    iframeTitle: "Roadman Cycling — Carbs-per-Hour Fuelling Calculator",
    toolPath: "/tools/fuelling",
  },
];

export default function EmbedLandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" className="pt-32 pb-16">
          <Container width="narrow">
            <p className="font-heading tracking-wider text-coral text-sm uppercase mb-3">
              Free for cycling sites & coaches
            </p>
            <h1 className="font-heading uppercase text-4xl md:text-6xl tracking-wider text-off-white mb-4">
              Embeddable cycling calculators
            </h1>
            <p className="text-foreground-muted text-lg leading-relaxed">
              Drop a single line of HTML on any blog, coaching site, or
              training-plan landing page. Three widgets, fully self-contained,
              no JavaScript dependencies, no API key. They link back to{" "}
              <Link
                href="/"
                className="text-coral hover:text-coral-hover underline-offset-2 hover:underline"
              >
                roadmancycling.com
              </Link>{" "}
              for credit.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="py-16">
          <Container>
            <div className="space-y-16">
              {EMBEDS.map((embed) => (
                <article
                  key={embed.id}
                  id={embed.id}
                  className="grid gap-6 md:grid-cols-[1fr,minmax(0,420px)] md:gap-10 items-start"
                >
                  <div>
                    <h2 className="font-heading uppercase tracking-wider text-2xl md:text-3xl text-off-white mb-3">
                      {embed.title}
                    </h2>
                    <p className="text-foreground-muted leading-relaxed mb-4">
                      {embed.blurb}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {embed.benefits.map((b) => (
                        <li
                          key={b}
                          className="text-sm text-foreground-muted pl-5 relative"
                        >
                          <span
                            aria-hidden
                            className="absolute left-0 top-2 w-2 h-2 rounded-full bg-coral"
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <EmbedCodeBox
                      src={embed.snippetSrc}
                      width={embed.width}
                      height={embed.height}
                      title={embed.iframeTitle}
                      previewUrl={embed.path}
                    />
                    <p className="text-xs text-foreground-subtle mt-3">
                      Suggested size: {embed.width} ×{" "}
                      <span className="font-mono tabular-nums">{embed.height}px</span>.
                      Resize to fit — the widget adapts.{" "}
                      <Link
                        href={embed.toolPath}
                        className="underline underline-offset-2 hover:text-coral"
                      >
                        Full version →
                      </Link>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 overflow-hidden bg-[#1B1B1C] shadow-card">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                        Live preview
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-foreground-subtle">
                        {embed.width} × {embed.height}px
                      </span>
                    </div>
                    <iframe
                      src={embed.path}
                      title={`${embed.iframeTitle} — preview`}
                      width="100%"
                      height={embed.height}
                      style={{ border: 0, display: "block", width: "100%" }}
                      loading="lazy"
                    />
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" className="py-16">
          <Container width="narrow">
            <h2 className="font-heading uppercase tracking-wider text-2xl md:text-3xl text-off-white mb-4">
              How to use
            </h2>
            <ol className="space-y-3 text-foreground-muted">
              <li>
                <strong className="text-off-white">1. Copy the snippet</strong>{" "}
                — click <em>Copy</em> next to any widget above. The copied HTML
                is a standard <code className="text-coral">&lt;iframe&gt;</code>{" "}
                with{" "}
                <code className="text-coral">loading=&quot;lazy&quot;</code> so
                it doesn&apos;t block your page&apos;s LCP.
              </li>
              <li>
                <strong className="text-off-white">2. Paste it anywhere</strong>{" "}
                — WordPress (in a Custom HTML block), Squarespace (Code block),
                Webflow (Embed element), Ghost, Shopify, plain HTML — any
                surface that allows iframes.
              </li>
              <li>
                <strong className="text-off-white">3. Resize if you want</strong>{" "}
                — change the{" "}
                <code className="text-coral">width</code> and{" "}
                <code className="text-coral">height</code> attributes. The
                widget adapts down to ~320px wide.
              </li>
            </ol>
            <p className="text-sm text-foreground-subtle mt-6">
              Use of these embeds is free. The footer credit (&ldquo;Powered by
              Roadman Cycling&rdquo;) must remain visible — that&apos;s the
              only string attached.
            </p>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
