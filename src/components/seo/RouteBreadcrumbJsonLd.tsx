"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "./JsonLd";
import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * Site-wide BreadcrumbList JSON-LD, derived from the current pathname.
 *
 * Mounted once in the root layout so every route gets a breadcrumb in
 * structured data without each page needing to declare one.
 *
 * Skips routes whose page already emits a richer BreadcrumbList with
 * the actual page title (blog posts, podcast episodes) — those titles
 * aren't available from the URL alone, so the per-page emission wins
 * and we avoid duplicate markup. Leaf-segment labels for static routes
 * come from `SEGMENT_LABELS`; anything not in the map gets humanised
 * from the slug (e.g. `ftp-zones` → `Ftp Zones`), so an unknown route
 * still gets a usable trail rather than nothing.
 */

const SEGMENT_LABELS: Record<string, string> = {
  about: "About",
  apply: "Apply for Coaching",
  coaching: "Coaching",
  community: "Community",
  clubhouse: "Clubhouse",
  "not-done-yet": "Not Done Yet",
  methodology: "Methodology",
  plateau: "Masters Plateau Diagnostic",
  tools: "Tools",
  "ftp-zones": "FTP Zones Calculator",
  fuelling: "Fuelling Calculator",
  "hr-zones": "Heart Rate Zones Calculator",
  "race-weight": "Race Weight Calculator",
  "energy-availability": "Energy Availability Calculator",
  "tyre-pressure": "Tyre Pressure Calculator",
  "shock-pressure": "Shock Pressure Calculator",
  "masters-ftp-benchmark": "Masters FTP Benchmark",
  "masters-recovery-score": "Masters Recovery Score",
  wkg: "Watts per Kilogram Calculator",
  topics: "Topics",
  guests: "Guests",
  entity: "Entities",
  glossary: "Glossary",
  author: "Authors",
  "anthony-walsh": "Anthony Walsh",
  contact: "Contact",
  press: "Press",
  "editorial-standards": "Editorial Standards",
  search: "Search",
  go: "Get the Plan",
  plan: "Training Plans",
  results: "Results",
  method: "The Roadman Method",
  "fuel-planner": "Fuel Planner",
};

// Routes whose pages already emit their own BreadcrumbList (typically
// with a richer dynamic title — the actual blog post title, episode
// title, guest name, etc.). Skip here so we don't ship two competing
// trails on the same page.
//
// Coverage check ran against the live dev server: any route not
// caught by these patterns falls through to the auto-derived trail
// emitted by this component. If a new page adds its own
// BreadcrumbList, add a pattern here to avoid duplicate JSON-LD.
const SKIP_PATTERNS: RegExp[] = [
  /^\/$/, // homepage — no breadcrumb needed

  // Content surfaces with their own (richer) per-page breadcrumb
  /^\/blog(\/|$)/,
  /^\/podcast(\/|$)/,
  /^\/topics(\/|$)/,
  /^\/glossary(\/|$)/,
  /^\/guests(\/|$)/,
  /^\/entity(\/|$)/,
  /^\/author(\/|$)/,
  /^\/best\//,
  /^\/compare(\/|$)/,
  /^\/event\//,
  /^\/problem\//,
  /^\/question(\/|$)/,
  /^\/you\//,
  /^\/case-studies(\/|$)/,
  /^\/cycling-girona(\/|$)/,
  /^\/inner-circle(\/|$)/,
  /^\/coaching(\/|$)/, // root + [location] + triathletes + segment pages (via SegmentPage)
  /^\/races\/[^/]+/, // /races/[slug] only — root /races has no own breadcrumb
  /^\/predict\/(?!courses$)[^/]+\/?$/, // /predict/[slug] only

  // Static marketing/method pages with their own breadcrumb
  /^\/methodology(\/|$)/,
  /^\/start-here(\/|$)/,
  /^\/research(\/|$)/,
  /^\/editorial-standards(\/|$)/,
  /^\/apply(\/|$)/,
  /^\/assessment(\/|$)/,
  /^\/benchmarks(\/|$)/,
  /^\/plan(\/|$)/,
  /^\/about\/(corrections|expert-reviewers|how-we-coach|how-we-create-content|press)/,
  /^\/apps-vs-coaching(\/|$)/,
  /^\/careers(\/|$)/,
  /^\/event-prep(\/|$)/,
  /^\/facts(\/|$)/,
  /^\/find-your-fit(\/|$)/,
  /^\/masters(\/|$)/,
  /^\/proof(\/|$)/,
  /^\/strength-training$/, // root only — /success below has no own
  /^\/training-camps$/, // root only — sub-routes below have no own

  // Tools with their own breadcrumb (via ToolSchemas wrapper or layout.tsx)
  /^\/tools\/(energy-availability|ftp-zones|fuelling|hr-zones|race-weight|shock-pressure|tyre-pressure|wkg|masters-ftp-benchmark|masters-recovery-score)/,

  // Non-public surfaces — admin, method (auth-gated, noindex), embeds, etc.
  /^\/admin/,
  /^\/method/,
  /^\/embed/,
  /^\/profile/,
  /^\/offline$/,
  /^\/api/,
];

const humanize = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const labelFor = (segment: string) =>
  SEGMENT_LABELS[segment] ?? humanize(segment);

export function RouteBreadcrumbJsonLd() {
  const pathname = usePathname() ?? "/";
  if (SKIP_PATTERNS.some((re) => re.test(pathname))) return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_ORIGIN,
    },
    ...segments.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: labelFor(seg),
      item: `${SITE_ORIGIN}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement,
      }}
    />
  );
}
