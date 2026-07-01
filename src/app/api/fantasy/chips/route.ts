import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyTeams } from "@/lib/db/schema";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import {
  activateChip,
  cancelChip,
  deadlineForStage,
  getChips,
  getPlayerByEmail,
  isPreTour,
  loadGameConfig,
  nextOpenStage,
  audit,
} from "@/lib/fantasy/queries";

export const runtime = "nodejs";

type ChipName = "wildcard" | "triple_captain";

function parseChip(value: unknown): ChipName | null {
  return value === "wildcard" || value === "triple_captain" ? value : null;
}

async function resolve(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) {
    return { error: NextResponse.json({ error: "No player found." }, { status: 404 }) };
  }
  const [team] = await db.select().from(fantasyTeams).where(eq(fantasyTeams.playerId, player.id));
  if (!team) return { error: NextResponse.json({ error: "No team yet." }, { status: 404 }) };
  return { player, team };
}

/**
 * POST /api/fantasy/chips { chip } — play a chip for the next open
 * stage (FPL-style, one of each per Tour):
 *  - wildcard: every transfer made for that stage is free and uncounted
 *  - triple_captain: your captain scores ×3 instead of ×2 that stage
 * DELETE takes it back while the stage hasn't rolled out.
 */
export async function POST(request: Request) {
  const resolved = await resolve(request);
  if ("error" in resolved) return resolved.error;
  const { player, team } = resolved;

  let body: { chip?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const chip = parseChip(body.chip);
  if (!chip) return NextResponse.json({ error: "chip must be wildcard or triple_captain." }, { status: 400 });

  const config = await loadGameConfig();
  if (
    (chip === "wildcard" && !config.chips.wildcardEnabled) ||
    (chip === "triple_captain" && !config.chips.tripleCaptainEnabled)
  ) {
    return NextResponse.json({ error: "That chip isn't in play this Tour." }, { status: 400 });
  }
  if (await isPreTour()) {
    return NextResponse.json(
      { error: "Chips are for the race. Before Stage 1 everything is free anyway." },
      { status: 400 },
    );
  }
  const openStage = await nextOpenStage();
  if (!openStage) return NextResponse.json({ error: "The Tour is over." }, { status: 400 });
  if (deadlineForStage(openStage, config.pickingDeadlineIso) <= new Date()) {
    return NextResponse.json({ error: "That stage has rolled out." }, { status: 400 });
  }

  const activated = await activateChip(team.id, chip, openStage.stageNumber);
  if (!activated) {
    return NextResponse.json(
      { error: "You've already played that chip — one of each per Tour." },
      { status: 400 },
    );
  }
  await audit(player.email, "chip.activate", "team", String(team.id), {
    chip,
    stageNumber: openStage.stageNumber,
  });
  return NextResponse.json({ ok: true, chip, stageNumber: openStage.stageNumber });
}

/** DELETE /api/fantasy/chips { chip } — cancel before the deadline. */
export async function DELETE(request: Request) {
  const resolved = await resolve(request);
  if ("error" in resolved) return resolved.error;
  const { player, team } = resolved;

  let body: { chip?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const chip = parseChip(body.chip);
  if (!chip) return NextResponse.json({ error: "chip must be wildcard or triple_captain." }, { status: 400 });

  const openStage = await nextOpenStage();
  if (!openStage) return NextResponse.json({ error: "The Tour is over." }, { status: 400 });

  const chips = await getChips(team.id);
  const active = chips.find((c) => c.chip === chip);
  if (!active || active.stageNumber !== openStage.stageNumber) {
    return NextResponse.json(
      { error: "That chip isn't pending for the next stage — played chips can't be taken back." },
      { status: 400 },
    );
  }
  // Wildcard transfers already made under the chip stay made: taking
  // the wildcard back after free transfers would be a free rebuild.
  if (chip === "wildcard") {
    const { getTransferLedger } = await import("@/lib/fantasy/queries");
    const ledger = await getTransferLedger(team.id);
    if (ledger.some((t) => t.kind === "wildcard" && t.effectiveFromStage === openStage.stageNumber)) {
      return NextResponse.json(
        { error: "You've already made wildcard transfers — the chip is committed." },
        { status: 400 },
      );
    }
  }

  await cancelChip(team.id, chip, openStage.stageNumber);
  await audit(player.email, "chip.cancel", "team", String(team.id), {
    chip,
    stageNumber: openStage.stageNumber,
  });
  return NextResponse.json({ ok: true });
}
