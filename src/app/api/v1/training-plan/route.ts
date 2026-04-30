import { NextResponse } from "next/server";
import {
  EVENTS,
  PHASES,
  getEvent,
  getPhase,
  getAdjacentPhases,
  type TrainingPhase,
} from "@/lib/training-plans";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

function serialisePhase(phase: TrainingPhase) {
  return {
    slug: phase.slug,
    weeksOut: phase.weeksOut,
    label: phase.label,
    tagline: phase.tagline,
    focus: phase.focus,
    anchorSession: phase.anchorSession,
    weekStructure: phase.weekStructure,
    gotcha: phase.gotcha,
  };
}

/**
 * GET /api/v1/training-plan?event=<slug>[&weeksOut=<phase-slug-or-number>]
 *
 * Returns a structured training plan for one of the curated target events
 * (e.g. wicklow-200, ride-london, fred-whitton-challenge). Plans are the
 * data behind /plan/[event]/[weeksOut] — event metadata + a full weekly
 * structure for the chosen weeks-out phase.
 *
 * Query params:
 *   - event (required): TrainingEvent slug.
 *   - weeksOut (optional): a phase slug ("16-weeks-out", "1-week-out", …)
 *     or just the number ("16", "1"). If omitted, all phases are returned.
 *
 * 400 on invalid weeksOut. 404 on unknown event or phase.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const eventSlug = url.searchParams.get("event")?.trim() ?? "";
  const weeksOutRaw = url.searchParams.get("weeksOut")?.trim() ?? "";

  if (!eventSlug) {
    return NextResponse.json(
      {
        error: "Missing required query parameter: event",
        availableEvents: EVENTS.map((e) => e.slug),
      },
      { status: 400 },
    );
  }

  const event = getEvent(eventSlug);
  if (!event) {
    return NextResponse.json(
      {
        error: `No training plan found for event "${eventSlug}".`,
        availableEvents: EVENTS.map((e) => e.slug),
      },
      { status: 404 },
    );
  }

  let phases: TrainingPhase[];
  let phaseQuery: { weeksOut: number | null; phaseSlug: string | null } = {
    weeksOut: null,
    phaseSlug: null,
  };

  if (weeksOutRaw) {
    let phase = getPhase(weeksOutRaw);
    if (!phase) {
      const asNum = Number(weeksOutRaw);
      if (Number.isFinite(asNum)) {
        phase = PHASES.find((p) => p.weeksOut === asNum) ?? null;
      }
    }
    if (!phase) {
      return NextResponse.json(
        {
          error: `No phase found for weeksOut "${weeksOutRaw}".`,
          availablePhases: PHASES.map((p) => ({
            slug: p.slug,
            weeksOut: p.weeksOut,
          })),
        },
        { status: 404 },
      );
    }
    phases = [phase];
    phaseQuery = { weeksOut: phase.weeksOut, phaseSlug: phase.slug };
  } else {
    phases = PHASES;
  }

  const adjacency =
    phases.length === 1
      ? (() => {
          const { prev, next } = getAdjacentPhases(phases[0].slug);
          return {
            prev: prev ? { slug: prev.slug, weeksOut: prev.weeksOut } : null,
            next: next ? { slug: next.slug, weeksOut: next.weeksOut } : null,
          };
        })()
      : null;

  const item = {
    type: "training-plan" as const,
    event: {
      slug: event.slug,
      name: event.name,
      shortName: event.shortName,
      region: event.region,
      eventType: event.type,
      distanceKm: event.distanceKm,
      elevationGainM: event.elevationGainM,
      typicalFinishTime: event.typicalFinishTime,
      defaultMonth: event.defaultMonth,
      description: event.description,
      keyCharacteristics: event.keyCharacteristics,
      commonMistakes: event.commonMistakes,
      pacingStrategy: event.pacingStrategy,
      nutritionAngle: event.nutritionAngle,
      kitAngle: event.kitAngle,
      relatedArticle: event.blogSlug
        ? {
            slug: event.blogSlug,
            url: feedUrl(`/blog/${event.blogSlug}`),
          }
        : null,
      url: feedUrl(`/plan/${event.slug}`),
    },
    phaseQuery,
    phases: phases.map(serialisePhase),
    adjacency,
  };

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      item,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
