import type {
  DiagnosticDefinition,
  ResultCategory,
  ReportSection,
  ReportSectionKind,
} from "@/lib/diagnostics/framework/types";
import type { ToolResult } from "@/lib/tool-results/types";

/**
 * Build the structured content for a paid report.
 *
 * Takes the DiagnosticDefinition, the saved tool_result, and the rider's
 * first name, and produces an array of rendered sections $€” each with a
 * title and a list of paragraphs. Both the PDF renderer and the HTML
 * web-view render from the same ReportContent so the delivery formats
 * never drift.
 *
 * The body copy inside each kind is intentionally hand-authored per
 * ReportSectionKind. This is the "paid value-add" above the free result
 * page $€” more specifics, more week-by-week structure, more operational
 * detail. Admin-tweakable in a future phase via the
 * `diagnostic_definitions` JSON payload.
 */

export interface RenderedSection {
  kind: ReportSectionKind;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ReportContent {
  riderFirstName: string | null;
  productName: string;
  toolTitle: string;
  summary: string;
  primaryCategory: ResultCategory | null;
  secondaryCategory: ResultCategory | null;
  riskFlags: string[];
  sections: RenderedSection[];
  disclaimer: string;
  generatedAt: Date;
}

function pickCategory(
  def: DiagnosticDefinition,
  key: string | null,
): ResultCategory | null {
  if (!key) return null;
  return def.categories.find((c) => c.key === key) ?? null;
}

function renderSection(
  section: ReportSection,
  def: DiagnosticDefinition,
  primary: ResultCategory | null,
  secondary: ResultCategory | null,
  answers: Record<string, unknown>,
): RenderedSection | null {
  if (
    section.onlyForCategory &&
    primary &&
    !section.onlyForCategory.includes(primary.key)
  ) {
    return null;
  }

  switch (section.kind) {
    case "cover":
      return {
        kind: "cover",
        title: section.title ?? def.title,
        paragraphs: [def.subtitle, def.description],
      };

    case "summary":
      return {
        kind: "summary",
        title: section.title ?? "The short answer",
        paragraphs: primary
          ? [
              primary.explanation,
              `We've built the rest of this report around one idea: ${primary.shortLabel ?? primary.label}. Everything that follows is how you act on it for the next 12 weeks.`,
            ]
          : [
              "The inputs you gave us produce a mixed picture $€” no single limiter dominates. That's a good problem. Use the sections below as a self-audit: pick the one that feels most honest and start there.",
            ],
      };

    case "primary_limiter":
      if (!primary) return null;
      return {
        kind: "primary_limiter",
        title: section.title ?? `Primary: ${primary.label}`,
        paragraphs: [
          primary.explanation,
          "This isn't a 'nice-to-fix' $€” it's the rate-limiter on everything else. Fix this and the rest of your plan starts working again.",
        ],
        bullets: primary.nextSteps,
      };

    case "secondary_limiter":
      if (!secondary) return null;
      return {
        kind: "secondary_limiter",
        title: section.title ?? `Secondary: ${secondary.label}`,
        paragraphs: [
          secondary.explanation,
          "Queue this up once the primary has been under control for 3$€“4 weeks. Layering both at once is how most cyclists stall their own progress.",
        ],
        bullets: secondary.nextSteps.slice(0, 3),
      };

    case "next_12_weeks":
      return {
        kind: "next_12_weeks",
        title: section.title ?? "The next 12 weeks",
        paragraphs: [
          "Three four-week blocks. Each block stacks on the last. Don't skip block 1 because it feels easy $€” block 3 only works if block 1 happened.",
        ],
        bullets: [
          "Block 1 (weeks 1$€“4): Restore the base. Pull back intensity, protect sleep, hit Z2 volume honestly. Re-test at the end of week 4.",
          "Block 2 (weeks 5$€“8): Introduce the quality work. Two hard sessions per week, everything else Z1/Z2. Strength twice a week, 30 minutes each.",
          "Block 3 (weeks 9$€“12): Specificity. The sessions get closer to what you're training for. Peak week 10, taper weeks 11$€“12 if you have an event.",
        ],
      };

    case "week_by_week":
      return {
        kind: "week_by_week",
        title: section.title ?? "A sample week",
        paragraphs: [
          "This is a representative week $€” adjust to your calendar. The shape matters more than the days.",
        ],
        bullets: [
          "Monday $€” Full rest or 20 min easy spin + mobility.",
          "Tuesday $€” Threshold (2Ã—20 at 95$€“100% FTP) + 10 min S&C.",
          "Wednesday $€” Z2 for 90 min. No grey zone.",
          "Thursday $€” VO2 (5Ã—4 min at 110%) + strength (squat, deadlift, single-leg).",
          "Friday $€” 45 min Z1/Z2 recovery spin.",
          "Saturday $€” Long ride, 3$€“4 hours, 80% Z2 with 20 min tempo mid-ride.",
          "Sunday $€” Optional Z1 ride or full rest day. Family first.",
        ],
      };

    case "fuelling_plan":
      return {
        kind: "fuelling_plan",
        title: section.title ?? "Your fuelling plan",
        paragraphs: [
          `Based on your answers, your target rate sits at ${answers.carbsPerHour ?? "60$€“90"}g carbs per hour. The numbers are only useful if you can actually get them in. The sequence below is what riders at your level typically do on race day.`,
        ],
        bullets: [
          "0:00 $€” First feed in the first 15 minutes. Start before you think you need it.",
          "Every 15 minutes $€” small, regular intake beats heroic gels every hour.",
          "Dual-source (glucose + fructose 1:0.8) above 60g/hr $€” single-source saturates and gives you GI.",
          `Fluid target: ${answers.fluidPerHour ?? "500$€“750"}ml/hr, sodium ${answers.sodiumPerHour ?? "400$€“700"}mg/hr.`,
          "Gut-train: add 10g/hr per week if the target is new $€” don't jump straight to 90g/hr on race day.",
        ],
      };

    case "zones_plan":
      return {
        kind: "zones_plan",
        title: section.title ?? "Your zones, built around your FTP",
        paragraphs: [
          `Your FTP of ${answers.ftp ?? "your FTP"}W drives every training target here. Re-test every 8$€“12 weeks $€” out-of-date zones are the #1 reason plans stall.`,
        ],
        bullets: [
          "Zone 1 (Active Recovery) $€” <55% FTP. Recovery only, doesn't build fitness.",
          "Zone 2 (Endurance) $€” 55$€“75% FTP. The biggest lever most cyclists under-utilise.",
          "Zone 3 (Tempo) $€” 76$€“90% FTP. Use sparingly $€” this is the grey-zone trap.",
          "Zone 4 (Threshold) $€” 91$€“105% FTP. 2Ã—20 is the staple.",
          "Zone 5 (VO2 Max) $€” 106$€“120% FTP. Short, hard, full recovery.",
          "Zone 6 (Anaerobic) $€” 121$€“150% FTP. Neuromuscular, rarely programmed.",
          "Zone 7 (Sprint) $€” 150%+ FTP. Bike-handling and race-specificity.",
        ],
      };

    case "recovery_plan":
      return {
        kind: "recovery_plan",
        title: section.title ?? "Recovery protocol",
        paragraphs: [
          "Recovery isn't passive. It's the protocol that decides whether the last block of training turns into fitness or turns into a plateau.",
        ],
        bullets: [
          "Sleep $€” 8+ hours, consistent bedtime. Non-negotiable. Every hour of lost sleep costs a day of adaptation.",
          "Fuel the 30-minute window after every ride $€” carbs + protein. Even on easy days.",
          "One full rest day per week. Complete rest, not 'active recovery on the turbo'.",
          "Drop volume 30% every fourth week. Your body needs a recovery week to absorb the previous three.",
          "Stress is training load. Busy week at work + full training = overreach. Pull one lever back when life is loud.",
        ],
      };

    case "risk_addendum": {
      const riskAdvice = primary?.riskAdvice;
      if (!riskAdvice) return null;
      const items = Object.entries(riskAdvice).map(
        ([flag, advice]) => `${flag}: ${advice}`,
      );
      if (items.length === 0) return null;
      return {
        kind: "risk_addendum",
        title: section.title ?? "Watch-outs",
        paragraphs: [
          "These only apply if the matching signal showed up in your inputs. If any of these resonate, slow down and get eyes on it before you add more training.",
        ],
        bullets: items,
      };
    }

    case "ask_roadman":
      return {
        kind: "ask_roadman",
        title: section.title ?? "Talk this through with Ask Roadman",
        paragraphs: [
          "This report is static $€” your training isn't. Open Ask Roadman with this result pre-loaded to drill into specifics, stress-test the plan against your schedule, or ask for a variation for next week.",
        ],
        bullets: [
          "https://roadmancycling.com/ask $€” loads this result automatically.",
          "Every answer references the podcast archive, expert interviews, and the methodology behind this report.",
        ],
      };

    case "community_invite":
      return {
        kind: "community_invite",
        title: section.title ?? "The room matters",
        paragraphs: [
          "You can keep guessing alone, or plug into a group that's already solving the same problem you are. Not Done Yet is the paid community $€” 113 serious amateur cyclists, Anthony on weekly calls, Vekta training plans, the accountability you've been missing.",
          "Free tier if you want to lurk first: the Roadman Cycling Clubhouse $€” 1,800+ members, weekly Q&A, no cost.",
        ],
      };

    case "disclaimer":
      return {
        kind: "disclaimer",
        title: section.title ?? "Important",
        paragraphs: [def.disclaimer],
      };
  }
}

export function buildReportContent(
  def: DiagnosticDefinition,
  toolResult: ToolResult,
  opts: { productName: string; riderFirstName: string | null; riskFlags?: string[] },
): ReportContent {
  const answers = {
    ...toolResult.inputs,
    ...toolResult.outputs,
  } as Record<string, unknown>;

  const primary = pickCategory(def, toolResult.primaryResult);
  // Secondary only meaningful for plateau today; other tools leave it null.
  const secondaryKey = (toolResult.outputs as Record<string, unknown>)
    .secondaryCategory;
  const secondary = pickCategory(
    def,
    typeof secondaryKey === "string" ? secondaryKey : null,
  );

  const sections: RenderedSection[] = [];
  for (const section of def.reportSections) {
    const rendered = renderSection(section, def, primary, secondary, answers);
    if (rendered) sections.push(rendered);
  }

  return {
    riderFirstName: opts.riderFirstName,
    productName: opts.productName,
    toolTitle: def.title,
    summary: toolResult.summary,
    primaryCategory: primary,
    secondaryCategory: secondary,
    riskFlags: opts.riskFlags ?? [],
    sections,
    disclaimer: def.disclaimer,
    generatedAt: new Date(),
  };
}
