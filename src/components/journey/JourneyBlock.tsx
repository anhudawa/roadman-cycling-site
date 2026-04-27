import Link from "next/link";
import { type ContentPillar } from "@/types";

/**
 * Content type the reader is currently on. Determines which next-step
 * stages we surface — awareness pages funnel toward decision/action,
 * decision pages funnel toward tools+coaching, action pages reinforce.
 */
export type JourneyStage =
  /** Awareness content — blog posts, podcast episodes, topic hubs */
  | "awareness"
  /** Decision/comparison content — compare, best, problem, diagnosis */
  | "decision"
  /** Action/tool content — calculators, ask, assessments, diagnostics */
  | "tool"
  /** Coaching/community pages where the reader is already deciding */
  | "coaching";

export interface JourneyDestination {
  label: string;
  href: string;
  /** One-line description shown under the label */
  description?: string;
  /** Stage tag rendered above the label, e.g. "EVIDENCE" / "TRY IT" */
  tag?: string;
  /** Whether this destination is the primary action — visually prominent */
  primary?: boolean;
}

interface JourneyBlockProps {
  /** Current page's stage in the funnel */
  stage: JourneyStage;
  /** Optional pillar — used for messaging and as a fallback hint */
  pillar?: ContentPillar;
  /** Override destinations entirely. If not provided, the component
   *  picks 3 sensible defaults based on stage + pillar. */
  destinations?: JourneyDestination[];
  /** Override the heading copy */
  heading?: string;
  /** Override the eyebrow line */
  eyebrow?: string;
  /** Source string for click-tracking */
  source: string;
  className?: string;
}

const STAGE_DEFAULTS: Record<
  JourneyStage,
  { eyebrow: string; heading: string }
> = {
  awareness: {
    eyebrow: "WHERE TO GO NEXT",
    heading: "GO DEEPER. THEN DO SOMETHING ABOUT IT.",
  },
  decision: {
    eyebrow: "STILL DECIDING",
    heading: "RUN THE NUMBERS. THEN APPLY.",
  },
  tool: {
    eyebrow: "USED THE TOOL",
    heading: "NOW TURN THE ANSWER INTO A WEEK OF TRAINING.",
  },
  coaching: {
    eyebrow: "BEFORE YOU APPLY",
    heading: "READ AROUND IT. DECIDE FROM THE EVIDENCE.",
  },
};

/**
 * Stage-aware default journeys. Each stage surfaces three intentional
 * next steps — generally a depth move, a tool/decision move, and a
 * conversion move. Pillar nuances the destination set so a coaching
 * post lands you on /tools/ftp-zones, while a nutrition post lands
 * you on /tools/race-weight.
 */
function defaultDestinations(
  stage: JourneyStage,
  pillar?: ContentPillar
): JourneyDestination[] {
  const toolHref = pillarTool(pillar);
  const compareHref = pillarCompare(pillar);
  const problemHref = pillarProblem(pillar);

  switch (stage) {
    case "awareness":
      // Awareness → push toward a decision page (compare/problem) and a tool.
      return [
        {
          tag: "DECIDE",
          label: "Compare your options",
          description:
            "Side-by-side breakdowns of the choices most cyclists agonise over.",
          href: compareHref,
        },
        {
          tag: "TRY IT",
          label: "Open the calculator",
          description:
            "Plug your numbers in and see where you actually stand.",
          href: toolHref,
        },
        {
          tag: "APPLY IT",
          label: "Apply for coaching",
          description:
            "Have the answer built into your week with a coach who knows your data.",
          href: "/apply",
          primary: true,
        },
      ];
    case "decision":
      // Decision → push toward concrete action: tool first, then coaching.
      return [
        {
          tag: "RUN THE NUMBERS",
          label: "Use the free tool",
          description:
            "Make the decision specific to your watts, weight and event.",
          href: toolHref,
        },
        {
          tag: "ASK A QUESTION",
          label: "Ask Roadman",
          description:
            "Anthony's coaching brain on tap — answers grounded in 1,400+ podcast episodes.",
          href: "/ask",
        },
        {
          tag: "GET COACHED",
          label: "Apply for coaching",
          description:
            "Skip the trial-and-error. Have the answer built into your training.",
          href: "/apply",
          primary: true,
        },
      ];
    case "tool":
      // Tool → push toward newsletter (low friction) + coaching (high intent).
      return [
        {
          tag: "DIAGNOSE",
          label: "What's actually limiting you?",
          description:
            "12-question plateau diagnostic. Four minutes to a specific answer.",
          href: problemHref,
        },
        {
          tag: "STAY CLOSE",
          label: "Saturday Spin newsletter",
          description:
            "Weekly training breakdown — what's working, what the pros do.",
          href: "/newsletter",
        },
        {
          tag: "GET COACHED",
          label: "Apply for coaching",
          description:
            "Hand the system to a coach who'll keep adjusting it weekly.",
          href: "/apply",
          primary: true,
        },
      ];
    case "coaching":
    default:
      return [
        {
          tag: "EVIDENCE",
          label: "Read the methodology",
          description:
            "How we coach. The five pillars and what each one is built on.",
          href: "/methodology",
        },
        {
          tag: "PROOF",
          label: "Real results",
          description:
            "Athlete profiles and before/after numbers from the community.",
          href: "/coaching#real-results",
        },
        {
          tag: "APPLY",
          label: "Apply for coaching",
          description: "Reviewed personally by Anthony. 7-day free trial.",
          href: "/apply",
          primary: true,
        },
      ];
  }
}

