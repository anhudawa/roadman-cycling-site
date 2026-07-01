import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyProTeams, fantasyRiders } from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import {
  isHttpUrl,
  PRICE_MAX,
  PRICE_MIN,
  RIDER_CLASSES,
  RIDER_STATUSES,
  type RiderClass,
  type RiderStatus,
} from "@/lib/fantasy/admin";
import { requireAdminJson, readJsonBody } from "../_lib/guard";

function parsePrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < PRICE_MIN || value > PRICE_MAX) return null;
  return value;
}

/** Add a rider to the startlist. A source URL is non-negotiable (Section 0.4). */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const proTeamId = typeof body.proTeamId === "number" ? body.proTeamId : NaN;
  const riderClass = typeof body.riderClass === "string" ? body.riderClass : "";
  const price = parsePrice(body.price);
  const countryCode =
    typeof body.countryCode === "string" && body.countryCode.trim() !== ""
      ? body.countryCode.trim().toUpperCase()
      : null;
  const pcsId =
    typeof body.pcsId === "string" && body.pcsId.trim() !== "" ? body.pcsId.trim() : null;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!sourceUrl || !isHttpUrl(sourceUrl)) {
    return NextResponse.json(
      { error: "A source URL is required — no rider enters the game without one" },
      { status: 400 },
    );
  }
  if (!RIDER_CLASSES.includes(riderClass as RiderClass)) {
    return NextResponse.json(
      { error: `riderClass must be one of ${RIDER_CLASSES.join("/")}` },
      { status: 400 },
    );
  }
  if (price === null) {
    return NextResponse.json(
      { error: `price must be an integer between ${PRICE_MIN} and ${PRICE_MAX}` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(proTeamId)) {
    return NextResponse.json({ error: "proTeamId is required" }, { status: 400 });
  }
  const [team] = await db
    .select({ id: fantasyProTeams.id })
    .from(fantasyProTeams)
    .where(eq(fantasyProTeams.id, proTeamId));
  if (!team) return NextResponse.json({ error: "Unknown pro team" }, { status: 400 });

  try {
    const [rider] = await db
      .insert(fantasyRiders)
      .values({
        name,
        pcsId,
        proTeamId,
        price,
        riderClass: riderClass as RiderClass,
        countryCode,
        sourceUrl,
        verifiedAt: new Date(),
      })
      .returning({ id: fantasyRiders.id });

    await audit(gate.user.email, "rider.add", "rider", String(rider.id), {
      name,
      pcsId,
      proTeamId,
      price,
      riderClass,
      sourceUrl,
    });
    return NextResponse.json({ ok: true, id: rider.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Most likely the pcs_id unique constraint.
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** Edit a rider's price, class, or status. */
export async function PATCH(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const id = typeof body.id === "number" ? body.id : NaN;
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const patch: {
    price?: number;
    riderClass?: RiderClass;
    status?: RiderStatus;
    abandonedAfterStage?: number | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if ("price" in body) {
    const price = parsePrice(body.price);
    if (price === null) {
      return NextResponse.json(
        { error: `price must be an integer between ${PRICE_MIN} and ${PRICE_MAX}` },
        { status: 400 },
      );
    }
    patch.price = price;
  }
  if ("riderClass" in body) {
    if (!RIDER_CLASSES.includes(body.riderClass as RiderClass)) {
      return NextResponse.json(
        { error: `riderClass must be one of ${RIDER_CLASSES.join("/")}` },
        { status: 400 },
      );
    }
    patch.riderClass = body.riderClass as RiderClass;
  }
  if ("status" in body) {
    if (!RIDER_STATUSES.includes(body.status as RiderStatus)) {
      return NextResponse.json(
        { error: `status must be one of ${RIDER_STATUSES.join("/")}` },
        { status: 400 },
      );
    }
    patch.status = body.status as RiderStatus;
    // Leaving "abandoned" clears the stage marker so the rider scores again.
    if (patch.status !== "abandoned") patch.abandonedAfterStage = null;
  }

  if (!("price" in patch) && !("riderClass" in patch) && !("status" in patch)) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(fantasyRiders)
    .set(patch)
    .where(eq(fantasyRiders.id, id))
    .returning({ id: fantasyRiders.id });
  if (!updated) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

  await audit(gate.user.email, "rider.update", "rider", String(id), {
    ...(patch.price !== undefined ? { price: patch.price } : {}),
    ...(patch.riderClass !== undefined ? { riderClass: patch.riderClass } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
  });

  return NextResponse.json({ ok: true });
}
