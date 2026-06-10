import { NextResponse } from "next/server";
import { listRidersWithTeams, listStages, loadGameConfig } from "@/lib/fantasy/queries";

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
    const [riders, stages, config] = await Promise.all([
      listRidersWithTeams(),
      listStages(),
      loadGameConfig(),
    ]);
    return NextResponse.json(
      {
        riders,
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[fantasy/builder-data] failed:", error);
    return NextResponse.json({ error: "Could not load game data." }, { status: 500 });
  }
}
