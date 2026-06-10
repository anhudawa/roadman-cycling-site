import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyGameConfig } from "@/lib/db/schema";
import { audit, setConfigKey } from "@/lib/fantasy/queries";
import { LAUNCH_DEFAULTS } from "@/lib/fantasy/config";
import { requireAdminJson, readJsonBody } from "../_lib/guard";

/** Set (insert or replace) one config override. setConfigKey writes the audit row. */
export async function PUT(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const key = typeof body.key === "string" ? body.key.trim() : "";
  const valueJson = typeof body.valueJson === "string" ? body.valueJson : "";
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  if (!valueJson.trim()) {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }

  let value: unknown;
  try {
    value = JSON.parse(valueJson);
  } catch {
    return NextResponse.json({ error: "value must be valid JSON" }, { status: 400 });
  }

  await setConfigKey(key, value, gate.user.email);

  // Unknown keys are stored but ignored by mergeConfig — flag them.
  return NextResponse.json({ ok: true, knownKey: key in LAUNCH_DEFAULTS });
}

/** Remove an override so the launch default applies again. */
export async function DELETE(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  const deleted = await db
    .delete(fantasyGameConfig)
    .where(eq(fantasyGameConfig.key, key))
    .returning({ key: fantasyGameConfig.key });
  if (deleted.length === 0) {
    return NextResponse.json({ error: "No override stored for that key" }, { status: 404 });
  }

  await audit(gate.user.email, "config.delete", "game_config", key, {});
  return NextResponse.json({ ok: true });
}
