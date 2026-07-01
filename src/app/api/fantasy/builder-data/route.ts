import { NextResponse } from "next/server";
import { getOwnership, listRidersWithTeams, listStages, loadGameConfig } from "@/lib/fantasy/queries";
import { LAUNCH_DEFAULTS } from "@/lib/fantasy/config";
import stagesData from "@/data/fantasy/stages-2026.json";

export const runtime = "nodejs";

/**
 * GET /api/fantasy/builder-data — everything the (public, pre-login)
 * team builder needs in one cacheable payload: riders with prices and
 * team accents, the stage strip, and the rules the client validates
 * against for instant feedback.
 *
 * Edge-cached for 5 minutes: this is the endpoint that takes the hit
 * when a Facebook post goes viral, and prices are fixed at launch
 * anyway. Startlist confirmations show up within minutes.
 */
export async function GET() {
  try {
    const [riders, stages, config, ownership] = await Promise.all([
      listRidersWithTeams(),
      listStages(),
      loadGameConfig(),
      getOwnership(),
    ]);
    // "Selected by" % (FPL-style) — the differential game starts in the
    // builder. Rounded to one decimal; 0 until teams exist.
    const withOwnership = riders.map((r) => ({
      ...r,
      ownershipPct:
        ownership.totalTeams > 0
          ? Math.round(((ownership.byRider.get(r.id) ?? 0) / ownership.totalTeams) * 1000) / 10
          : 0,
    }));
    return NextResponse.json(
      {
        riders: withOwnership,
        stages: stages.map((s) => ({
          stageNumber: s.stageNumber,
          date: s.date,
          startTown: s.startTown,
          finishTown: s.finishTown,
          distanceKm: s.distanceKm,
          stageType: s.stageType,
          summitFinish: s.summitFinish,
          restDayAfter: s.restDayAfter,
        })),
        rules: {
          budget: config.budget,
          squadSize: config.squadSize,
          maxPerProTeam: config.maxPerProTeam,
          minCheapRiders: config.minCheapRiders,
          transfersTotal: config.transfersTotal,
          transfersPerStage: config.transfersPerStage,
          captainMultiplier: config.captainMultiplier,
        },
        demoMode: config.demoMode,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    // Database unreachable: degrade to the verified stage data file +
    // launch-default rules with an empty startlist. The builder renders
    // its "startlist is landing" state instead of an error wall, and
    // the route never 500s under load.
    console.error("[fantasy/builder-data] db unavailable, serving static fallback:", error);
    return NextResponse.json(
      {
        riders: [],
        stages: stagesData.stages,
        rules: {
          budget: LAUNCH_DEFAULTS.budget,
          squadSize: LAUNCH_DEFAULTS.squadSize,
          maxPerProTeam: LAUNCH_DEFAULTS.maxPerProTeam,
          minCheapRiders: LAUNCH_DEFAULTS.minCheapRiders,
          transfersTotal: LAUNCH_DEFAULTS.transfersTotal,
          transfersPerStage: LAUNCH_DEFAULTS.transfersPerStage,
          captainMultiplier: LAUNCH_DEFAULTS.captainMultiplier,
        },
        demoMode: LAUNCH_DEFAULTS.demoMode,
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  }
}
