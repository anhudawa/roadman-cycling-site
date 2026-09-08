import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

// Read-only preflight. Never prints credential values or enrolls a subscriber.
async function main() {
  const required = ["POSTGRES_URL", "BEEHIIV_API_KEY", "BEEHIIV_PUBLICATION_ID", "BEEHIIV_AUTOMATION_NDY_APPLICATION", "RESEND_API_KEY", "CRON_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(", ")}`);
  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");
  const table = await db.execute(sql`SELECT to_regclass('public.ndy_application_followups') AS name`);
  if (!table.rows[0]?.name) throw new Error("Run migration 0064 before enabling the application workflow");
  const base = `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID!.trim()}`;
  const headers = { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY!.trim()}` };
  const response = await fetch(`${base}/automations/${process.env.BEEHIIV_AUTOMATION_NDY_APPLICATION!.trim()}`, { headers, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Cannot access the configured Beehiiv automation (${response.status})`);
  const automation = await response.json();
  console.log(JSON.stringify({ databaseTable: "present", automation: automation.data, enabled: process.env.NDY_APPLICATION_FLOW_ENABLED === "true" }, null, 2));
  console.log("Confirm an active Add by API trigger, an immediate email, personalised link previews, sender/reply-to and footer in Beehiiv before enabling. No subscriber was enrolled.");
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Preflight failed"); process.exitCode = 1; });
