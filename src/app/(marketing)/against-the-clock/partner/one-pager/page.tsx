import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND_STATS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";
import { PrintButton } from "./PrintButton";

const PAGE_URL = `${SITE_ORIGIN}/against-the-clock/partner/one-pager`;

/* Brand palette — inlined so colours print exactly (print-color-adjust) */
const PURPLE = "#4C1273";
const DEEP_PURPLE = "#210140";
const CORAL = "#F16363";
const DARK = "#252526";
const OFF_WHITE = "#FAFAFA";
const MUTED = "#545559";

export const metadata: Metadata = {
  title: "Against the Clock — Media Kit One-Pager | Roadman Cycling",
  description:
    "The Against the Clock media kit, on a single printable page. Audience, reach, content scope, partnership tiers, and production quality for watch brands.",
  alternates: { canonical: PAGE_URL },
  robots: { index: false, follow: true },
};

const audience = [
  { k: "Age", v: "35–55" },
  { k: "Gender", v: "Predominantly male" },
  { k: "Profile", v: "Career professionals" },
  { k: "Spend", v: "High disposable income" },
];

const reach = [
  { stat: BRAND_STATS.podcastDownloadsLabel, label: "Podcast downloads" },
  { stat: BRAND_STATS.episodeCountLabel, label: "Episodes published" },
  { stat: BRAND_STATS.youtubeSubscribersLabel, label: "YouTube subscribers" },
  { stat: BRAND_STATS.newsletterSubscribersLabel, label: "Newsletter subscribers" },
  { stat: BRAND_STATS.instagramFollowersLabel, label: "Instagram followers" },
  { stat: BRAND_STATS.communityMembersLabel, label: "Community members" },
];

const scope = [
  {
    title: "The Hour Record",
    body: "Cycling's purest test against time — the furthest a rider can travel in sixty minutes on a velodrome.",
  },
  {
    title: "The Race of Truth",
    body: "The individual time trial — contre la montre, literally “against the watch.” The clock is the only judge.",
  },
  {
    title: "Horology Culture",
    body: "The chronograph and the time trial share their DNA. The story runs from the velodrome to the watch on the wrist.",
  },
];

const tiers = [
  {
    name: "Title Sponsor",
    line: "Against the Clock, presented by your brand — naming across the hub, feature, and episodes.",
  },
  {
    name: "Episode Sponsor",
    line: "Host-read integration in a themed episode, show-notes link, a social cut, and a newsletter mention.",
  },
  {
    name: "Product Placement",
    line: "Your timepiece styled into video episodes and photography — a watch on the wrist, on camera.",
  },
];

const production = [
  `On-camera studio — ${BRAND_STATS.videoEpisodesLabel} episodes filmed for video`,
  "World Tour access — coaches, scientists, and Grand Tour riders",
  "Long-form craft — hour-long interviews, carefully edited",
  "Published editorial standards — every claim sourced",
  "Multi-format masters from a single shoot",
  "Own-channel usage rights to the work we create together",
];

