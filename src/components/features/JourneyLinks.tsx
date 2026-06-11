import Link from "next/link";
import {
  resolveJourney,
  type FunnelStage,
  type JourneyContentType,
  type JourneyInput,
  type JourneyLink,
  type PersonaSlug,
} from "@/lib/journey";
import { type ContentPillar } from "@/types";

// ============================================
// JourneyLinks — internal-linking engine renderer
// ============================================
//
// The visible side of `resolveJourney`. One component, four
// content surfaces (blog, podcast, tool, persona). Renders three
// zones — Go deeper, Next step, Destination — and routes every
// page through the awareness → comparison → tools → coaching
// funnel toward Plateau Diagnostic or /apply.
//
// Server component — relies on filesystem reads in `resolveJourney`
// (blog.ts, podcast.ts, tools-registry.ts).

export interface JourneyLinksProps {
  /** What kind of page is this? */
  currentType: JourneyContentType;
  currentSlug: string;
  /** Display title — used to detect comparison-style content. */
  currentTitle?: string;
  pillar: ContentPillar;
  keywords?: string[];
  /** Persona signal (only set for /you/[slug] pages). */
  persona?: PersonaSlug;
  /**
   * Slugs to exclude from the candidate pool. Use on persona pages
   * so curated content above the journey block doesn't re-surface
   * inside it.
   */
  excludeSlugs?: string[];
  /** Analytics namespace, e.g. "blog-ftp-zones" */
  source: string;
  /** Visual variant */
  variant?: "panel" | "inline";
  /**
   * Override the lead-in copy. Defaults vary by content type:
   *   - blog/podcast: "WHERE TO NEXT"
   *   - tool: "FROM HERE"
   *   - persona: "IF YOU'RE ASKING THIS, YOU MIGHT ALSO WANT"
   */
  eyebrow?: string;
  className?: string;
}

const STAGE_BADGE: Record<FunnelStage, { label: string; tone: string }> = {
  awareness: { label: "AWARENESS", tone: "text-coral/70" },
  comparison: { label: "COMPARISON", tone: "text-coral/70" },
  tools: { label: "TOOL", tone: "text-coral" },
  coaching: { label: "COACHING", tone: "text-coral" },
};

const KIND_LABEL: Record<JourneyLink["kind"], string> = {
  article: "ARTICLE",
  comparison: "COMPARISON",
  tool: "TOOL",
  podcast: "PODCAST",
  topic: "TOPIC HUB",
  persona: "FOR YOU",
};

function defaultEyebrow(type: JourneyContentType): string {
  switch (type) {
    case "tool":
      return "FROM HERE";
    case "persona":
      return "IF YOU'RE ASKING THIS, YOU MIGHT ALSO WANT";
    case "podcast":
      return "WHERE TO NEXT";
    case "blog":
    default:
      return "WHERE TO NEXT";
  }
}

export function JourneyLinks({
  currentType,
  currentSlug,
  currentTitle,
  pillar,
  keywords = [],
  persona,
  excludeSlugs,
  source,
  variant = "panel",
  eyebrow,
  className,
}: JourneyLinksProps) {
  const input: JourneyInput = {
    currentType,
    currentSlug,
    currentTitle,
    pillar,
    keywords,
    persona,
    excludeSlugs,
  };
  const journey = resolveJourney(input);

  // Don't render an empty shell — if we have nothing forward and
  // nothing lateral, only the destination CTA would render and the
  // existing CoachingCTA / IntentCTA blocks already cover that case.
  const hasContent = journey.lateral.length + journey.forward.length > 0;
  if (!hasContent) return null;

  const lead = eyebrow ?? defaultEyebrow(currentType);
  const stageBadge = STAGE_BADGE[journey.currentStage];

  const wrapperClass =
    variant === "panel"
      ? "rounded-2xl border border-white/10 bg-gradient-to-br from-deep-purple/30 via-charcoal to-charcoal p-6 md:p-8"
      : "border-t border-white/10 pt-8";

  return (
    <section
      aria-label="Where to next — more Roadman content"
      className={className}
      data-journey-stage={journey.currentStage}
    >
      <div className={wrapperClass}>
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <p className="font-heading text-coral text-xs tracking-widest">
            {lead}
          </p>
          <span
            className={`font-heading text-[10px] tracking-widest ${stageBadge.tone}`}
            aria-hidden
          >
            {stageBadge.label}
          </span>
        </div>

        {(journey.lateral.length > 0 || journey.forward.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {journey.forward.map((link, i) => (
              <JourneyCard
                key={`fwd-${link.href}`}
                link={link}
                tone="forward"
                source={source}
                index={i}
              />
            ))}
            {journey.lateral.map((link, i) => (
              <JourneyCard
                key={`lat-${link.href}`}
                link={link}
                tone="lateral"
                source={source}
                index={i}
              />
            ))}
          </div>
        )}

        <DestinationBlock
          destination={journey.destination}
          source={source}
        />
      </div>
    </section>
  );
}

interface JourneyCardProps {
  link: JourneyLink;
  tone: "forward" | "lateral";
  source: string;
  index: number;
}

function JourneyCard({ link, tone, source, index }: JourneyCardProps) {
  const borderClass =
    tone === "forward"
      ? "border-coral/30 hover:border-coral/60 bg-coral/[0.04]"
      : "border-white/10 hover:border-white/30 bg-white/[0.02]";

  return (
    <Link
      href={link.href}
      data-track={`${source}_journey_${tone}_${index}`}
      className={`group block rounded-xl border ${borderClass} p-4 transition-all hover:-translate-y-0.5`}
    >
      <span className="font-heading text-coral text-[10px] font-medium uppercase tracking-widest mb-1.5 block">
        {KIND_LABEL[link.kind]}
      </span>
      <span className="font-heading text-off-white text-sm leading-tight block group-hover:text-coral transition-colors">
        {link.label}
      </span>
      {link.description && (
        <span className="text-foreground-muted text-xs mt-1.5 line-clamp-2 block">
          {link.description}
        </span>
      )}
    </Link>
  );
}

interface DestinationBlockProps {
  destination: ReturnType<typeof resolveJourney>["destination"];
  source: string;
}

function DestinationBlock({ destination, source }: DestinationBlockProps) {
  return (
    <div className="rounded-xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-charcoal p-5 md:p-6">
      <p className="font-heading text-coral text-[10px] tracking-widest mb-2">
        {destination.eyebrow}
      </p>
      <p className="font-heading text-off-white text-lg md:text-xl leading-tight mb-2">
        {destination.headline}
      </p>
      <p className="text-foreground-muted text-sm mb-4 max-w-xl leading-relaxed">
        {destination.body}
      </p>
      <Link
        href={destination.href}
        data-track={`${source}_journey_dest_${destination.kind}`}
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-5 py-2.5 text-sm transition-all"
      >
        {destination.ctaLabel} →
      </Link>
    </div>
  );
}
