import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";

/**
 * Auth-free health check for the Plateau Diagnostic. Returns
 * `{ ok: boolean }` plus a `checks` map with per-dependency status.
 *
 * Public on purpose $€” uptime monitors (Better Uptime, UptimeRobot,
 * etc.) hit it without credentials. The body never reveals an env
 * var value, only its presence as "set" / "missing".
 *
 * 503 when the DB roundtrip fails so monitors can page us; 200
 * otherwise even if optional integrations (LLM, Beehiiv) are
 * unconfigured. The funnel still works end-to-end without those $€”
 * just with the static $§9 fallback and a missed nurture sync.
 */

type Status = "set" | "missing" | "ok" | "error";

interface HealthResponse {
  ok: boolean;
  checks: {
    db: Status;
    table: Status;
    anthropicKey: Status;
    resendKey: Status;
    beehiivKey: Status;
    calBookingUrl: Status;
    metaPixel: Status;
  };
  error?: string;
}

function isSet(name: string): "set" | "missing" {
  return process.env[name]?.trim() ? "set" : "missing";
}

export async function GET() {
  const response: HealthResponse = {
    ok: true,
    checks: {
      db: "ok",
      table: "ok",
      anthropicKey: isSet("ANTHROPIC_API_KEY"),
      resendKey: isSet("RESEND_API_KEY"),
      beehiivKey: isSet("BEEHIIV_API_KEY"),
      calBookingUrl: isSet("NEXT_PUBLIC_CAL_BOOKING_URL"),
      metaPixel: isSet("NEXT_PUBLIC_META_PIXEL_ID"),
    },
  };

  // Probe the DB + table existence in one cheap query. If this
  // fails we return 503; everything else is informational.
  try {
    await db
      .select({ cnt: sql<number>`count(*)` })
      .from(diagnosticSubmissions)
      .limit(1);
  } catch (err) {
    response.ok = false;
    response.checks.db = "error";
    response.checks.table = "error";
    response.error = err instanceof Error ? err.message : String(err);
    return Response.json(response, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return Response.json(response, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