function pillarTool(pillar?: ContentPillar): string {
  switch (pillar) {
    case "nutrition":
      return "/tools/fuelling";
    case "strength":
      return "/strength-training";
    case "recovery":
      return "/tools/energy-availability";
    case "community":
      return "/community/clubhouse";
    case "coaching":
    default:
      return "/tools/ftp-zones";
  }
}

function pillarCompare(pillar?: ContentPillar): string {
  switch (pillar) {
    case "nutrition":
      return "/compare/fasted-vs-fueled-cycling";
    case "strength":
      return "/compare/strength-vs-endurance-cyclist";
    case "recovery":
      return "/compare/zone-2-vs-endurance-training";
    case "coaching":
    case "community":
    default:
      return "/compare/polarised-vs-sweet-spot-training";
  }
}

function pillarProblem(pillar?: ContentPillar): string {
  switch (pillar) {
    case "nutrition":
      return "/problem/cant-lose-race-weight";
    case "strength":
      return "/problem/cycling-leg-strength-gap";
    case "recovery":
      return "/problem/always-tired-on-the-bike";
    case "coaching":
    case "community":
    default:
      return "/plateau";
  }
}

/**
 * JourneyBlock — funnel-aware next-steps panel.
 *
 * Designed to replace generic "related content" rails on pages where the
 * goal is forward motion through the site, not lateral browsing. Picks
 * three destinations matched to the page's funnel stage and pillar.
 *
 * Use stage="awareness" on top-of-funnel content (blog, episodes), and
 * progressively narrow as readers move deeper. Pair with NextStepBlock
 * for the final apply-or-bounce moment, not as a replacement.
 */
export function JourneyBlock({
  stage,
  pillar,
  destinations,
  heading,
  eyebrow,
  source,
  className = "",
}: JourneyBlockProps) {
  const items =
    destinations && destinations.length > 0
      ? destinations
      : defaultDestinations(stage, pillar);
  const stageCopy = STAGE_DEFAULTS[stage];

  return (
    <aside
      className={`
        rounded-2xl border border-white/10
        bg-gradient-to-br from-deep-purple/30 via-charcoal to-charcoal
        p-6 md:p-10
        ${className}
      `}
      aria-labelledby={`journey-${source}`}
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        {eyebrow ?? stageCopy.eyebrow}
      </p>
      <h2
        id={`journey-${source}`}
        className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-6 max-w-2xl"
      >
        {heading ?? stageCopy.heading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.slice(0, 3).map((d) => (
          <Link
            key={d.href}
            href={d.href}
            data-track={`${source}-journey-${slugify(d.label)}`}
            className={`
              group flex flex-col h-full rounded-xl p-5
              transition-all
              focus-visible:outline-none focus-visible:ring-2
              ${
                d.primary
                  ? "bg-coral text-off-white hover:bg-coral/90 focus-visible:ring-off-white/60"
                  : "bg-white/[0.04] border border-white/10 text-off-white hover:bg-white/[0.07] hover:border-coral/30 focus-visible:ring-coral/50"
              }
            `}
          >
            {d.tag && (
              <span
                className={`
                  font-heading text-xs tracking-widest mb-1
                  ${d.primary ? "opacity-80" : "text-coral"}
                `}
              >
                {d.tag.toUpperCase()}
              </span>
            )}
            <span className="font-heading text-lg leading-snug mb-auto">
              {d.label}
            </span>
            {d.description && (
              <span
                className={`
                  text-sm mt-3 leading-snug
                  ${d.primary ? "opacity-90" : "text-foreground-muted"}
                `}
              >
                {d.description}
              </span>
            )}
            <span
              aria-hidden="true"
              className={`
                mt-4 text-sm font-heading tracking-wider
                group-hover:translate-x-0.5 transition-transform
                ${d.primary ? "" : "text-coral"}
              `}
            >
              {d.primary ? "APPLY →" : "OPEN →"}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