export default function AgainstTheClockOnePager() {
  return (
    <>
      {/* Print-only stylesheet: drop screen chrome, full-bleed the sheet */}
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        .atc-screen { background: ${DARK}; }
        .atc-sheet { background: ${OFF_WHITE}; }
        .atc-sheet, .atc-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .atc-screen { background: #fff !important; padding: 0 !important; }
          .atc-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="atc-screen min-h-screen w-full flex flex-col items-center py-8 px-4">
        {/* On-screen toolbar */}
        <div className="no-print w-full max-w-[820px] flex items-center justify-between mb-5">
          <a
            href="/against-the-clock/partner"
            className="font-heading uppercase tracking-wider text-sm"
            style={{ color: OFF_WHITE }}
          >
            &larr; Back to the media kit
          </a>
          <PrintButton />
        </div>

        {/* The printable sheet */}
        <article
          className="atc-sheet w-full max-w-[820px] rounded-sm overflow-hidden"
          style={{
            color: DARK,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            fontFamily: "var(--font-body)",
          }}
        >
          {/* Masthead */}
          <header style={{ background: PURPLE, color: OFF_WHITE, padding: "22px 28px" }}>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p
                  className="font-heading"
                  style={{ color: CORAL, letterSpacing: "0.2em", fontSize: "11px", marginBottom: "4px" }}
                >
                  MEDIA KIT &middot; CYCLING &times; HOROLOGY
                </p>
                <h1
                  className="font-heading"
                  style={{ fontSize: "40px", lineHeight: 1, letterSpacing: "0.02em" }}
                >
                  AGAINST THE CLOCK
                </h1>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="font-heading" style={{ fontSize: "16px", letterSpacing: "0.08em" }}>
                  ROADMAN CYCLING
                </p>
                <p style={{ fontSize: "10px", color: "rgba(250,250,250,0.7)" }}>
                  The world&apos;s largest cycling performance podcast
                </p>
              </div>
            </div>
            <div style={{ height: "3px", background: CORAL, marginTop: "16px" }} />
            <p style={{ fontSize: "12px", lineHeight: 1.5, marginTop: "14px", color: "rgba(250,250,250,0.92)" }}>
              A partnership platform for watch brands. Where the sport&apos;s oldest obsession —
              riding against the clock — meets fine watchmaking, in front of an audience that
              already lives at the intersection of precision, performance, and time.
            </p>
          </header>

          <div style={{ padding: "24px 28px" }}>
            {/* Audience */}
            <Section title="The Audience" coral={CORAL} dark={DARK}>
              <div className="grid grid-cols-4 gap-3">
                {audience.map((a) => (
                  <div key={a.k}>
                    <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
                      {a.k}
                    </p>
                    <p className="font-heading" style={{ fontSize: "17px", color: PURPLE, lineHeight: 1.1, marginTop: "2px" }}>
                      {a.v}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Reach */}
            <Section title="The Reach" coral={CORAL} dark={DARK}>
              <div className="grid grid-cols-3 gap-y-4 gap-x-3">
                {reach.map((r) => (
                  <div key={r.label}>
                    <p className="font-heading" style={{ fontSize: "26px", color: CORAL, lineHeight: 1 }}>
                      {r.stat}
                    </p>
                    <p style={{ fontSize: "10px", color: MUTED, marginTop: "2px" }}>{r.label}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "9px", color: MUTED, marginTop: "10px", fontStyle: "italic" }}>
                Lifetime, verified figures across all platforms.
              </p>
            </Section>

            {/* Two-column: scope + production */}
            <div className="grid grid-cols-2 gap-7">
              <Section title="The Content Hub" coral={CORAL} dark={DARK}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {scope.map((s) => (
                    <li key={s.title}>
                      <p className="font-heading" style={{ fontSize: "13px", color: PURPLE, letterSpacing: "0.04em" }}>
                        {s.title.toUpperCase()}
                      </p>
                      <p style={{ fontSize: "10.5px", color: DARK, lineHeight: 1.4 }}>{s.body}</p>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Production Quality" coral={CORAL} dark={DARK}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {production.map((p) => (
                    <li key={p} style={{ display: "flex", gap: "7px", fontSize: "10.5px", lineHeight: 1.35, color: DARK }}>
                      <span style={{ color: CORAL }}>&mdash;</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Tiers */}
            <Section title="Partnership Tiers" coral={CORAL} dark={DARK}>
              <div className="grid grid-cols-3 gap-3">
                {tiers.map((t, i) => (
                  <div
                    key={t.name}
                    style={{
                      border: `1px solid ${i === 0 ? CORAL : "rgba(37,37,38,0.15)"}`,
                      borderRadius: "6px",
                      padding: "12px",
                      background: i === 0 ? "rgba(241,99,99,0.06)" : "transparent",
                    }}
                  >
                    {i === 0 && (
                      <p className="font-heading" style={{ fontSize: "8px", letterSpacing: "0.16em", color: CORAL, marginBottom: "4px" }}>
                        FLAGSHIP
                      </p>
                    )}
                    <p className="font-heading" style={{ fontSize: "14px", color: PURPLE, letterSpacing: "0.03em" }}>
                      {t.name.toUpperCase()}
                    </p>
                    <p style={{ fontSize: "10px", color: DARK, lineHeight: 1.4, marginTop: "4px" }}>{t.line}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "9px", color: MUTED, marginTop: "8px", letterSpacing: "0.08em" }}>
                Tiers combine, or we build something bespoke around your launch calendar. Pricing on enquiry.
              </p>
            </Section>
          </div>

          {/* Contact footer */}
          <footer
            style={{
              background: DEEP_PURPLE,
              color: OFF_WHITE,
              padding: "18px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="font-heading" style={{ fontSize: "16px", letterSpacing: "0.04em" }}>
                PUT YOUR BRAND ON THE WRIST
              </p>
              <p style={{ fontSize: "10px", color: "rgba(250,250,250,0.7)" }}>
                Most enquiries answered within 48 hours.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="font-heading" style={{ fontSize: "15px", color: CORAL }}>
                {FOUNDER.email}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(250,250,250,0.7)" }}>
                roadmancycling.com/against-the-clock/partner
              </p>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

/* Small section wrapper with a coral-ruled heading */
function Section({
  title,
  children,
  coral,
  dark,
}: {
  title: string;
  children: ReactNode;
  coral: string;
  dark: string;
}) {
  return (
    <section style={{ marginBottom: "20px" }}>
      <h2
        className="font-heading"
        style={{
          fontSize: "13px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: dark,
          borderBottom: `2px solid ${coral}`,
          paddingBottom: "5px",
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
